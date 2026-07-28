/**
 * tRPC server initialization.
 *
 * This file is SERVER ONLY. The `server-only` guard will cause a build-time
 * error if it is accidentally imported in a Client Component.
 *
 * Procedure hierarchy (each level narrows the context type):
 *  - `publicProcedure`      — no auth required (health checks, public APIs)
 *                             ctx: { headers }
 *  - `protectedProcedure`  — requires a valid Better Auth session
 *                             ctx: { headers, session }
 *  - `superAdminProcedure` — requires session + injects the main Prisma DB
 *                             ctx: { headers, session, db }
 *  - `tenantProcedure`     — requires session + injects main + tenant DBs
 *                             ctx: { headers, session, db, tenantDb }
 *  - `studentProcedure`    — requires session + STUDENT role check
 *
 * Context design:
 *  - `createTRPCContext` only forwards the raw `Headers` — it does NOT fetch
 *    the session eagerly. This keeps public procedures cheap.
 *  - Auth and DB are resolved lazily inside the respective middleware.
 */
import "server-only"

import { initTRPC, TRPCError } from "@trpc/server"
import { auth } from "@workspace/auth/server"
import { db } from "@workspace/db/main"
import type { PrismaClient, Role } from "@workspace/db/main"
import { tenantDb, getTenantDb } from "@workspace/db/tenant"
import type { TenantPrismaClient } from "@workspace/db/tenant"
import superjson from "superjson"
import { ZodError } from "zod"
import { ROLES } from "@workspace/utils"

// ---------------------------------------------------------------------------
// Context types
// ---------------------------------------------------------------------------

/**
 * Base context — always available (no auth required).
 */
export type TRPCContext = {
  headers: Headers
}

/**
 * Context after the auth middleware runs.
 * `session` is guaranteed non-null and user `roles` are bound to context.
 */
export type AuthedTRPCContext = TRPCContext & {
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>
  roles: Role[]
}

/**
 * Context available inside `superAdminProcedure`.
 */
export type SuperAdminTRPCContext = AuthedTRPCContext & {
  db: PrismaClient
}

/**
 * Context available inside `tenantProcedure`.
 */
export type TenantTRPCContext = AuthedTRPCContext & {
  db: PrismaClient
  tenantDb: TenantPrismaClient
}

/**
 * Context available inside `studentProcedure`.
 */
export type StudentTRPCContext = AuthedTRPCContext & {
  db: PrismaClient
  isOfflineStudent: boolean
}

// ---------------------------------------------------------------------------
// Context factory
// ---------------------------------------------------------------------------

/**
 * Creates the tRPC request context.
 *
 * Accepts raw `Headers` so it can be called from both:
 *  - The RSC server-side caller (via `next/headers`)
 *  - The Next.js fetch route handler (via `req.headers`)
 */
export const createTRPCContext = async (opts: {
  headers: Headers
}): Promise<TRPCContext> => {
  return {
    headers: opts.headers,
  }
}

// ---------------------------------------------------------------------------
// tRPC initialization
// ---------------------------------------------------------------------------

const t = initTRPC.context<TRPCContext>().create({
  /**
   * superjson allows tRPC to serialize/deserialize complex JS types (Date,
   * Map, Set, BigInt, etc.) transparently across the network boundary.
   *
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,

  /**
   * Custom error formatter — attaches Zod validation details to the
   * response so clients can display field-level errors.
   *
   * @see https://trpc.io/docs/server/error-formatting
   */
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

// ---------------------------------------------------------------------------
// Internal middleware
// ---------------------------------------------------------------------------

/**
 * Timing + outcome logger.
 * Dev: full error details. Prod: message only (no stack trace leakage).
 */
const loggingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now()
  const result = await next()
  const durationMs = Date.now() - start

  if (result.ok) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[tRPC] ✓ ${type} ${path} — ${durationMs}ms`)
    }
  } else {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[tRPC] ✗ ${type} ${path} — ${durationMs}ms`, result.error)
    } else {
      console.error(`[tRPC] error on ${path}: ${result.error.message}`)
    }
  }

  return result
})

// ---------------------------------------------------------------------------
// Exported helpers
// ---------------------------------------------------------------------------

/** Create a new router. */
export const createTRPCRouter = t.router

/** Used to create server-side callers for RSC. */
export const createCallerFactory = t.createCallerFactory

// ---------------------------------------------------------------------------
// Procedures
// ---------------------------------------------------------------------------

/**
 * Public procedure — no authentication required.
 * ctx: { headers }
 *
 * Safe to call from anyone (health checks, public APIs, etc.).
 */
export const publicProcedure = t.procedure.use(loggingMiddleware)

/**
 * Protected procedure — requires an authenticated Better Auth session.
 * ctx: { headers, session }
 *
 * Resolves the session lazily (only when this procedure runs), so public
 * procedures never pay the auth lookup cost.
 *
 * Throws `UNAUTHORIZED` if there is no valid session.
 */
export const protectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(async ({ ctx, next }) => {
    let session: Awaited<ReturnType<typeof auth.api.getSession>> = null
    try {
      session = await auth.api.getSession({ headers: ctx.headers })
    } catch (err) {
      console.error("[tRPC protectedProcedure] Session resolution error:", err)
    }

    if (!session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be signed in to perform this action.",
      })
    }

    let roles: Role[] = []
    if (session.user?.id) {
      const userWithRoles = await db.user.findUnique({
        where: { id: session.user.id },
        select: { roles: true },
      })
      roles = (userWithRoles?.roles as Role[]) ?? []
    }

    return next({
      ctx: {
        ...ctx,
        session,
        roles,
      },
    })
  })

/**
 * Super-admin procedure — requires a valid session AND injects the main
 * Prisma database client into the context.
 * ctx: { headers, session, db }
 *
 * Chains off `protectedProcedure` so the auth check always runs first.
 * Use for cross-tenant data, platform configuration, and management DB access.
 */
export const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  return next({
    ctx: {
      ...ctx,
      /** Main Prisma client — connected to the primary/management database. */
      db: db as PrismaClient,
    },
  })
})

/**
 * Tenant procedure — requires a valid session AND injects both the main
 * and tenant Prisma clients into the context.
 * ctx: { headers, session, db, tenantDb }
 *
 * Chains off `protectedProcedure` so the auth check always runs first.
 * Use when a procedure needs both platform-level and tenant-specific data.
 */
export const tenantProcedure = protectedProcedure.use(({ ctx, next }) => {
  const tenantId = ctx.headers.get("x-tenant-id")
  if (!tenantId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "x-tenant-id header is required for tenant procedures",
    })
  }

  return next({
    ctx: {
      ...ctx,
      /** Main Prisma client — connected to the primary/management database. */
      db: db as PrismaClient,
      /** Tenant Prisma client — scoped to the specific tenant via extension. */
      tenantDb: getTenantDb(tenantId) as TenantPrismaClient,
    },
  })
})

/**
 * Student procedure — requires a valid session with the STUDENT role
 * AND injects the main Prisma database client into the context.
 * ctx: { headers, session, roles, db }
 *
 * Chains off `protectedProcedure` so the auth check always runs first.
 * Throws `FORBIDDEN` if the user does not have the Student role.
 * Safe case-insensitive role check supports both "STUDENT" and "Student".
 */
export const studentProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const hasStudentRole = ctx.roles.some(
    (r) =>
      r.name === ROLES.STUDENT ||
      r.name?.toUpperCase() === "STUDENT" ||
      r.name === "Student",
  )

  if (!hasStudentRole) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must have the Student role to perform this action.",
    })
  }

  const student = await db.student.findUnique({
    where: { userId: ctx.session.user.id },
    select: { isOfflineStudent: true },
  })

  return next({
    ctx: {
      ...ctx,
      /** Main Prisma client — connected to the primary/management database. */
      db: db as PrismaClient,
      /** Offline student status */
      isOfflineStudent: student?.isOfflineStudent ?? false,
    },
  })
})

/**
 * Admin procedure — requires a valid session with the ADMIN or SUPER_ADMIN role
 * and injects the main Prisma database client.
 * ctx: { headers, session, roles, db }
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  const hasAdminRole = ctx.roles.some(
    (r) =>
      r.name === ROLES.SUPER_ADMIN ||
      r.name === ROLES.ADMIN ||
      r.name?.toUpperCase() === "SUPER_ADMIN" ||
      r.name?.toUpperCase() === "ADMIN" ||
      r.name === "Admin" ||
      r.name === "Super Admin",
  )

  if (!hasAdminRole) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must have an Admin or Super Admin role to perform this action.",
    })
  }

  return next({
    ctx: {
      ...ctx,
      /** Main Prisma client — connected to the primary/management database. */
      db: db as PrismaClient,
    },
  })
})

/**
 * Teacher procedure — requires a valid session with the TEACHER, ADMIN, or SUPER_ADMIN role
 * and injects the main Prisma database client.
 * ctx: { headers, session, roles, db }
 */
export const teacherProcedure = protectedProcedure.use(({ ctx, next }) => {
  const hasTeacherRole = ctx.roles.some(
    (r) =>
      r.name === ROLES.SUPER_ADMIN ||
      r.name === ROLES.ADMIN ||
      r.name === ROLES.TEACHER ||
      r.name?.toUpperCase() === "SUPER_ADMIN" ||
      r.name?.toUpperCase() === "ADMIN" ||
      r.name?.toUpperCase() === "TEACHER" ||
      r.name === "Admin" ||
      r.name === "Teacher" ||
      r.name === "Super Admin",
  )

  if (!hasTeacherRole) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must have a Teacher, Admin, or Super Admin role to perform this action.",
    })
  }

  return next({
    ctx: {
      ...ctx,
      /** Main Prisma client — connected to the primary/management database. */
      db: db as PrismaClient,
    },
  })
})

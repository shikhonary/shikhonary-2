/**
 * tRPC server initialization.
 *
 * Procedure hierarchy (each level narrows the context type):
 *  - `publicProcedure`        — no auth required (health checks, public APIs)
 *                               ctx: { headers }
 *  - `protectedProcedure`    — requires a valid Better Auth session
 *                               ctx: { headers, session }
 *  - `superAdminProcedure`   — requires session + injects the main Prisma DB
 *                               ctx: { headers, session, db }
 *  - `tenantProcedure`       — requires session + injects main + tenant DBs (header-based)
 *                               ctx: { headers, session, db, tenantDb }
 *  - `tenantMemberProcedure` — requires session + active ADMIN membership in a tenant
 *                               ctx: { headers, session, db, tenant, membership }
 *  - `adminProcedure`        — requires session + ADMIN / SUPER_ADMIN role check
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
 * Context available inside `tenantMemberProcedure`.
 * Resolved from the user's TenantMember record — no header needed.
 */
export type TenantMemberTRPCContext = AuthedTRPCContext & {
  db: PrismaClient
  tenantDb: TenantPrismaClient
  tenant: {
    id: string
    name: string
    nameBn: string | null
    slug: string
    logo: string | null
    isActive: boolean
    isSuspended: boolean
    suspendReason: string | null
  }
  membership: {
    id: string
    role: string
    isActive: boolean
    joinedAt: Date
  }
}

// ---------------------------------------------------------------------------
// Context factory
// ---------------------------------------------------------------------------

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
  transformer: superjson,
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

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

// ---------------------------------------------------------------------------
// Procedures
// ---------------------------------------------------------------------------

export const publicProcedure = t.procedure.use(loggingMiddleware)

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

export const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  return next({
    ctx: {
      ...ctx,
      db: db as PrismaClient,
    },
  })
})

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
      db: db as PrismaClient,
      tenantDb: getTenantDb(tenantId) as TenantPrismaClient,
    },
  })
})

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
      db: db as PrismaClient,
    },
  })
})

/**
 * `tenantMemberProcedure` — Tenant app authorization gate.
 *
 * Resolves the user's tenant membership from the main DB.
 * Rules:
 *  1. User must have an active TenantMember record with role "ADMIN".
 *  2. The Tenant must be active and not suspended.
 *
 * Injects `tenant` and `membership` into context.
 */
export const tenantMemberProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const membership = await db.tenantMember.findFirst({
      where: {
        userId: ctx.session.user.id,
        isActive: true,
        role: "ADMIN",
      },
      select: {
        id: true,
        role: true,
        isActive: true,
        joinedAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            nameBn: true,
            slug: true,
            logo: true,
            isActive: true,
            isSuspended: true,
            suspendReason: true,
          },
        },
      },
    })

    if (!membership) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have admin access to any tenant.",
      })
    }

    if (!membership.tenant.isActive) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This tenant is no longer active.",
      })
    }

    if (membership.tenant.isSuspended) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `This tenant is suspended${membership.tenant.suspendReason ? `: ${membership.tenant.suspendReason}` : "."}`,
      })
    }

    return next({
      ctx: {
        ...ctx,
        db: db as PrismaClient,
        tenantDb: getTenantDb(membership.tenant.id) as TenantPrismaClient,
        tenant: membership.tenant,
        membership: {
          id: membership.id,
          role: membership.role,
          isActive: membership.isActive,
          joinedAt: membership.joinedAt,
        },
      },
    })
  },
)

/**
 * `publicTenantProcedure` — Resolves the tenant database using the request Host header.
 * No session or auth required (useful for public verification/print pages).
 */
export const publicTenantProcedure = publicProcedure.use(
  async ({ ctx, next }) => {
    const host = ctx.headers.get("host") || ""
    const parts = host.split(".")
    let slug = ""

    const firstPart = parts[0]
    if (parts.length > 2 && firstPart) {
      slug = firstPart
    } else {
      const firstTenant = await db.tenant.findFirst({
        where: { isActive: true },
        select: { slug: true }
      })
      if (firstTenant) {
        slug = firstTenant.slug
      }
    }

    const tenant = await db.tenant.findFirst({
      where: {
        slug,
        isActive: true,
        isSuspended: false,
      },
      select: {
        id: true,
        name: true,
        nameBn: true,
        slug: true,
        logo: true,
        isActive: true,
        isSuspended: true,
      }
    })

    if (!tenant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tenant not found or inactive.",
      })
    }

    return next({
      ctx: {
        ...ctx,
        db: db as PrismaClient,
        tenantDb: getTenantDb(tenant.id) as TenantPrismaClient,
        tenant,
      },
    })
  },
)


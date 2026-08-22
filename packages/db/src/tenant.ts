import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/tenant/client"
import { withTenant } from "./extensions/withTenant"

export type {
  PrismaClient as TenantPrismaClient,
  FiscalYear as TenantFiscalYear,
} from "../generated/tenant/client"
export { Prisma as TenantPrisma } from "../generated/tenant/client"


const globalForPrisma = globalThis as unknown as {
  tenantDb: PrismaClient | undefined
  // Cache dedicated PrismaClient instances keyed by connection string.
  // This prevents spawning a new client (and pool) on every request.
  tenantClientCache: Map<string, PrismaClient> | undefined
}

function createTenantDb() {
  const connectionString = process.env.TENANT_DATABASE_URL || process.env.DATABASE_URL
  if (!connectionString) {
    console.warn("TENANT_DATABASE_URL is not set in the environment. Using fallback for build phase.")
  }
  const adapter = new PrismaPg({
    connectionString: connectionString || "postgresql://postgres:postgres@localhost:5432/dummy_tenant",
  })
  return new PrismaClient({ adapter })
}

export const tenantDb = globalForPrisma.tenantDb ?? createTenantDb()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.tenantDb = tenantDb
}

// Initialise the dedicated-client cache once per process
const tenantClientCache: Map<string, PrismaClient> =
  globalForPrisma.tenantClientCache ?? new Map()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.tenantClientCache = tenantClientCache
}

/**
 * Returns a tenant-scoped database client.
 *
 * If `connectionString` is provided (the tenant's dedicated database), a
 * PrismaClient for that exact connection is returned, cached by connection
 * string so we never open duplicate pools. This is the production path for
 * fully isolated tenant databases.
 *
 * If no connection string is provided the function falls back to the shared
 * `tenantDb` (pointed at TENANT_DATABASE_URL) with the `withTenant` Prisma
 * extension applied, which enforces per-query tenantId filtering. This is
 * the correct path for local development where all tenants share one DB.
 *
 * The `withTenant` extension is always applied regardless of path so that
 * the tenantId is automatically injected/enforced on every query.
 */
export function getTenantDb(tenantId: string, connectionString?: string | null) {
  if (!tenantId) {
    throw new Error("getTenantDb requires a valid tenantId")
  }

  if (connectionString) {
    // Use/create a cached PrismaClient for this dedicated database
    let client = tenantClientCache.get(connectionString)
    if (!client) {
      const adapter = new PrismaPg({ connectionString })
      client = new PrismaClient({ adapter })
      tenantClientCache.set(connectionString, client)
    }
    return client.$extends(withTenant(tenantId))
  }

  // Shared database fallback — withTenant extension enforces row-level isolation
  return tenantDb.$extends(withTenant(tenantId))
}



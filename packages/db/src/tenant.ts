import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/tenant/client"
import { withTenant } from "./extensions/withTenant"

export type {
  PrismaClient as TenantPrismaClient,
  Ward,
  TaxPayer,
  TaxPayment,
  FiscalYear as TenantFiscalYear,
} from "../generated/tenant/client"
export { Prisma as TenantPrisma } from "../generated/tenant/client"


const globalForPrisma = globalThis as unknown as {
  tenantDb: PrismaClient | undefined
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

/**
 * Returns a tenant-scoped database client.
 * This client will automatically inject and enforce the `tenantId`
 * on all queries to ensure tenant isolation.
 */
export function getTenantDb(tenantId: string) {
  if (!tenantId) {
    throw new Error("getTenantDb requires a valid tenantId")
  }
  return tenantDb.$extends(withTenant(tenantId))
}


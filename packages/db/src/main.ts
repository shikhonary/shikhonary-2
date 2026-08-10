import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/main/client"

export type {
  PrismaClient,
  Role,
  User,
  Tenant,
  TenantMember,
  TenantInvitation,
  SubscriptionPlan,
  Subscription,
  SubscriptionHistory,
  Invoice,
  FiscalYear,
} from "../generated/main/client"
export { Prisma } from "../generated/main/client"

const globalForPrisma = globalThis as unknown as {
  mainDb: PrismaClient | undefined
}

function createMainDb() {
  const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL
  if (!connectionString) {
    console.warn("MAIN_DATABASE_URL is not set in the environment. Using fallback for build phase.")
  }
  const adapter = new PrismaPg({
    connectionString: connectionString || "postgresql://postgres:postgres@localhost:5432/dummy_main",
  })
  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.mainDb ?? createMainDb()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.mainDb = db
}

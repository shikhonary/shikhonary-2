import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/main/client"

export type {
  PrismaClient,
  Role,
  User,
  Tenant,
  TenantMember,
  TenantInvitation,
  OnboardingApplication,
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
    if (
      process.env.NODE_ENV === "production" &&
      process.env.NEXT_PHASE !== "phase-production-build"
    ) {
      throw new Error("[DB Main] MAIN_DATABASE_URL (or DATABASE_URL) environment variable is required in production.")
    }
    console.warn("[DB Main] MAIN_DATABASE_URL is not set. Using fallback for build phase.")
  }
  const adapter = new PrismaPg({
    connectionString: connectionString || "postgresql://postgres:postgres@localhost:5432/dummy_main",
  })
  return new PrismaClient({ adapter })
}

function getMainDb(): PrismaClient {
  if (!globalForPrisma.mainDb || !(globalForPrisma.mainDb as any).onboardingApplication) {
    globalForPrisma.mainDb = createMainDb()
  }
  return globalForPrisma.mainDb
}

export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const instance = getMainDb()
    const value = Reflect.get(instance, prop, receiver)
    return typeof value === "function" ? value.bind(instance) : value
  },
})

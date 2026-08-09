import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/tenant/client.js"

const connectionString = process.env.TENANT_DATABASE_URL
if (!connectionString) {
  console.error("ERROR: TENANT_DATABASE_URL is not set in environment variables.")
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding tenant database...")
  // Add seed logic here
  console.log("Tenant database seeded successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

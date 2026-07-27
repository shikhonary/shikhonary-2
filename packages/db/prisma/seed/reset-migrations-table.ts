import { config } from "dotenv"
import { resolve } from "node:path"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/main/client.js"

config({ path: resolve(import.meta.dirname, "../../.env") })

const connectionString = process.env.MAIN_DATABASE_URL
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Truncating _prisma_migrations table in Neon DB...")
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "_prisma_migrations";`)
  console.log("_prisma_migrations table truncated successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

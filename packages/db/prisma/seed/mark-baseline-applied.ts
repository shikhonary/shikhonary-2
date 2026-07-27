import { config } from "dotenv"
import { resolve } from "node:path"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/main/client.js"

config({ path: resolve(import.meta.dirname, "../../.env") })

const connectionString = process.env.MAIN_DATABASE_URL
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Recording baseline migration in _prisma_migrations...")
  const migrationName = "20260727000000_init"
  const checksum = "0000000000000000000000000000000000000000000000000000000000000000"
  
  await prisma.$executeRawUnsafe(`
    INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
    VALUES (gen_random_uuid(), '${checksum}', NOW(), '${migrationName}', NULL, NULL, NOW(), 1)
    ON CONFLICT ("migration_name") DO NOTHING;
  `)
  console.log(`Migration ${migrationName} successfully recorded!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

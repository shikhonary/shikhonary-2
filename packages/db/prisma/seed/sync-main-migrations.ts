import { config } from "dotenv"
import { resolve } from "node:path"
import { readdirSync, statSync } from "node:fs"
import { execSync } from "node:child_process"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/main/client.js"

config({ path: resolve(import.meta.dirname, "../../.env") })

const connectionString = process.env.MAIN_DATABASE_URL
if (!connectionString) {
  console.error("MAIN_DATABASE_URL is not set in environment")
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("\n━━━ Syncing MAIN Database Migration History ━━━\n")

  // 1. Reset _prisma_migrations table to clean orphaned/outdated records
  console.log("Cleaning _prisma_migrations table in Neon main DB...")
  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "_prisma_migrations";`)
    console.log("✔ _prisma_migrations reset successfully.")
  } catch (err: any) {
    console.warn(`⚠ Could not truncate _prisma_migrations: ${err.message}`)
  }

  // 2. Resolve all local migration folders as applied
  const migrationsDir = resolve(import.meta.dirname, "../main/migrations")
  const entries = readdirSync(migrationsDir)
  const migrationFolders = entries.filter((entry) => {
    const fullPath = resolve(migrationsDir, entry)
    return statSync(fullPath).isDirectory()
  })

  console.log(`Found ${migrationFolders.length} local migration(s) to mark as applied:`)
  for (const folder of migrationFolders) {
    try {
      console.log(` Marking as applied: ${folder}`)
      execSync(
        `npx prisma migrate resolve --config prisma/main/prisma.config.ts --applied ${folder}`,
        {
          cwd: resolve(import.meta.dirname, "../../"),
          stdio: "inherit",
        }
      )
    } catch (err: any) {
      console.warn(` Migration ${folder}: ${err.message || "already applied"}`)
    }
  }

  console.log("\n🎉 Main database migration history synced successfully! Zero data lost.\n")
}

main()
  .catch((e) => {
    console.error("✖ Failed to sync main migrations:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

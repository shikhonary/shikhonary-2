import { readdirSync, statSync } from "node:fs"
import { join, resolve } from "node:path"
import { execSync } from "node:child_process"

const migrationsDir = resolve(import.meta.dirname, "../main/migrations")
const entries = readdirSync(migrationsDir)

const migrationFolders = entries.filter((entry) => {
  const fullPath = join(migrationsDir, entry)
  return statSync(fullPath).isDirectory()
})

console.log(`Found ${migrationFolders.length} migrations to resolve...`)

for (const folder of migrationFolders) {
  try {
    console.log(`Resolving migration: ${folder}`)
    execSync(
      `npx prisma migrate resolve --config prisma/main/prisma.config.ts --applied ${folder}`,
      {
        cwd: resolve(import.meta.dirname, "../../"),
        stdio: "inherit",
      }
    )
  } catch (err: any) {
    console.warn(`Migration ${folder} status: ${err.message || "already applied"}`)
  }
}

console.log("All migrations resolved successfully!")

/**
 * Database Cleanup Script (Preserving Mandori Tenant)
 *
 * Drops all created tenant databases (e.g. tenant_xxx) on the PostgreSQL server,
 * preserving only "neondb", "postgres", "tenant_mandori", and system template databases.
 */

import { config } from "dotenv"
import { resolve } from "node:path"
import { Pool } from "pg"

// Load env from the root of the db package
config({ path: resolve(import.meta.dirname, "../../.env") })

function parseConnectionString(connectionString: string) {
  const url = new URL(connectionString)
  return {
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: url.port || "5432",
    database: url.pathname.slice(1),
    sslmode: url.searchParams.get("sslmode") || "require",
  }
}

async function cleanDatabases() {
  const masterConnectionString = process.env.DATABASE_URL || process.env.MAIN_DATABASE_URL
  if (!masterConnectionString) {
    console.error("\x1b[31m✖ DATABASE_URL is not set in environment\x1b[0m")
    process.exit(1)
  }

  const masterConfig = parseConnectionString(masterConnectionString)

  console.log("\n\x1b[33m━━━ Cleaning PostgreSQL Databases (Preserving neondb & tenant_mandori) ━━━\x1b[0m\n")

  const systemPool = new Pool({
    host: masterConfig.host,
    port: parseInt(masterConfig.port),
    user: masterConfig.user,
    password: masterConfig.password,
    database: masterConfig.database || "postgres",
    ssl: masterConfig.sslmode === "disable" ? false : { rejectUnauthorized: false },
  })

  try {
    // Query all databases excluding neondb, postgres, tenant_mandori, template0, template1
    const res = await systemPool.query(
      `SELECT datname FROM pg_database WHERE datname NOT IN ('neondb', 'postgres', 'tenant_mandori', 'template0', 'template1')`
    )

    const databases = res.rows.map((row: any) => row.datname)

    if (databases.length === 0) {
      console.log("\x1b[32m✔ No extra tenant databases found. Only 'neondb' and 'tenant_mandori' exist.\x1b[0m\n")
      return
    }

    console.log(`Found ${databases.length} extra database(s) to remove:`)
    databases.forEach((db: string) => console.log(` - ${db}`))
    console.log("")

    for (const dbName of databases) {
      try {
        // Terminate active connections before dropping
        await systemPool.query(
          `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
          [dbName]
        )
        await systemPool.query(`DROP DATABASE IF EXISTS "${dbName}"`)
        console.log(`\x1b[32m✔ Dropped database: "${dbName}"\x1b[0m`)
      } catch (err: any) {
        console.error(`\x1b[31m✖ Failed to drop "${dbName}": ${err.message}\x1b[0m`)
      }
    }

    console.log("\n\x1b[32m🎉 Cleanup finished. All databases except 'neondb' and 'tenant_mandori' deleted successfully!\x1b[0m\n")
  } catch (err: any) {
    console.error("\x1b[31m✖ Cleanup query failed:\x1b[0m", err.message)
  } finally {
    await systemPool.end()
  }
}

cleanDatabases().catch((e) => {
  console.error(e)
  process.exit(1)
})

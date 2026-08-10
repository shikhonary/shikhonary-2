import "dotenv/config"
import pg from "pg"

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error("ERROR: MAIN_DATABASE_URL is not set.")
  process.exit(1)
}

const pool = new pg.Pool({ connectionString })

async function main() {
  console.log("Preparing database for Tenant relations migration...")
  const client = await pool.connect()
  try {
    // Clear existing test rows in subscription and fiscal_year that have no matching tenant
    await client.query("DELETE FROM subscription;")
    await client.query("DELETE FROM fiscal_year;")
    console.log("Cleared existing test rows from 'subscription' and 'fiscal_year' tables.")
  } finally {
    client.release()
  }
}

main()
  .catch((err) => {
    console.error("Preparation error:", err)
  })
  .finally(async () => {
    await pool.end()
  })

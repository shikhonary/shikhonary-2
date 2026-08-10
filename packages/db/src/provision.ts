import { Pool } from "pg"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs"

const execAsync = promisify(exec)

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

function buildConnectionString(
  user: string,
  password: string,
  host: string,
  port: string,
  database: string,
  sslmode: string
): string {
  return `postgresql://${user}:${password}@${host}:${port}/${database}?sslmode=${sslmode}`
}

export async function provisionTenantDb(tenantSlug: string) {
  const masterConnectionString = process.env.DATABASE_URL
  if (!masterConnectionString) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  const tenantDbName = `tenant_${tenantSlug.replace(/-/g, "_")}`
  const masterConfig = parseConnectionString(masterConnectionString)

  console.log(`[Provisioning] Creating database "${tenantDbName}"...`)

  // Connect to postgres system database with SSL fallback
  const systemPool = new Pool({
    host: masterConfig.host,
    port: parseInt(masterConfig.port),
    user: masterConfig.user,
    password: masterConfig.password,
    database: "postgres",
    ssl: masterConfig.sslmode === "disable" ? false : { rejectUnauthorized: false },
  })

  try {
    const existing = await systemPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [tenantDbName]
    )

    if ((existing.rowCount ?? 0) === 0) {
      await systemPool.query(`CREATE DATABASE "${tenantDbName}"`)
      console.log(`[Provisioning] Database "${tenantDbName}" created successfully!`)
    } else {
      console.log(`[Provisioning] Database "${tenantDbName}" already exists.`)
    }
  } catch (err: any) {
    console.error(`[Provisioning Error] CREATE DATABASE query failed:`, err.message)
    throw err
  } finally {
    await systemPool.end()
  }

  const tenantConnectionString = buildConnectionString(
    masterConfig.user,
    masterConfig.password,
    masterConfig.host,
    masterConfig.port,
    tenantDbName,
    masterConfig.sslmode
  )

  const rootDir = process.cwd().includes("apps")
    ? path.join(process.cwd(), "../..")
    : process.cwd()

  const schemaPath = path
    .resolve(rootDir, "packages/db/prisma/tenant/schema.prisma")
    .replace(/\\/g, "/")

  const configPath = path
    .resolve(rootDir, "packages/db/prisma/tenant/prisma.config.ts")
    .replace(/\\/g, "/")

  // Find exact prisma binary path inside packages/db/node_modules/.bin/
  let prismaBinPath = path.resolve(rootDir, "packages/db/node_modules/.bin/prisma.CMD").replace(/\\/g, "/")
  if (!fs.existsSync(prismaBinPath)) {
    prismaBinPath = path.resolve(rootDir, "packages/db/node_modules/.bin/prisma").replace(/\\/g, "/")
  }

  const migrateCmd = `"${prismaBinPath}" db push --schema="${schemaPath}" --config="${configPath}"`

  console.log(`[Provisioning] Executing schema push: ${migrateCmd}`)

  try {
    const { stdout, stderr } = await execAsync(migrateCmd, {
      env: {
        ...process.env,
        DATABASE_URL: tenantConnectionString,
        TENANT_DATABASE_URL: tenantConnectionString,
      },
    })
    if (stdout) console.log(stdout)
    if (stderr && !stderr.toLowerCase().includes("warn")) console.warn(stderr)
    console.log(`[Provisioning] Schema pushed successfully to database "${tenantDbName}".`)
  } catch (err: any) {
    console.error(`[Provisioning Error] Schema push failed:`, err.message)
    if (err.stdout) console.log(err.stdout)
    if (err.stderr) console.error(err.stderr)
    throw err
  }

  return {
    success: true,
    databaseName: tenantDbName,
    connectionString: tenantConnectionString,
  }
}

export async function deleteTenantDb(databaseName: string) {
  const masterConnectionString = process.env.DATABASE_URL
  if (!masterConnectionString) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  const masterConfig = parseConnectionString(masterConnectionString)

  console.log(`[Deprovisioning] Dropping database "${databaseName}"...`)

  const systemPool = new Pool({
    host: masterConfig.host,
    port: parseInt(masterConfig.port),
    user: masterConfig.user,
    password: masterConfig.password,
    database: "postgres",
    ssl: masterConfig.sslmode === "disable" ? false : { rejectUnauthorized: false },
  })

  try {
    // Terminate existing active connections to target database
    await systemPool.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [databaseName]
    )

    await systemPool.query(`DROP DATABASE IF EXISTS "${databaseName}"`)
    console.log(`[Deprovisioning] Database "${databaseName}" dropped successfully!`)
  } catch (err: any) {
    console.error(`[Deprovisioning Error] DROP DATABASE query failed:`, err.message)
    throw err
  } finally {
    await systemPool.end()
  }
}

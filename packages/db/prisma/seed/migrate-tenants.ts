import "dotenv/config"
import { db as prisma } from "../../src/main"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs"

const execAsync = promisify(exec)

async function main() {
  const args = process.argv.slice(2)
  const isDeploy = args.includes("--deploy") || args.includes("deploy")
  const action = isDeploy ? "deploy" : "push"

  console.log(`\n=== Starting Tenant Database Migration Script (${action.toUpperCase()}) ===\n`)

  // 1. Fetch all tenants with dedicated databases
  const tenants = await prisma.tenant.findMany({
    where: {
      connectionString: { not: null },
      databaseStatus: "READY",
    },
    select: {
      id: true,
      slug: true,
      name: true,
      databaseName: true,
      connectionString: true,
    },
  })

  if (tenants.length === 0) {
    console.log("No tenants with dedicated databases found.")
    return
  }

  console.log(`Found ${tenants.length} tenant(s) to process:`)
  tenants.forEach((t) => console.log(` - ${t.name} (${t.slug})`))
  console.log("")

  const rootDir = process.cwd().includes("apps") || process.cwd().includes("packages")
    ? path.join(process.cwd(), "../..")
    : process.cwd()

  const schemaPath = path
    .resolve(rootDir, "packages/db/prisma/tenant/schema.prisma")
    .replace(/\\/g, "/")

  const configPath = path
    .resolve(rootDir, "packages/db/prisma/tenant/prisma.config.ts")
    .replace(/\\/g, "/")

  // Find exact prisma binary path
  let prismaBinPath = path.resolve(rootDir, "packages/db/node_modules/.bin/prisma.CMD").replace(/\\/g, "/")
  if (!fs.existsSync(prismaBinPath)) {
    prismaBinPath = path.resolve(rootDir, "packages/db/node_modules/.bin/prisma").replace(/\\/g, "/")
  }

  const baseCmd = isDeploy
    ? `"${prismaBinPath}" migrate deploy --schema="${schemaPath}" --config="${configPath}"`
    : `"${prismaBinPath}" db push --schema="${schemaPath}" --config="${configPath}" --accept-data-loss`

  for (const tenant of tenants) {
    console.log(`[${tenant.slug}] Running command for database: "${tenant.databaseName}"...`)
    
    // We need to resolve direct connection string or replace pooler host if needed
    const directConnectionString = tenant.connectionString!.replace("-pooler", "")

    try {
      const { stdout, stderr } = await execAsync(baseCmd, {
        env: {
          ...process.env,
          DATABASE_URL: directConnectionString,
          TENANT_DATABASE_URL: directConnectionString,
          PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "use tenants:migrate",
        },
      })
      if (stdout) console.log(stdout)
      if (stderr && !stderr.toLowerCase().includes("warn")) console.warn(stderr)
      console.log(`✔ [${tenant.slug}] Database updated successfully!\n`)
    } catch (err: any) {
      console.error(`❌ [${tenant.slug}] Database update failed:`, err.message)
      if (err.stdout) console.log(err.stdout)
      if (err.stderr) console.error(err.stderr)
    }
  }

  console.log("=== All tenant database updates processed! ===")
}

main()
  .catch((e) => {
    console.error("Migration error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

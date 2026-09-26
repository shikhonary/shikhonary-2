import { config } from "dotenv"
import { resolve } from "node:path"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/main/client.js"

// Load env from workspace root .env or package .env
config({ path: resolve(import.meta.dirname, "../../../.env") })
config({ path: resolve(import.meta.dirname, "../.env") })
config()

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error("\x1b[31m✖ MAIN_DATABASE_URL or DATABASE_URL is not set in environment.\x1b[0m")
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const TARGET_SOURCE = "বৃত্তি সহায়িকা"

async function main() {
  const isDryRun = process.argv.includes("--dry-run")
  const customSourceArg = process.argv.find((arg) => arg.startsWith("--source="))
  const targetSource = customSourceArg
    ? customSourceArg.split("=")[1]
    : process.env.SOURCE_VALUE || TARGET_SOURCE

  const now = new Date()
  // Local midnight today
  const startOfTodayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  // UTC midnight today
  const startOfTodayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  // Use earlier boundary to make sure we don't miss records created earlier today in either timezone
  const startOfToday = startOfTodayLocal < startOfTodayUtc ? startOfTodayLocal : startOfTodayUtc

  console.log("\n\x1b[36m━━━ Update Today's Word Meaning Source ━━━\x1b[0m")
  console.log(`Mode               : \x1b[33m${isDryRun ? "DRY RUN (no database changes)" : "LIVE UPDATE"}\x1b[0m`)
  console.log(`Target Source      : \x1b[32m"${targetSource}"\x1b[0m`)
  console.log(`Current Time (now) : ${now.toISOString()} (${now.toLocaleString()})`)
  console.log(`Filter (gte)       : ${startOfToday.toISOString()} (${startOfToday.toLocaleString()})\n`)

  console.log("Fetching WordMeaning records created today...")

  const records = await prisma.wordMeaning.findMany({
    where: {
      createdAt: {
        gte: startOfToday,
      },
    },
    select: {
      id: true,
      word: true,
      meaning: true,
      source: true,
      session: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (records.length === 0) {
    console.log(`\x1b[33m⚠ No WordMeaning records found created today (>= ${startOfToday.toISOString()}).\x1b[0m`)
    return
  }

  console.log(`\x1b[34m✔ Found ${records.length} record(s) created today:\x1b[0m\n`)

  const tableData = records.map((record, index) => ({
    "#": index + 1,
    ID: record.id,
    Word: record.word,
    Meaning: record.meaning ? record.meaning.slice(0, 30) : "",
    "Old Source": record.source ?? "(null)",
    "New Source": targetSource,
    Session: record.session ?? "",
    "Created At": record.createdAt.toISOString(),
  }))

  console.table(tableData)

  if (isDryRun) {
    console.log(`\n\x1b[33m[DRY RUN] Would update ${records.length} record(s) with source: "${targetSource}".\x1b[0m\n`)
    return
  }

  const recordIds = records.map((r) => r.id)
  const updateResult = await prisma.wordMeaning.updateMany({
    where: {
      id: { in: recordIds },
    },
    data: {
      source: targetSource,
    },
  })

  console.log(
    `\n\x1b[32m✔ Successfully updated ${updateResult.count} WordMeaning record(s) to source "${targetSource}".\x1b[0m\n`
  )
}

main()
  .catch((err) => {
    console.error("\x1b[31mFatal error:\x1b[0m", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

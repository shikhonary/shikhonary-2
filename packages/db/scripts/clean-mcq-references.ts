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

// Target reference items to remove
const TARGET_REFERENCES_RAW = [
  "জ্ঞান",
  "অনুধাবন",
  "প্রয়োগ",
  "প্রয়োগ",
  "উচ্চতর দক্ষতা",
]

// Normalize for robust comparison
const TARGET_SET = new Set(
  TARGET_REFERENCES_RAW.flatMap((item) => [
    item.trim(),
    item.trim().normalize("NFC"),
    item.trim().normalize("NFD"),
  ])
)

function isTargetReference(ref: string): boolean {
  const trimmed = ref.trim()
  return (
    TARGET_SET.has(trimmed) ||
    TARGET_SET.has(trimmed.normalize("NFC")) ||
    TARGET_SET.has(trimmed.normalize("NFD"))
  )
}

async function cleanMcqReferences() {
  const isDryRun = process.argv.includes("--dry-run")

  console.log("\n\x1b[36m━━━ MCQ Reference Cleanup Script ━━━\x1b[0m")
  console.log(`Mode: \x1b[33m${isDryRun ? "DRY RUN (no database changes)" : "LIVE UPDATE"}\x1b[0m`)
  console.log(`Targets to remove: \x1b[32m${[...new Set(TARGET_REFERENCES_RAW)].join(", ")}\x1b[0m\n`)

  // Find all MCQs that have non-empty reference array
  const mcqs = await prisma.mcq.findMany({
    where: {
      NOT: {
        reference: {
          equals: [],
        },
      },
    },
    select: {
      id: true,
      question: true,
      reference: true,
    },
  })

  console.log(`Found \x1b[33m${mcqs.length}\x1b[0m MCQ(s) with non-empty references.\n`)

  const updates: { id: string; oldRef: string[]; newRef: string[]; question: string }[] = []

  for (const mcq of mcqs) {
    if (!Array.isArray(mcq.reference) || mcq.reference.length === 0) {
      continue
    }

    const filtered = mcq.reference.filter((ref) => !isTargetReference(ref))

    if (filtered.length !== mcq.reference.length) {
      updates.push({
        id: mcq.id,
        oldRef: mcq.reference,
        newRef: filtered,
        question: mcq.question,
      })
    }
  }

  if (updates.length === 0) {
    console.log("\x1b[32m✔ No MCQs found containing the target references. All clean!\x1b[0m\n")
    return
  }

  console.log(`Found \x1b[33m${updates.length}\x1b[0m MCQ(s) that require reference cleanup:`)
  const sampleCount = Math.min(updates.length, 5)
  for (let i = 0; i < sampleCount; i++) {
    const u = updates[i]!
    console.log(`\n  [${i + 1}] ID: ${u.id}`)
    console.log(`      Question: ${u.question.substring(0, 60)}...`)
    console.log(`      Before: [ ${u.oldRef.map((r) => `"${r}"`).join(", ")} ]`)
    console.log(`      After:  [ ${u.newRef.map((r) => `"${r}"`).join(", ")} ]`)
  }
  if (updates.length > sampleCount) {
    console.log(`\n  ... and ${updates.length - sampleCount} more MCQ(s).`)
  }

  if (isDryRun) {
    console.log("\n\x1b[33m[DRY RUN] No updates were made to the database.\x1b[0m\n")
    return
  }

  console.log(`\n\x1b[34mApplying updates in batches to ${updates.length} MCQ(s)...\x1b[0m`)

  const BATCH_SIZE = 25
  let updatedCount = 0

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE)
    await prisma.$transaction(
      batch.map((item) =>
        prisma.mcq.update({
          where: { id: item.id },
          data: { reference: item.newRef },
        })
      ),
      { timeout: 30000 }
    )
    updatedCount += batch.length
    process.stdout.write(`\rProgress: ${updatedCount}/${updates.length} MCQs updated...`)
  }

  console.log(`\n\n\x1b[32m✔ Successfully updated ${updatedCount} MCQ(s) in the database!\x1b[0m\n`)
}

cleanMcqReferences()
  .catch((e) => {
    console.error("\x1b[31m✖ Error during reference cleanup:\x1b[0m", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

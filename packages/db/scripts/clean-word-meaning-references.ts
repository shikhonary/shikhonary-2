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

function shouldRemoveReference(ref: string): boolean {
  if (!ref || typeof ref !== "string") return false
  const trimmed = ref.trim()
  const nfc = trimmed.normalize("NFC")
  const nfd = trimmed.normalize("NFD")

  return (
    trimmed.startsWith("পাঠ") ||
    nfc.startsWith("পাঠ") ||
    nfd.startsWith("পাঠ")
  )
}

async function cleanWordMeaningReferences() {
  const isDryRun = process.argv.includes("--dry-run")

  console.log("\n\x1b[36m━━━ Word Meaning Reference Cleanup Script ━━━\x1b[0m")
  console.log(`Mode: \x1b[33m${isDryRun ? "DRY RUN (no database changes)" : "LIVE UPDATE"}\x1b[0m`)
  console.log(`Condition: Remove any reference starting with \x1b[32m"পাঠ"\x1b[0m\n`)

  // Fetch all WordMeaning records that have non-empty reference array
  const wordMeanings = await prisma.wordMeaning.findMany({
    where: {
      NOT: {
        reference: {
          equals: [],
        },
      },
    },
    select: {
      id: true,
      word: true,
      meaning: true,
      reference: true,
    },
  })

  console.log(`Total WordMeaning records with references: \x1b[34m${wordMeanings.length}\x1b[0m`)

  const toUpdate: {
    id: string
    word: string
    oldReferences: string[]
    newReferences: string[]
    removed: string[]
  }[] = []

  for (const wm of wordMeanings) {
    const oldRefs = wm.reference || []
    const newRefs = oldRefs.filter((ref) => !shouldRemoveReference(ref))

    if (newRefs.length !== oldRefs.length) {
      const removed = oldRefs.filter((ref) => shouldRemoveReference(ref))
      toUpdate.push({
        id: wm.id,
        word: wm.word,
        oldReferences: oldRefs,
        newReferences: newRefs,
        removed,
      })
    }
  }

  console.log(`Records containing "পাঠ..." references to clean: \x1b[33m${toUpdate.length}\x1b[0m\n`)

  if (toUpdate.length === 0) {
    console.log("\x1b[32m✔ No WordMeaning records needed cleanup.\x1b[0m\n")
    await prisma.$disconnect()
    return
  }

  // Print sample or all items
  toUpdate.forEach((item, idx) => {
    console.log(
      `[${idx + 1}/${toUpdate.length}] Word: "${item.word}" (ID: ${item.id})`
    )
    console.log(`   Removed : [ ${item.removed.map((r) => `"${r}"`).join(", ")} ]`)
    console.log(`   Before  : [ ${item.oldReferences.map((r) => `"${r}"`).join(", ")} ]`)
    console.log(`   After   : [ ${item.newReferences.map((r) => `"${r}"`).join(", ")} ]\n`)
  })

  if (!isDryRun) {
    console.log("Updating database records...")
    let updatedCount = 0

    // Batch update in chunks with timeout
    const chunkSize = 20
    for (let i = 0; i < toUpdate.length; i += chunkSize) {
      const chunk = toUpdate.slice(i, i + chunkSize)
      await Promise.all(
        chunk.map((item) =>
          prisma.wordMeaning.update({
            where: { id: item.id },
            data: { reference: item.newReferences },
          })
        )
      )
      updatedCount += chunk.length
      process.stdout.write(`\rProgress: ${updatedCount}/${toUpdate.length} records updated...`)
    }

    console.log(`\n\x1b[32m✔ Successfully updated ${updatedCount} WordMeaning records.\x1b[0m\n`)
  } else {
    console.log("\x1b[33m[DRY RUN] No database records were modified.\x1b[0m\n")
  }

  await prisma.$disconnect()
}

cleanWordMeaningReferences().catch((err) => {
  console.error("\x1b[31m✖ Error during cleanup:\x1b[0m", err)
  process.exit(1)
})

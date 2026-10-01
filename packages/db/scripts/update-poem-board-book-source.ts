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

const TARGET_REF = "বোর্ড বই"

function isBoardBookRef(ref: string): boolean {
  if (!ref || typeof ref !== "string") return false
  const trimmed = ref.trim()
  const nfc = trimmed.normalize("NFC")
  const nfd = trimmed.normalize("NFD")

  return (
    trimmed === TARGET_REF ||
    nfc === TARGET_REF ||
    nfd === TARGET_REF ||
    trimmed === "বোর্ডবই" ||
    nfc === "বোর্ডবই" ||
    nfd === "বোর্ডবই" ||
    trimmed.includes("বোর্ড বই") ||
    nfc.includes("বোর্ড বই") ||
    nfd.includes("বোর্ড বই")
  )
}

async function updatePoemBoardBookSource() {
  const isDryRun = process.argv.includes("--dry-run")

  console.log("\n\x1b[36m━━━ Poem Board Book Reference to Source Script ━━━\x1b[0m")
  console.log(`Mode: \x1b[33m${isDryRun ? "DRY RUN (no database changes)" : "LIVE UPDATE"}\x1b[0m`)
  console.log(`Condition: Find reference containing \x1b[32m"${TARGET_REF}"\x1b[0m -> remove from reference and set source to \x1b[32m"${TARGET_REF}"\x1b[0m\n`)

  // 1. Fetch Poem records
  const poems = await prisma.poem.findMany({
    where: {
      NOT: {
        reference: {
          equals: [],
        },
      },
    },
    select: {
      id: true,
      title: true,
      source: true,
      reference: true,
    },
  })

  console.log(`Total Poem records with references: \x1b[34m${poems.length}\x1b[0m`)

  const toUpdatePoems: {
    id: string
    title: string
    oldSource: string | null
    newSource: string
    oldReferences: string[]
    newReferences: string[]
    removed: string[]
  }[] = []

  for (const poem of poems) {
    const oldRefs = poem.reference || []
    const newRefs = oldRefs.filter((ref) => !isBoardBookRef(ref))

    if (newRefs.length !== oldRefs.length) {
      const removed = oldRefs.filter((ref) => isBoardBookRef(ref))
      toUpdatePoems.push({
        id: poem.id,
        title: poem.title,
        oldSource: poem.source,
        newSource: TARGET_REF,
        oldReferences: oldRefs,
        newReferences: newRefs,
        removed,
      })
    }
  }

  // 2. Also check PoemEssence records if any
  const poemEssences = await prisma.poemEssence.findMany({
    where: {
      NOT: {
        reference: {
          equals: [],
        },
      },
    },
    select: {
      id: true,
      title: true,
      source: true,
      reference: true,
    },
  })

  const toUpdatePoemEssences: {
    id: string
    title: string
    oldSource: string | null
    newSource: string
    oldReferences: string[]
    newReferences: string[]
    removed: string[]
  }[] = []

  for (const pe of poemEssences) {
    const oldRefs = pe.reference || []
    const newRefs = oldRefs.filter((ref) => !isBoardBookRef(ref))

    if (newRefs.length !== oldRefs.length) {
      const removed = oldRefs.filter((ref) => isBoardBookRef(ref))
      toUpdatePoemEssences.push({
        id: pe.id,
        title: pe.title,
        oldSource: pe.source,
        newSource: TARGET_REF,
        oldReferences: oldRefs,
        newReferences: newRefs,
        removed,
      })
    }
  }

  console.log(`Poem records to update: \x1b[33m${toUpdatePoems.length}\x1b[0m`)
  console.log(`PoemEssence records to update: \x1b[33m${toUpdatePoemEssences.length}\x1b[0m\n`)

  if (toUpdatePoems.length === 0 && toUpdatePoemEssences.length === 0) {
    console.log("\x1b[32m✔ No records found needing update.\x1b[0m\n")
    await prisma.$disconnect()
    return
  }

  // Print details for Poem
  if (toUpdatePoems.length > 0) {
    console.log("\x1b[35m--- Poem Records ---\x1b[0m")
    toUpdatePoems.forEach((item, idx) => {
      console.log(`[${idx + 1}/${toUpdatePoems.length}] Poem: "${item.title}" (ID: ${item.id})`)
      console.log(`   Source     : ${item.oldSource ? `"${item.oldSource}"` : "null"} -> "${item.newSource}"`)
      console.log(`   Removed Ref: [ ${item.removed.map((r) => `"${r}"`).join(", ")} ]`)
      console.log(`   Before Ref : [ ${item.oldReferences.map((r) => `"${r}"`).join(", ")} ]`)
      console.log(`   After Ref  : [ ${item.newReferences.map((r) => `"${r}"`).join(", ")} ]\n`)
    })
  }

  // Print details for PoemEssence
  if (toUpdatePoemEssences.length > 0) {
    console.log("\x1b[35m--- PoemEssence Records ---\x1b[0m")
    toUpdatePoemEssences.forEach((item, idx) => {
      console.log(`[${idx + 1}/${toUpdatePoemEssences.length}] PoemEssence: "${item.title}" (ID: ${item.id})`)
      console.log(`   Source     : ${item.oldSource ? `"${item.oldSource}"` : "null"} -> "${item.newSource}"`)
      console.log(`   Removed Ref: [ ${item.removed.map((r) => `"${r}"`).join(", ")} ]`)
      console.log(`   Before Ref : [ ${item.oldReferences.map((r) => `"${r}"`).join(", ")} ]`)
      console.log(`   After Ref  : [ ${item.newReferences.map((r) => `"${r}"`).join(", ")} ]\n`)
    })
  }

  if (!isDryRun) {
    console.log("Updating database records...")
    const chunkSize = 20

    if (toUpdatePoems.length > 0) {
      let updatedPoemCount = 0
      for (let i = 0; i < toUpdatePoems.length; i += chunkSize) {
        const chunk = toUpdatePoems.slice(i, i + chunkSize)
        await Promise.all(
          chunk.map((item) =>
            prisma.poem.update({
              where: { id: item.id },
              data: {
                reference: item.newReferences,
                source: item.newSource,
              },
            })
          )
        )
        updatedPoemCount += chunk.length
        process.stdout.write(`\rPoem Progress: ${updatedPoemCount}/${toUpdatePoems.length} updated...`)
      }
      console.log(`\n\x1b[32m✔ Successfully updated ${updatedPoemCount} Poem records.\x1b[0m`)
    }

    if (toUpdatePoemEssences.length > 0) {
      let updatedPeCount = 0
      for (let i = 0; i < toUpdatePoemEssences.length; i += chunkSize) {
        const chunk = toUpdatePoemEssences.slice(i, i + chunkSize)
        await Promise.all(
          chunk.map((item) =>
            prisma.poemEssence.update({
              where: { id: item.id },
              data: {
                reference: item.newReferences,
                source: item.newSource,
              },
            })
          )
        )
        updatedPeCount += chunk.length
        process.stdout.write(`\rPoemEssence Progress: ${updatedPeCount}/${toUpdatePoemEssences.length} updated...`)
      }
      console.log(`\n\x1b[32m✔ Successfully updated ${updatedPeCount} PoemEssence records.\x1b[0m`)
    }

    console.log("\n\x1b[32m✔ All updates completed successfully.\x1b[0m\n")
  } else {
    console.log("\x1b[33m[DRY RUN] No database records were modified.\x1b[0m\n")
  }

  await prisma.$disconnect()
}

updatePoemBoardBookSource().catch((err) => {
  console.error("\x1b[31m✖ Error during update:\x1b[0m", err)
  process.exit(1)
})

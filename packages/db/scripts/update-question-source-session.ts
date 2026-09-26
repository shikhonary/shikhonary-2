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

export const QUESTION_MODELS = [
  { name: "Mcq", key: "mcq" },
  { name: "Cq", key: "cq" },
  { name: "PBQ", key: "pBQ" },
  { name: "ShortAnswer", key: "shortAnswer" },
  { name: "DescriptiveQuestion", key: "descriptiveQuestion" },
  { name: "ShortQuestion", key: "shortQuestion" },
  { name: "Paragraph", key: "paragraph" },
  { name: "Amplification", key: "amplification" },
  { name: "CS", key: "cS" },
  { name: "Letter", key: "letter" },
  { name: "Application", key: "application" },
  { name: "Summary", key: "summary" },
  { name: "Essence", key: "essence" },
  { name: "ThoughtExpansion", key: "thoughtExpansion" },
  { name: "NewsReport", key: "newsReport" },
  { name: "Essay", key: "essay" },
  { name: "ChangingSentence", key: "changingSentence" },
  { name: "RightFormOfVerb", key: "rightFormOfVerb" },
  { name: "PartsOfSpeech", key: "partsOfSpeech" },
  { name: "FillInTheBlanksWithClues", key: "fillInTheBlanksWithClues" },
  { name: "FillInTheBlanksWithoutClues", key: "fillInTheBlanksWithoutClues" },
  { name: "SubstitutionTable", key: "substitutionTable" },
  { name: "Punctuation", key: "punctuation" },
  { name: "ShortComposition", key: "shortComposition" },
  { name: "Poem", key: "poem" },
  { name: "Juktoborno", key: "juktoborno" },
  { name: "Synonym", key: "synonym" },
  { name: "GenderChange", key: "genderChange" },
  { name: "WordMeaning", key: "wordMeaning" },
  { name: "MakeSentences", key: "makeSentences" },
] as const

const DEFAULT_SOURCE = "গাইড বুক"
const DEFAULT_SESSION = new Date().getFullYear().toString()

async function main() {
  const isDryRun = process.argv.includes("--dry-run")
  const sourceValue = process.env.SOURCE_VALUE || DEFAULT_SOURCE
  const sessionValue = process.env.SESSION_VALUE || DEFAULT_SESSION

  console.log("\n\x1b[36m━━━ Update Question Bank Source & Session ━━━\x1b[0m")
  console.log(`Mode: \x1b[33m${isDryRun ? "DRY RUN (no database changes)" : "LIVE UPDATE"}\x1b[0m`)
  console.log(`Source value : \x1b[32m"${sourceValue}"\x1b[0m`)
  console.log(`Session value: \x1b[32m"${sessionValue}"\x1b[0m\n`)

  const summary: {
    model: string
    totalRecords: number
    updatedRecords: number
  }[] = []

  for (const { name, key } of QUESTION_MODELS) {
    const delegate = (prisma as any)[key]
    if (!delegate) {
      console.warn(`\x1b[33m⚠ Warning: Delegate for "${key}" not found on Prisma Client. Skipping.\x1b[0m`)
      continue
    }

    try {
      const count = await delegate.count()
      if (count === 0) {
        console.log(`  \x1b[90m- ${name.padEnd(26)} : 0 records (skipped)\x1b[0m`)
        continue
      }

      console.log(`  \x1b[34m✔ ${name.padEnd(26)} : ${count} record(s) found\x1b[0m`)

      let updatedCount = 0
      if (!isDryRun) {
        const updateResult = await delegate.updateMany({
          data: {
            source: sourceValue,
            session: sessionValue,
          },
        })
        updatedCount = updateResult.count
        console.log(`    \x1b[32m↳ Updated ${updatedCount} record(s)\x1b[0m`)
      } else {
        console.log(`    \x1b[33m↳ [Dry Run] Would update ${count} record(s)\x1b[0m`)
        updatedCount = count
      }

      summary.push({
        model: name,
        totalRecords: count,
        updatedRecords: updatedCount,
      })
    } catch (err) {
      console.error(`\x1b[31m✖ Error processing model "${name}":\x1b[0m`, err)
    }
  }

  console.log("\n\x1b[36m━━━ Execution Summary ━━━\x1b[0m")
  if (summary.length === 0) {
    console.log("No models with records found.")
  } else {
    console.table(summary)
    const totalUpdated = summary.reduce((acc, s) => acc + s.updatedRecords, 0)
    console.log(
      `\n\x1b[32m✔ Total models updated: ${summary.length}\x1b[0m | \x1b[32mTotal records updated: ${totalUpdated}\x1b[0m\n`
    )
  }
}

main()
  .catch((err) => {
    console.error("\x1b[31mFatal error:\x1b[0m", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

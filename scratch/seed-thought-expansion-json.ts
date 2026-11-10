import { resolve } from "node:path"
import { readFileSync, existsSync } from "node:fs"
import { config } from "dotenv"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../packages/db/generated/main/client.js"

// Load root .env and packages/db/.env
const WORKSPACE_ROOT = resolve(import.meta.dirname, "..")
config({ path: resolve(WORKSPACE_ROOT, ".env") })
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") })
config()

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error("\x1b[31m✖ MAIN_DATABASE_URL or DATABASE_URL is not set.\x1b[0m")
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const DEFAULT_SOURCE = "বোর্ড ও শীর্ষস্থানীয় বিদ্যালয় সংকলন"
const DEFAULT_SESSION = "2026"
const DEFAULT_SUBJECT_ID = "cmw3l9kci0002i0ejt0rebiwv" // বাংলা ২য় পত্র (নবম-দশম শ্রেণি)

const BOARD_MAP: Record<string, string> = {
  "ঢা. বো.": "ঢাকা বোর্ড",
  "ঢা.বো.": "ঢাকা বোর্ড",
  "ঢাকা বো.": "ঢাকা বোর্ড",
  "রা. বো.": "রাজশাহী বোর্ড",
  "রা.বো.": "রাজশাহী বোর্ড",
  "য. বো.": "যশোর বোর্ড",
  "য.বো.": "যশোর বোর্ড",
  "চ. বো.": "চট্টগ্রাম বোর্ড",
  "চ.বো.": "চট্টগ্রাম বোর্ড",
  "কু. বো.": "কুমিল্লা বোর্ড",
  "কু.বো.": "কুমিল্লা বোর্ড",
  "সি. বো.": "সিলেট বোর্ড",
  "সি.বো.": "সিলেট বোর্ড",
  "ব. বো.": "বরিশাল বোর্ড",
  "ব.বো.": "বরিশাল বোর্ড",
  "বি. বো.": "বরিশাল বোর্ড",
  "দি. বো.": "দিনাজপুর বোর্ড",
  "দি.বো.": "দিনাজপুর বোর্ড",
  "ম. বো.": "ময়মনসিংহ বোর্ড",
  "ম.বো.": "ময়মনসিংহ বোর্ড",
  "হবো.": "হবিগঞ্জ বোর্ড",
  "সকল বোর্ড": "সকল বোর্ড",
}

function expandYear(twoDigitYear: string): string {
  const y = twoDigitYear.trim()
  if (y.length === 4) return y
  if (y === "৯৯") return "১৯৯৯"
  const bengaliToEnglish: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9"
  }
  const englishToBengali: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
  }
  const numStr = y.split("").map((c) => bengaliToEnglish[c] || c).join("")
  const n = parseInt(numStr, 10)
  if (isNaN(n)) return y
  const fullYear = n > 50 ? 1900 + n : 2000 + n
  return String(fullYear).split("").map((c) => englishToBengali[c] || c).join("")
}

function normalizeReferenceString(ref: string): string[] {
  const trimmed = ref.trim()
  if (!trimmed || trimmed === "৯৯") return []

  // Match board prefix like "ঢা. বো. ২৫, ১৬" or "সকল বোর্ড ১৮"
  let matchedBoardPrefix: string | null = null
  let remainingText = trimmed

  for (const [abbr, fullName] of Object.entries(BOARD_MAP)) {
    if (trimmed.startsWith(abbr)) {
      matchedBoardPrefix = fullName
      remainingText = trimmed.slice(abbr.length).trim()
      break
    }
  }

  if (matchedBoardPrefix) {
    // Split by comma: "২৫, ১৬" -> ["২০২৫", "২০১৬"]
    const yearParts = remainingText.split(",").map((p) => p.trim()).filter(Boolean)
    if (yearParts.length > 0) {
      return yearParts.map((yp) => `${matchedBoardPrefix} ${expandYear(yp)}`)
    }
    return [matchedBoardPrefix]
  }

  // School or college name (e.g. "ফৌজদারহাট ক্যাডেট কলেজ, চট্টগ্রাম")
  return [trimmed]
}

function normalizeReferences(rawRefs?: string[]): string[] {
  if (!rawRefs || !Array.isArray(rawRefs)) return []
  const result = new Set<string>()

  for (const r of rawRefs) {
    const expanded = normalizeReferenceString(r)
    for (const exp of expanded) {
      if (exp) result.add(exp)
    }
  }

  return Array.from(result)
}

function cleanTitle(title: string): string {
  if (!title) return ""
  return title
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n +/g, "\n")
    .replace(/ +\n/g, "\n")
    .trim()
}

interface RawThoughtExpansionItem {
  title: string
  reference?: string[]
  difficulty?: "EASY" | "MEDIUM" | "HARD" | string
  popularityCount?: number
  source?: string
  session?: string
}

async function main() {
  console.log("\x1b[36m======================================================")
  console.log("   SHIKHONARY THOUGHT EXPANSION (ভাব-সম্প্রসারণ) SEEDER")
  console.log("======================================================\x1b[0m\n")

  const rawDataPath = resolve(WORKSPACE_ROOT, "scratch/raw-data/thought-expansion.json")
  if (!existsSync(rawDataPath)) {
    console.error(`\x1b[31m✖ Could not find ${rawDataPath}\x1b[0m`)
    process.exit(1)
  }

  const rawJsonContent = readFileSync(rawDataPath, "utf-8")
  const rawItems: RawThoughtExpansionItem[] = JSON.parse(rawJsonContent)
  console.log(`\x1b[34mℹ Loaded ${rawItems.length} raw thought expansions from JSON.\x1b[0m`)

  // 1. Resolve Target Subject
  const targetSubject = await prisma.academicSubject.findUnique({
    where: { id: DEFAULT_SUBJECT_ID },
    include: {
      classSubjects: {
        include: { academicClass: true },
      },
      sections: true,
      subjectQuestionTypes: true,
    },
  })

  if (!targetSubject) {
    console.error(`\x1b[31m✖ AcademicSubject with ID "${DEFAULT_SUBJECT_ID}" not found.\x1b[0m`)
    process.exit(1)
  }

  const classNames = targetSubject.classSubjects.map((cs) => cs.academicClass.nameBn).join(", ")
  console.log(`TARGET SUBJECT:    ${targetSubject.nameBn} (${targetSubject.nameEn}) [ID: ${targetSubject.id}]`)
  console.log(`CLASSES:           ${classNames}`)

  // 2. Resolve QuestionType for Thought Expansion
  const thoughtExpansionQuestionType = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Thought Expansion", mode: "insensitive" } },
        { label: { equals: "Thought Expansion", mode: "insensitive" } },
        { nameBn: { equals: "ভাব-সম্প্রসারণ" } },
        { nameBn: { equals: "ভাবসম্প্রসারণ" } },
      ],
    },
  })

  if (!thoughtExpansionQuestionType) {
    console.error("\x1b[31m✖ QuestionType for 'Thought Expansion' not found in database.\x1b[0m")
    process.exit(1)
  }

  console.log(`QUESTION TYPE:     ${thoughtExpansionQuestionType.nameBn} (${thoughtExpansionQuestionType.nameEn}) [ID: ${thoughtExpansionQuestionType.id}]`)

  // 3. Ensure SubjectQuestionType exists on target subject
  const existingSQT = targetSubject.subjectQuestionTypes.find(
    (sqt) => sqt.questionTypeId === thoughtExpansionQuestionType.id
  )

  if (!existingSQT) {
    const sectionId = targetSubject.sections[0]?.id || null
    const createdSQT = await prisma.subjectQuestionType.create({
      data: {
        subjectId: targetSubject.id,
        questionTypeId: thoughtExpansionQuestionType.id,
        sectionId,
        customLabel: "ভাব-সম্প্রসারণ লেখো:",
        mark: 10,
        markDistribution: { a: 10 },
        totalQuestions: 2,
        requiredCount: 1,
        renderMethod: 2,
        position: targetSubject.subjectQuestionTypes.length,
      },
    })
    console.log(`\x1b[32m✔ Created SubjectQuestionType for Thought Expansion [ID: ${createdSQT.id}] with (total: 2, required: 1, mark: 10)\x1b[0m`)
  } else {
    console.log(`\x1b[34mℹ SubjectQuestionType for Thought Expansion already exists [ID: ${existingSQT.id}]\x1b[0m`)
  }

  // 4. Deduplicate raw items by cleaned title
  const uniqueItemsMap = new Map<string, RawThoughtExpansionItem>()
  for (const item of rawItems) {
    const cleaned = cleanTitle(item.title)
    if (!cleaned) continue
    const key = cleaned.toLowerCase()
    if (uniqueItemsMap.has(key)) {
      // Merge references
      const existing = uniqueItemsMap.get(key)!
      const combinedRefs = [...(existing.reference || []), ...(item.reference || [])]
      existing.reference = Array.from(new Set(combinedRefs))
      existing.popularityCount = Math.max(
        existing.popularityCount || 0,
        item.popularityCount || 0,
        existing.reference.length
      )
    } else {
      uniqueItemsMap.set(key, { ...item, title: cleaned })
    }
  }

  const itemsToSeed = Array.from(uniqueItemsMap.values())
  console.log(`\x1b[32m✔ Deduplicated down to ${itemsToSeed.length} unique Thought Expansions.\x1b[0m\n`)

  // 5. Seed into ThoughtExpansion table
  let createdCount = 0
  let updatedCount = 0

  for (let i = 0; i < itemsToSeed.length; i++) {
    const raw = itemsToSeed[i]!
    const title = raw.title
    const normalizedRefs = normalizeReferences(raw.reference)
    const difficulty = (raw.difficulty || "MEDIUM").toUpperCase()
    const source = raw.source || DEFAULT_SOURCE
    const session = raw.session || DEFAULT_SESSION
    const popularityCount = Math.max(raw.popularityCount || 0, normalizedRefs.length)

    // Check if thought expansion with matching title already exists for this subject
    const existing = await prisma.thoughtExpansion.findFirst({
      where: {
        subjectId: targetSubject.id,
        title,
      },
    })

    if (existing) {
      const mergedRefs = Array.from(new Set([...existing.reference, ...normalizedRefs]))
      const refsChanged =
        mergedRefs.length !== existing.reference.length ||
        mergedRefs.some((r, idx) => r !== existing.reference[idx])

      if (refsChanged) {
        await prisma.thoughtExpansion.update({
          where: { id: existing.id },
          data: {
            reference: mergedRefs,
            source: existing.source || source,
            session: existing.session || session,
            popularityCount: Math.max(existing.popularityCount, mergedRefs.length),
          },
        })
      }
      updatedCount++
      console.log(`  [${String(i + 1).padStart(2, " ")}/${itemsToSeed.length}] (EXISTS) ${title.split("\n")[0]}`)
    } else {
      const created = await prisma.thoughtExpansion.create({
        data: {
          title,
          reference: normalizedRefs,
          difficulty,
          popularityCount,
          source,
          session,
          subjectId: targetSubject.id,
          questionTypeId: thoughtExpansionQuestionType.id,
          isGlobal: true,
          isActive: true,
        },
      })
      createdCount++
      console.log(`  [${String(i + 1).padStart(2, " ")}/${itemsToSeed.length}] (CREATED) ${title.split("\n")[0]} [Refs: ${normalizedRefs.length}]`)
    }
  }

  console.log(`\n\x1b[32m======================================================`)
  console.log(`  SEEDING COMPLETED SUCCESSFULLY!`)
  console.log(`  Total Processed: ${itemsToSeed.length}`)
  console.log(`  Created:         ${createdCount}`)
  console.log(`  Updated:         ${updatedCount}`)
  console.log(`======================================================\x1b[0m\n`)
}

main()
  .catch((err) => {
    console.error("\x1b[31m✖ Seeding failed:\x1b[0m", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

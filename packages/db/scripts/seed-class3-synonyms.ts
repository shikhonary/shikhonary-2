import { config } from "dotenv"
import { resolve } from "node:path"
import { readFileSync, existsSync } from "node:fs"
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

function findSourceFile(): { path: string; content: string } {
  const candidatePaths = [
    resolve(process.cwd(), "dan-bam-milkoron.json"),
    resolve(process.cwd(), "dam-bam-milkoron.json"),
    resolve(import.meta.dirname, "../../../dan-bam-milkoron.json"),
    resolve(import.meta.dirname, "../../../dam-bam-milkoron.json"),
  ]

  for (const p of candidatePaths) {
    if (existsSync(p)) {
      return { path: p, content: readFileSync(p, "utf-8") }
    }
  }

  throw new Error(
    "Could not find dan-bam-milkoron.json or dam-bam-milkoron.json in the project root."
  )
}

function findMatchingDbChapter(
  text: string,
  chapterList: Array<{ id: string; nameBn: string; nameEn: string }>
): { id: string; nameBn: string; nameEn: string } | null {
  const clean = text.trim().replace(/[।.,()]/g, "").trim()

  const manualMap: Record<string, string> = {
    "ময়লার বাকসো": "ময়লার বাক্স",
    "হযরত আবু বকর রা": "হজরত আবু বকর (রা)",
    "হযরত আবু বকর": "হজরত আবু বকর (রা)",
    "হজরত আবু বকর": "হজরত আবু বকর (রা)",
    "প্রতিযোগিতায় নাম লিখি": "প্রতিযোগিতার নাম লিখি",
    "বাক্য পড়ি ও লিখি": "বাক্য পড় ও লিখি",
  }

  if (manualMap[clean]) {
    const target = manualMap[clean]
    const found = chapterList.find(
      (c) =>
        c.nameBn.trim().replace(/[।.,()]/g, "").trim() ===
        target.replace(/[।.,()]/g, "").trim()
    )
    if (found) return found
  }

  const direct = chapterList.find((c) => {
    const cClean = c.nameBn.trim().replace(/[।.,()]/g, "").trim()
    return cClean === clean
  })
  if (direct) return direct

  const fuzzy = chapterList.find((c) => {
    const cClean = c.nameBn.trim().replace(/[।.,()]/g, "").trim()
    return (
      cClean.length > 3 &&
      clean.length > 3 &&
      (cClean.includes(clean) || clean.includes(cClean))
    )
  })
  return fuzzy || null
}

interface ParsedChapterWords {
  chapterName: string
  words: string[]
}

function parseSynonymText(content: string): ParsedChapterWords[] {
  const lines = content.split(/\r?\n/)
  const result: ParsedChapterWords[] = []
  let currentChapter: string | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line === "সমার্থক শব্দ") continue

    if (line.startsWith("১.") || line.includes("সমার্থক শব্দ লেখো")) {
      continue
    }

    // Line containing comma-separated words
    if (line.includes(",")) {
      const words = line
        .split(",")
        .map((w) => w.trim().replace(/[।.,]/g, "").trim())
        .filter(Boolean)

      if (currentChapter) {
        result.push({
          chapterName: currentChapter,
          words,
        })
      }
      currentChapter = null
    } else {
      currentChapter = line
    }
  }

  return result
}

async function main() {
  console.log("\x1b[36m=== Seeding Class 3 Bengali Synonyms (সমার্থক শব্দ) ===\x1b[0m\n")

  const { path: sourcePath, content } = findSourceFile()
  console.log(`\x1b[34mℹ Reading source file from: ${sourcePath}\x1b[0m\n`)

  // 1. Resolve Class 3
  const academicClass = await prisma.academicClass.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Three", mode: "insensitive" } },
        { nameBn: { contains: "তৃতীয়" } },
        { nameBn: { contains: "তৃতীয়" } },
      ],
    },
    include: {
      classSubjects: {
        include: {
          academicSubject: {
            include: {
              chapters: {
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
    },
  })
  if (!academicClass) throw new Error("Could not find Class 3 in DB.")
  console.log(`\x1b[32m✔ Class found:\x1b[0m ${academicClass.nameEn} (${academicClass.nameBn}) [${academicClass.id}]`)

  // 2. Resolve Bengali Subject
  const classSubject = academicClass.classSubjects.find((cs) => {
    const sNameBn = cs.academicSubject.nameBn
    const sNameEn = cs.academicSubject.nameEn.toLowerCase()
    return sNameBn.includes("বাংলা") || sNameEn.includes("bangla") || sNameEn.includes("bengali")
  })
  if (!classSubject) throw new Error("Could not find Bengali subject for Class 3.")

  const subject = classSubject.academicSubject
  console.log(`\x1b[32m✔ Subject found:\x1b[0m ${subject.nameEn} (${subject.nameBn}) [${subject.id}]`)
  const dbChapters = subject.chapters
  console.log(`\x1b[32m✔ Total Chapters in DB for this subject:\x1b[0m ${dbChapters.length}`)

  // 3. Resolve QuestionType for Synonym
  let questionType = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { contains: "synonym", mode: "insensitive" } },
        { nameBn: { contains: "সমার্থক" } },
      ],
    },
  })
  if (!questionType) {
    questionType = await prisma.questionType.create({
      data: {
        nameEn: "Synonym",
        nameBn: "সমার্থক শব্দ",
        label: "Synonym",
        mark: 5,
        position: 23,
        descriptionEn: "Synonym Questions",
        descriptionBn: "সমার্থক শব্দ প্রশ্নসমূহ",
        creditCost: 1,
        isActive: true,
      },
    })
    console.log(`\x1b[33mℹ Created Synonym QuestionType:\x1b[0m ${questionType.id}`)
  } else {
    console.log(
      `\x1b[32m✔ QuestionType found:\x1b[0m ${questionType.nameEn} (${questionType.nameBn}) [${questionType.id}]`
    )
  }

  // 4. Chapters already retrieved via subject.chapters


  // 5. Parse Text Content
  const parsedChapters = parseSynonymText(content)
  console.log(`\x1b[35m=== Parsed ${parsedChapters.length} Chapters from Input ===\x1b[0m\n`)

  // 6. Delete existing synonyms previously seeded with source: "গাইড বুক" and session: "2026"
  const deletedOld = await prisma.synonym.deleteMany({
    where: {
      subjectId: subject.id,
      source: "গাইড বুক",
      session: "2026",
    },
  })
  if (deletedOld.count > 0) {
    console.log(`\x1b[33mℹ Cleaned up ${deletedOld.count} previously seeded synonyms for 2026 গাইড বুক.\x1b[0m\n`)
  }

  // 7. Seed Synonyms
  let totalInserted = 0
  const summary: Array<{ chapter: string; dbChapter: string; wordsCount: number }> = []

  for (const item of parsedChapters) {
    const matched = findMatchingDbChapter(item.chapterName, dbChapters)
    if (!matched) {
      console.warn(`\x1b[31m✖ No DB Chapter match for: "${item.chapterName}"\x1b[0m`)
    }

    const chapterId = matched ? matched.id : null

    for (const word of item.words) {
      await prisma.synonym.create({
        data: {
          word,
          synonymWord: null,
          synonyms: [],
          reference: [],
          source: "গাইড বুক",
          session: "2026",
          difficulty: "MEDIUM",
          subjectId: subject.id,
          questionTypeId: questionType.id,
          academicChapterId: chapterId,
          isGlobal: true,
          isActive: true,
        },
      })
      totalInserted++
    }

    summary.push({
      chapter: item.chapterName,
      dbChapter: matched ? matched.nameBn : "UNMATCHED",
      wordsCount: item.words.length,
    })
  }

  console.log("\x1b[32m=== Seeding Complete ===\x1b[0m")
  console.table(summary)
  console.log(`\n\x1b[1m\x1b[32m✔ Successfully seeded ${totalInserted} Synonym records across ${parsedChapters.length} chapters!\x1b[0m\n`)
}

main()
  .catch((e) => {
    console.error("\x1b[31mError during seeding:\x1b[0m", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

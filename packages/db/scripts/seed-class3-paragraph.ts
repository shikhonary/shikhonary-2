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
    "আমার পরিচয়": "আমাদের কথা",
    "খামারি": "আমাদের পরিবার ও আমাদের প্রতিবেশী",
    "আমার পরিবার": "আমাদের পরিবার ও আমাদের প্রতিবেশী",
    "আমাদের প্রতিবেশী": "আমাদের পরিবার ও আমাদের প্রতিবেশী",
    "নিরাপদে চলাচল": "দেখে বুঝে কাজ করি",
    "হার-জিত": "হার-জিতের গল্প",
    "উৎসব": "আমাদের উৎসব",
    "রাষ্ট্রভাষা": "রাষ্ট্রভাষা বাংলা চাই",
    "শহিদ মিনার": "রাষ্ট্রভাষা বাংলা চাই",
    "খলিজা হজরত আবু বকর (রা)": "হজরত আবু বকর (রা)",
    "পুলিশ মুক্তিদ্ধ জাদুঘর": "মুক্তিযুদ্ধে রাজারবাগ",
    "পুলিশ মুক্তিযুদ্ধ জাদুঘর": "মুক্তিযুদ্ধে রাজারবাগ",
    "মুক্তিযুদ্ধ": "মুক্তিযুদ্ধে রাজারবাগ",
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

function parseParagraphTitles(content: string): string[] {
  const lines = content.split(/\r?\n/)
  const result: string[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line === "অনুচ্ছেদ") continue
    result.push(line)
  }

  return result
}

async function main() {
  console.log("\x1b[36m=== Seeding Class 3 Bengali Paragraphs (অনুচ্ছেদ) ===\x1b[0m\n")

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

  // 3. Resolve QuestionType for Paragraph
  let questionType = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Paragraph", mode: "insensitive" } },
        { nameBn: { equals: "অনুচ্ছেদ" } },
        { label: { contains: "অনুচ্ছেদ রচনা" } },
      ],
    },
  })
  if (!questionType) {
    questionType = await prisma.questionType.create({
      data: {
        nameEn: "Paragraph",
        nameBn: "অনুচ্ছেদ",
        label: "যেকোনো একটি বিষয়ে অনুচ্ছেদ রচনা করো:",
        mark: 10,
        position: 1,
        creditCost: 1,
        isActive: true,
      },
    })
    console.log(`\x1b[33mℹ Created QuestionType:\x1b[0m ${questionType.id}`)
  } else {
    console.log(
      `\x1b[32m✔ QuestionType found:\x1b[0m ${questionType.nameEn} (${questionType.nameBn}) [${questionType.id}]`
    )
  }

  // 4. Parse Titles
  const titles = parseParagraphTitles(content)
  console.log(`\x1b[35m=== Parsed ${titles.length} Paragraph Titles from Input ===\x1b[0m\n`)

  // 5. Clean up old records with source: "গাইড বুক" and session: "2026"
  const deletedOld = await prisma.paragraph.deleteMany({
    where: {
      subjectId: subject.id,
      source: "গাইড বুক",
      session: "2026",
    },
  })
  if (deletedOld.count > 0) {
    console.log(`\x1b[33mℹ Cleaned up ${deletedOld.count} previously seeded Paragraphs for 2026 গাইড বুক.\x1b[0m\n`)
  }

  // 6. Seed Paragraph records
  let totalInserted = 0
  const summary: Array<{ index: number; title: string; chapter: string }> = []

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i]
    const matched = findMatchingDbChapter(title, dbChapters)
    const chapterId = matched ? matched.id : null

    await prisma.paragraph.create({
      data: {
        name: title,
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

    summary.push({
      index: i + 1,
      title,
      chapter: matched ? matched.nameBn : "(সাধারণ / General)",
    })
  }

  console.log("\x1b[32m=== Seeding Complete ===\x1b[0m")
  console.table(summary)
  console.log(`\n\x1b[1m\x1b[32m✔ Successfully seeded ${totalInserted} Paragraph records!\x1b[0m\n`)
}

main()
  .catch((e) => {
    console.error("\x1b[31mError during seeding:\x1b[0m", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

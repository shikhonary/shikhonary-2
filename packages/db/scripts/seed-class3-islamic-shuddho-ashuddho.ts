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

function normalizeChapterName(str: string): string {
  return str.replace(/[\s\u200B-\u200D\uFEFF]/g, "").replace(/[।.,():-]/g, "").trim()
}

interface ChapterInfo {
  id: string
  nameBn: string
  nameEn: string | null
  position: number
}

interface ParsedQuestion {
  chapterId: string
  chapterNameBn: string
  sentence: string
  reference: string[]
}

function findMatchingChapter(line: string, chapters: ChapterInfo[]): ChapterInfo | undefined {
  const lineNorm = normalizeChapterName(line)
  return chapters.find((c) => {
    const cNorm = normalizeChapterName(c.nameBn)
    return (
      cNorm === lineNorm ||
      cNorm.startsWith(lineNorm) ||
      lineNorm.startsWith(cNorm)
    )
  })
}

function parseQuestions(
  rawContent: string,
  chapters: ChapterInfo[]
): ParsedQuestion[] {
  const lines = rawContent.split(/\r?\n/).map((l) => l.trim())
  const parsed: ParsedQuestion[] = []

  let currentChapter: ChapterInfo | null = null

  for (const line of lines) {
    if (!line) continue
    if (
      line.includes("শুদ্ধ অশুদ্ধ নির্ণয়") ||
      line.includes("শুদ্ধ/অশুদ্ধ নির্ণয় করো")
    ) {
      continue
    }

    // Chapter headers are short lines without punctuation
    if (
      line.length < 45 &&
      !line.includes("।") &&
      !line.includes("?")
    ) {
      const matchedChap = findMatchingChapter(line, chapters)
      if (matchedChap) {
        currentChapter = matchedChap
        continue
      }
    }

    if (!currentChapter) {
      continue
    }

    let reference: string[] = []
    let cleanLine = line

    const refBracketMatch = cleanLine.match(/\s*\[(.*?)\]\s*$/)
    const refSlashMatch = cleanLine.match(/\s*\/(.*?)\/\s*$/)

    if (refBracketMatch) {
      reference = [refBracketMatch[1].trim()]
      cleanLine = cleanLine.replace(/\s*\[(.*?)\]\s*$/, "").trim()
    } else if (refSlashMatch) {
      reference = [refSlashMatch[1].trim()]
      cleanLine = cleanLine.replace(/\s*\/(.*?)\/\s*$/, "").trim()
    }

    // Strip leading numbering or labels if present (e.g. "১। ", "(ক) ")
    const cleanedSentence = cleanLine
      .replace(/^[১-৯0-9]+[।.)]\s*/, "")
      .replace(/^\([ক-ঢ়a-zA-Z0-9]+\)\s*/, "")
      .trim()

    if (cleanedSentence.length > 0) {
      parsed.push({
        chapterId: currentChapter.id,
        chapterNameBn: currentChapter.nameBn,
        sentence: cleanedSentence,
        reference,
      })
    }
  }

  return parsed
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run")
  const shouldClean = !process.argv.includes("--no-clean")

  console.log("\x1b[36m=================================================================\x1b[0m")
  console.log("\x1b[36m Seeding Shuddho Ashuddho (শুদ্ধ অশুদ্ধ নির্ণয়)                   \x1b[0m")
  console.log("\x1b[36m Subject: Class 3 Islamic Studies (ইসলাম শিক্ষা)                 \x1b[0m")
  console.log("\x1b[36m=================================================================\x1b[0m\n")

  if (isDryRun) {
    console.log("\x1b[33m[DRY-RUN MODE] No database modifications will be performed.\x1b[0m\n")
  }

  // 1. Resolve Class 3
  const academicClass = await prisma.academicClass.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Three", mode: "insensitive" } },
        { nameBn: { contains: "তৃতীয়" } },
        { nameBn: { contains: "তৃতীয়" } },
        { nameEn: { contains: "3" } },
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

  if (!academicClass) {
    throw new Error("Could not find AcademicClass for Class 3 (Three / তৃতীয়).")
  }

  console.log(`\x1b[32m✔ Found Class:\x1b[0m ${academicClass.nameEn} (${academicClass.nameBn}) [ID: ${academicClass.id}]`)

  // 2. Resolve Islamic Studies Subject
  const classSubject = academicClass.classSubjects.find((cs) => {
    const sNameBn = cs.academicSubject.nameBn
    const sNameEn = cs.academicSubject.nameEn.toLowerCase()
    return (
      sNameBn.includes("ইসলাম") ||
      sNameEn.includes("islam")
    )
  })

  if (!classSubject) {
    throw new Error("Could not find Islamic Studies Subject for Class 3.")
  }

  const subject = classSubject.academicSubject
  console.log(`\x1b[32m✔ Found Subject:\x1b[0m ${subject.nameBn} (${subject.nameEn}) [ID: ${subject.id}]`)
  console.log(`\x1b[32m✔ Total Chapters in Subject:\x1b[0m ${subject.chapters.length}`)

  // 3. Resolve QuestionType for Shuddho Ashuddho
  let questionType = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Shuddho Ashuddho", mode: "insensitive" } },
        { nameBn: { contains: "শুদ্ধ অশুদ্ধ" } },
        { label: { contains: "Shuddho Ashuddho", mode: "insensitive" } },
      ],
    },
  })

  if (!questionType) {
    questionType = await prisma.questionType.findFirst({
      where: {
        nameEn: { contains: "shuddho", mode: "insensitive" },
      },
    })
  }

  if (!questionType) {
    throw new Error("Could not find QuestionType for 'Shuddho Ashuddho'.")
  }

  console.log(`\x1b[32m✔ QuestionType:\x1b[0m ${questionType.nameBn || questionType.nameEn} [ID: ${questionType.id}]\n`)

  // 4. Load & Parse File
  const sourceFile = findSourceFile()
  console.log(`\x1b[32m✔ Source File:\x1b[0m ${sourceFile.path}`)

  const parsedQuestions = parseQuestions(sourceFile.content, subject.chapters)
  console.log(`\x1b[32m✔ Total Questions Parsed:\x1b[0m ${parsedQuestions.length}\n`)

  // 5. Preview Table by Chapter
  const chapterBreakdown: Record<string, { count: number; samples: string[] }> = {}
  for (const c of subject.chapters) {
    chapterBreakdown[c.nameBn] = { count: 0, samples: [] }
  }

  for (const q of parsedQuestions) {
    if (!chapterBreakdown[q.chapterNameBn]) {
      chapterBreakdown[q.chapterNameBn] = { count: 0, samples: [] }
    }
    chapterBreakdown[q.chapterNameBn].count++
    if (chapterBreakdown[q.chapterNameBn].samples.length < 2) {
      chapterBreakdown[q.chapterNameBn].samples.push(q.sentence)
    }
  }

  console.log("--------------------------------------------------------------------------------------------------")
  console.log(`| #  | Chapter (অধ্যায়)`.padEnd(42) + `| Count | Sample Sentence`.padEnd(50) + "|")
  console.log("--------------------------------------------------------------------------------------------------")
  subject.chapters.forEach((c, idx) => {
    const numStr = (idx + 1).toString().padStart(2)
    const chapBn = c.nameBn.slice(0, 35).padEnd(36)
    const count = (chapterBreakdown[c.nameBn]?.count || 0).toString().padStart(5)
    const sample = (chapterBreakdown[c.nameBn]?.samples[0] || "").slice(0, 44).padEnd(46)
    console.log(`| ${numStr} | ${chapBn} | ${count} | ${sample} |`)
  })
  console.log("--------------------------------------------------------------------------------------------------\n")

  if (isDryRun) {
    console.log("\x1b[33m[DRY-RUN] Finished preview without database modifications.\x1b[0m")
    return
  }

  // 6. Clean existing records for this subject if requested
  if (shouldClean) {
    const deleteRes = await prisma.shuddhoAshuddho.deleteMany({
      where: {
        subjectId: subject.id,
      },
    })
    if (deleteRes.count > 0) {
      console.log(`\x1b[33mℹ Cleaned ${deleteRes.count} existing ShuddhoAshuddho records for Class 3 Islamic Studies.\x1b[0m`)
    }
  }

  // 7. Seed ShuddhoAshuddho records
  console.log("Inserting Shuddho Ashuddho questions into database...")
  let insertedCount = 0

  for (const q of parsedQuestions) {
    await prisma.shuddhoAshuddho.create({
      data: {
        sentence: q.sentence,
        answer: null,
        reference: q.reference,
        source: "গাইড বুক",
        session: "2026",
        difficulty: "MEDIUM",
        popularityCount: 0,
        subjectId: subject.id,
        academicChapterId: q.chapterId,
        questionTypeId: questionType.id,
        isGlobal: true,
        isActive: true,
      },
    })
    insertedCount++
    if (insertedCount % 50 === 0 || insertedCount === parsedQuestions.length) {
      process.stdout.write(`  ... inserted ${insertedCount}/${parsedQuestions.length} questions\r`)
    }
  }

  console.log(`\n\x1b[1m\x1b[32m✔ Successfully seeded ${insertedCount} ShuddhoAshuddho records across Class 3 Islamic Studies chapters!\x1b[0m`)

  const totalInDb = await prisma.shuddhoAshuddho.count({
    where: { subjectId: subject.id },
  })
  console.log(`\x1b[32m✔ Total ShuddhoAshuddho records in DB for this subject: ${totalInDb}\x1b[0m`)
}

main()
  .catch((err) => {
    console.error("\x1b[31m✖ Error executing script:\x1b[0m", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

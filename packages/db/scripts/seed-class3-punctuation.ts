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

  for (const c of chapterList) {
    const cClean = c.nameBn.replace(/[।.,()]/g, "").trim()
    if (clean === cClean) return c
    if (clean.replace(/বাকসো/, "বাক্স") === cClean) return c
    if (clean.replace(/বাক্য পড়ি ও লিখি/, "বাক্য পড় ও লিখি") === cClean) return c
    if (clean.replace(/হযরত/, "হজরত") === cClean) return c
    if (clean.replace(/প্রতিযোগিতায়/, "প্রতিযোগিতার") === cClean) return c
  }

  return null
}

interface ParsedPunctuation {
  sectionType: string
  chapterId: string
  chapterNameBn: string
  chapterNameEn: string
  questionNo: string
  prompt: string
  rawText: string
}

function parsePunctuationFromText(
  content: string,
  chapterList: Array<{ id: string; nameBn: string; nameEn: string }>
): ParsedPunctuation[] {
  const lines = content.split(/\r?\n/)
  const result: ParsedPunctuation[] = []

  let currentSection = ""
  let currentChapter: { id: string; nameBn: string; nameEn: string } | null = null
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line) {
      i++
      continue
    }

    if (line === "বিরামচিহ্ন") {
      currentSection = "অনুচ্ছেদ বিরামচিহ্ন"
      i++
      continue
    }

    if (line === "বাক্যে বিরামচিহ্ন") {
      currentSection = "বাক্যে বিরামচিহ্ন"
      i++
      continue
    }

    // Check if this line is a chapter name
    const chap = findMatchingDbChapter(line, chapterList)
    if (chap && !line.match(/^[১-৯]+\./)) {
      currentChapter = chap
      i++
      continue
    }

    // Check if it's a question header
    const qMatch = line.match(/^([১-৯]+)\.\s*(নিচের [^:]+:)/)
    if (qMatch) {
      const qNo = qMatch[1]
      const prompt = qMatch[2]
      i++

      const textLines: string[] = []
      while (i < lines.length) {
        const next = lines[i].trim()
        if (next === "বাক্যে বিরামচিহ্ন" || next === "বিরামচিহ্ন") break
        if (next.match(/^([১-৯]+)\.\s*(নিচের [^:]+:)/)) break
        if (findMatchingDbChapter(next, chapterList) && !next.match(/^[১-৯]+\./)) break
        if (next) {
          textLines.push(next)
        }
        i++
      }

      if (!currentChapter) {
        throw new Error(`Found question "${prompt}" at line ${i} without active chapter.`)
      }

      result.push({
        sectionType: currentSection,
        chapterId: currentChapter.id,
        chapterNameBn: currentChapter.nameBn,
        chapterNameEn: currentChapter.nameEn,
        questionNo: qNo,
        prompt,
        rawText: textLines.join("\n"),
      })
      continue
    }

    i++
  }

  return result
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run")
  const shouldClean = !process.argv.includes("--no-clean")

  console.log("\x1b[36m====================================================\x1b[0m")
  console.log("\x1b[36m Seeding Punctuation (Class 3 Bengali) \x1b[0m")
  console.log("\x1b[36m====================================================\x1b[0m")

  if (isDryRun) {
    console.log("\x1b[33m[DRY-RUN MODE] No database writes will be executed.\x1b[0m\n")
  }

  // 1. Resolve Class 3
  const academicClass = await prisma.academicClass.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Three", mode: "insensitive" } },
        { nameBn: { contains: "তৃতীয়" } },
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

  // 2. Resolve Bengali Subject
  const classSubject = academicClass.classSubjects.find((cs) => {
    const sNameBn = cs.academicSubject.nameBn
    const sNameEn = cs.academicSubject.nameEn.toLowerCase()
    return sNameBn.includes("বাংলা") || sNameEn.includes("bangla") || sNameEn.includes("bengali")
  })

  if (!classSubject) {
    throw new Error("Could not find Bengali Subject for Class 3.")
  }

  const subject = classSubject.academicSubject
  console.log(`\x1b[32m✔ Found Subject:\x1b[0m ${subject.nameBn} (${subject.nameEn}) [ID: ${subject.id}]`)
  console.log(`\x1b[32m✔ Total Chapters Found:\x1b[0m ${subject.chapters.length}`)

  // 3. Resolve QuestionType for Punctuation
  let questionType = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Punctuation and Capitalization", mode: "insensitive" } },
        { nameEn: { equals: "Punctuation", mode: "insensitive" } },
        { label: { equals: "Punctuation and Capitalization", mode: "insensitive" } },
        { label: { equals: "Punctuation", mode: "insensitive" } },
        { nameEn: { equals: "PUNCTUATION", mode: "insensitive" } },
        { nameBn: { contains: "বিরাম চিহ্ন" } },
        { nameBn: { contains: "যতিচিহ্ন" } },
        { nameBn: { contains: "Punctuation" } },
      ],
    },
  })

  if (!questionType) {
    console.log("QuestionType for Punctuation not found, creating it...")
    if (!isDryRun) {
      questionType = await prisma.questionType.create({
        data: {
          nameEn: "Punctuation and Capitalization",
          nameBn: "বিরামচিহ্ন",
          label: "Punctuation and Capitalization",
          mark: 5,
          position: 25,
          descriptionEn: "Punctuation and Capitalization",
          descriptionBn: "জ্যোতি বা বিরামচিহ্নের ব্যবহার",
          creditCost: 1,
          isActive: true,
        },
      })
    } else {
      questionType = { id: "dry-run-punc-qt-id" } as any
    }
  }

  console.log(`\x1b[32m✔ QuestionType:\x1b[0m ${questionType!.nameBn || questionType!.nameEn} [ID: ${questionType!.id}]`)

  // 4. Load & Parse File
  const sourceFile = findSourceFile()
  console.log(`\x1b[32m✔ Source File:\x1b[0m ${sourceFile.path}`)

  const parsedQuestions = parsePunctuationFromText(sourceFile.content, subject.chapters)
  console.log(`\x1b[32m✔ Total Punctuation Questions Parsed:\x1b[0m ${parsedQuestions.length}\n`)

  // Summary preview table
  console.log("-----------------------------------------------------------------------------------------------------------------")
  console.log(
    `| #  | Section`.padEnd(25) +
      `| Chapter (বাংলা)`.padEnd(32) +
      `| Q# | Lines | Chapter ID`.padEnd(30) +
      "|"
  )
  console.log("-----------------------------------------------------------------------------------------------------------------")
  parsedQuestions.forEach((q, idx) => {
    const numStr = (idx + 1).toString().padStart(2)
    const secStr = q.sectionType.padEnd(20)
    const chapBn = q.chapterNameBn.slice(0, 26).padEnd(26)
    const qNo = q.questionNo.padEnd(2)
    const lCount = q.rawText.split("\n").length.toString().padStart(5)
    console.log(`| ${numStr} | ${secStr} | ${chapBn} | ${qNo} | ${lCount} | ${q.chapterId} |`)
  })
  console.log("-----------------------------------------------------------------------------------------------------------------\n")

  if (isDryRun) {
    console.log("\x1b[33m[DRY-RUN] Finished parse verification successfully without database modifications.\x1b[0m")
    return
  }

  // 5. Clean existing Class 3 Bengali Punctuation records if requested
  if (shouldClean) {
    const deleteRes = await prisma.punctuation.deleteMany({
      where: {
        subjectId: subject.id,
      },
    })
    if (deleteRes.count > 0) {
      console.log(`\x1b[33mℹ Cleaned ${deleteRes.count} existing Punctuation records for Class 3 Bengali.\x1b[0m`)
    }
  }

  // 6. Insert parsed questions
  console.log("Inserting punctuation questions into database...")
  let insertedCount = 0

  for (const q of parsedQuestions) {
    await prisma.punctuation.create({
      data: {
        prompt: q.prompt,
        rawText: q.rawText,
        answerText: null,
        totalMarks: 5,
        reference: [],
        source: "গাইড বুক",
        session: "2026",
        difficulty: "MEDIUM",
        popularityCount: 0,
        subjectId: subject.id,
        academicChapterId: q.chapterId,
        questionTypeId: questionType!.id,
        isGlobal: true,
        isActive: true,
      },
    })
    insertedCount++
  }

  console.log(`\n\x1b[32m✔ Successfully created ${insertedCount} Punctuation questions in Class 3 Bengali!\x1b[0m`)
}

main()
  .catch((err) => {
    console.error("\x1b[31m✖ Error executing script:\x1b[0m", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

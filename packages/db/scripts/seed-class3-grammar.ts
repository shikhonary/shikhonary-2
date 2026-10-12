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

function parseQuestionsFromText(content: string): string[] {
  const lines = content.split(/\r?\n/)
  const questions: string[] = []
  const seen = new Set<string>()

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    if (seen.has(line)) continue

    seen.add(line)
    questions.push(line)
  }

  return questions
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run")
  const shouldClean = !process.argv.includes("--no-clean")

  console.log("\x1b[36m========================================================\x1b[0m")
  console.log("\x1b[36m Seeding Grammar Questions (Class 3 Bengali - ব্যাকরণ) \x1b[0m")
  console.log("\x1b[36m========================================================\x1b[0m\n")

  if (isDryRun) {
    console.log("\x1b[33m[DRY-RUN MODE] No database modifications will be performed.\x1b[0m\n")
  }

  // 1. Locate and parse source questions
  const sourceFile = findSourceFile()
  console.log(`\x1b[34mℹ Reading source file from: ${sourceFile.path}\x1b[0m`)

  const parsedQuestions = parseQuestionsFromText(sourceFile.content)
  console.log(`\x1b[32m✔ Total Questions Parsed:\x1b[0m ${parsedQuestions.length}\n`)

  if (parsedQuestions.length === 0) {
    throw new Error("No questions found in source file.")
  }

  // 2. Resolve Class 3
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

  // 3. Resolve Bengali Subject
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

  // 4. Resolve Grammar Chapter (ব্যাকরণ)
  let chapter = subject.chapters.find((ch) => {
    const chBn = ch.nameBn.trim().toLowerCase()
    const chEn = ch.nameEn.trim().toLowerCase()
    return chBn === "ব্যাকরণ" || chBn.includes("ব্যাকরণ") || chEn === "grammar" || chEn.includes("grammar")
  })

  if (!chapter) {
    console.log("Grammar chapter not found under Bengali subject, creating it...")
    if (!isDryRun) {
      chapter = await prisma.academicChapter.create({
        data: {
          nameBn: "ব্যাকরণ",
          nameEn: "Grammar",
          subjectId: subject.id,
          position: subject.chapters.length + 1,
          isActive: true,
        },
      })
    } else {
      chapter = { id: "dry-run-chapter-id", nameBn: "ব্যাকরণ", nameEn: "Grammar" } as any
    }
  }

  console.log(`\x1b[32m✔ Found Chapter:\x1b[0m ${chapter.nameBn} (${chapter.nameEn}) [ID: ${chapter.id}]`)

  // 5. Resolve QuestionType for Grammar Question
  let questionType = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Grammar Question", mode: "insensitive" } },
        { nameEn: { equals: "Grammar", mode: "insensitive" } },
        { label: { equals: "Grammar Question", mode: "insensitive" } },
        { nameBn: { contains: "ব্যাকরণ প্রশ্ন" } },
        { nameBn: { contains: "ব্যাকরণ" } },
      ],
    },
  })

  if (!questionType) {
    console.log("QuestionType for Grammar Question not found, creating it...")
    if (!isDryRun) {
      questionType = await prisma.questionType.create({
        data: {
          nameEn: "Grammar Question",
          nameBn: "ব্যাকরণ প্রশ্ন",
          label: "Grammar Question",
          mark: 5,
          position: 33,
          descriptionEn: "Grammar Question",
          descriptionBn: "ব্যাকরণ সংক্রান্ত প্রশ্ন",
          creditCost: 1,
          isActive: true,
        },
      })
    } else {
      questionType = { id: "dry-run-qt-id", nameEn: "Grammar Question", nameBn: "ব্যাকরণ প্রশ্ন" } as any
    }
  }

  console.log(`\x1b[32m✔ QuestionType:\x1b[0m ${questionType!.nameBn || questionType!.nameEn} [ID: ${questionType!.id}]\n`)

  // Preview table
  console.log("-----------------------------------------------------------------------------------------------------------------")
  console.log(
    `| #  | Question`.padEnd(80) +
      `| Chapter`.padEnd(25) +
      "|"
  )
  console.log("-----------------------------------------------------------------------------------------------------------------")
  parsedQuestions.forEach((q, idx) => {
    const numStr = (idx + 1).toString().padStart(2)
    const qPreview = q.length > 70 ? q.slice(0, 67) + "..." : q
    const chapBn = (chapter!.nameBn || "ব্যাকরণ").padEnd(20)
    console.log(`| ${numStr} | ${qPreview.padEnd(74)} | ${chapBn} |`)
  })
  console.log("-----------------------------------------------------------------------------------------------------------------\n")

  if (isDryRun) {
    console.log("\x1b[33m[DRY-RUN] Finished preview without database modifications.\x1b[0m")
    return
  }

  // 6. Clean existing GrammarQuestion records for this subject & chapter if enabled
  if (shouldClean) {
    const deleteRes = await prisma.grammarQuestion.deleteMany({
      where: {
        subjectId: subject.id,
        academicChapterId: chapter.id,
      },
    })
    if (deleteRes.count > 0) {
      console.log(`\x1b[33mℹ Cleaned ${deleteRes.count} existing GrammarQuestion records for Class 3 Bengali Grammar.\x1b[0m\n`)
    }
  }

  // 7. Seed Grammar questions
  console.log("Inserting Grammar questions into database...")
  let insertedCount = 0

  for (const q of parsedQuestions) {
    await prisma.grammarQuestion.create({
      data: {
        question: q,
        answer: null,
        reference: [],
        source: "গাইড বুক",
        session: "2026",
        difficulty: "MEDIUM",
        popularityCount: 0,
        subjectId: subject.id,
        academicChapterId: chapter.id,
        questionTypeId: questionType!.id,
        isGlobal: true,
        isActive: true,
      },
    })
    insertedCount++
  }

  const totalInDb = await prisma.grammarQuestion.count({
    where: {
      subjectId: subject.id,
      academicChapterId: chapter.id,
    },
  })
  console.log(`\n\x1b[1m\x1b[32m✔ Successfully seeded ${insertedCount} GrammarQuestion records for Class 3 Bengali (ব্যাকরণ)!\x1b[0m`)
  console.log(`\x1b[32m✔ Total GrammarQuestion records in DB for this chapter: ${totalInDb}\x1b[0m\n`)
}

main()
  .catch((err) => {
    console.error("\x1b[31m✖ Error executing script:\x1b[0m", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { config } from "dotenv"
import { resolve } from "node:path"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/main/client.js"

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

interface ParsedQuestion {
  question: string
  answer: string | null
  options: string[]
  isMath: boolean
  reference: string[]
  questionUrl: string | null
  difficulty: string
  attachments: any[]
}

interface ChapterGroup {
  chapter: string
  questions: ParsedQuestion[]
}

function parseGrammarQuestionFile(): ChapterGroup[] {
  const candidatePaths = [
    resolve(process.cwd(), "grammar-question.json"),
    resolve(import.meta.dirname, "../../../grammar-question.json"),
  ]

  let sourcePath = candidatePaths.find((p) => existsSync(p))
  if (!sourcePath) {
    throw new Error("Could not find grammar-question.json in root directory.")
  }

  const raw = readFileSync(sourcePath, "utf-8")
  const lines = raw.split(/\r?\n/)

  const groups: ChapterGroup[] = []
  let currentGroup: ChapterGroup | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    // Detect if this line is a question or a chapter heading.
    // Question lines start with numbers: e.g. ৩., ৪., ১০., 1., 2.
    const isQuestion = /^[\d০-৯]+[\.\)]\s*/.test(line)

    if (!isQuestion) {
      currentGroup = {
        chapter: line,
        questions: [],
      }
      groups.push(currentGroup)
      continue
    }

    if (!currentGroup) {
      throw new Error(`Encountered question before chapter heading: "${line}"`)
    }

    // Strip leading numbering: e.g. "৩. ", "১১. "
    let qText = line.replace(/^[\d০-৯]+[\.\)]\s*/, "").trim()

    let isMath = false
    // In ভগ্নাংশ chapter, format fractional terms as React KaTeX: $$\frac{a}{b}$$
    if (currentGroup.chapter.includes("ভগ্নাংশ")) {
      qText = qText.replace(/(\d+|[০-৯]+)\/(\d+|[০-৯]+)/g, (_m, p1, p2) => `$$\\frac{${p1}}{${p2}}$$`)
      isMath = true
    }

    currentGroup.questions.push({
      question: qText,
      answer: null,
      options: [],
      isMath,
      reference: [],
      questionUrl: null,
      difficulty: "MEDIUM",
      attachments: [],
    })
  }

  return groups
}

async function resolveQuestionTypes() {
  // 1. Math Question type
  let mathQt = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Math Question", mode: "insensitive" } },
        { label: { equals: "Math Question", mode: "insensitive" } },
        { nameEn: { equals: "MATH_QUESTION", mode: "insensitive" } },
        { nameBn: { equals: "গণিত প্রশ্ন", mode: "insensitive" } },
        { nameBn: { contains: "গণিত" } },
      ],
    },
  })

  if (!mathQt) {
    console.log("ℹ Creating QuestionType for 'Math Question'...")
    mathQt = await prisma.questionType.create({
      data: {
        nameEn: "Math Question",
        nameBn: "গণিত প্রশ্ন",
        label: "Math Question",
        mark: 5,
        position: 34,
        descriptionEn: "Math Question",
        descriptionBn: "গণিত সংক্রান্ত প্রশ্ন",
        creditCost: 1,
        isActive: true,
      },
    })
  }

  // 2. Grammar Question type
  let grammarQt = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Grammar Question", mode: "insensitive" } },
        { nameBn: { contains: "ব্যাকরণ প্রশ্ন" } },
        { id: "cmv54slwp0000m4sxf480dz73" },
      ],
    },
  })

  if (!grammarQt) {
    grammarQt = await prisma.questionType.create({
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
  }

  return { mathQt, grammarQt }
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run")

  console.log("\x1b[36m=================================================================\x1b[0m")
  console.log("\x1b[36m Organize & Seed Class 3 Math Questions from grammar-question.json\x1b[0m")
  console.log("\x1b[36m=================================================================\x1b[0m\n")

  // 1. Parse grammar-question.json
  const parsedGroups = parseGrammarQuestionFile()
  const totalQuestions = parsedGroups.reduce((acc, g) => acc + g.questions.length, 0)

  console.log(`\x1b[32m✔ Parsed ${parsedGroups.length} chapters and ${totalQuestions} questions:\x1b[0m`)
  parsedGroups.forEach((g, idx) => {
    console.log(`  ${idx + 1}. ${g.chapter} (${g.questions.length} questions)`)
  })
  console.log()

  // 2. Write organized JSON files
  const rootDir = resolve(import.meta.dirname, "../../..")
  const grammarJsonPath = resolve(rootDir, "grammar-question-by-chapter.json")
  const mathJsonPath = resolve(rootDir, "math-question-by-chapter.json")

  const jsonOutput = JSON.stringify(parsedGroups, null, 2)
  writeFileSync(grammarJsonPath, jsonOutput, "utf-8")
  console.log(`\x1b[32m✔ Written:\x1b[0m ${grammarJsonPath}`)

  writeFileSync(mathJsonPath, jsonOutput, "utf-8")
  console.log(`\x1b[32m✔ Written:\x1b[0m ${mathJsonPath}\n`)

  if (isDryRun) {
    console.log("\x1b[33m[DRY-RUN] Files written. Skipping database operations.\x1b[0m")
    return
  }

  // 3. Resolve Class 3 Mathematics subject
  const mathSubject = await prisma.academicSubject.findUnique({
    where: { id: "cmv7sto1t003i8ssx6mtxtchv" },
    include: {
      chapters: {
        orderBy: { position: "asc" },
      },
    },
  })

  if (!mathSubject) {
    throw new Error("Class 3 Mathematics subject (ID cmv7sto1t003i8ssx6mtxtchv) not found in database.")
  }

  console.log(`\x1b[32m✔ Found Subject:\x1b[0m ${mathSubject.nameBn} (${mathSubject.nameEn}) [ID: ${mathSubject.id}]`)

  // 4. Resolve QuestionTypes
  const { mathQt, grammarQt } = await resolveQuestionTypes()
  console.log(`\x1b[32m✔ Math QuestionType:\x1b[0m ${mathQt.nameBn} (${mathQt.nameEn}) [ID: ${mathQt.id}]`)
  console.log(`\x1b[32m✔ Grammar QuestionType:\x1b[0m ${grammarQt.nameBn} (${grammarQt.nameEn}) [ID: ${grammarQt.id}]\n`)

  // Normalize chapter matcher
  const normalize = (s: string) => s.replace(/[\s,–—\-]+/g, "").toLowerCase()

  // 5. Clean existing MathQuestion & GrammarQuestion records for this subject
  const cleanedMath = await prisma.mathQuestion.deleteMany({
    where: { subjectId: mathSubject.id },
  })
  if (cleanedMath.count > 0) {
    console.log(`\x1b[33mℹ Cleaned ${cleanedMath.count} previous MathQuestion records for Class 3 Math.\x1b[0m`)
  }

  const cleanedGrammar = await prisma.grammarQuestion.deleteMany({
    where: { subjectId: mathSubject.id },
  })
  if (cleanedGrammar.count > 0) {
    console.log(`\x1b[33mℹ Cleaned ${cleanedGrammar.count} previous GrammarQuestion records for Class 3 Math.\x1b[0m`)
  }

  // 6. Seed questions into both MathQuestion and GrammarQuestion
  let mathInserted = 0
  let grammarInserted = 0

  for (const group of parsedGroups) {
    const matchedChapter = mathSubject.chapters.find((ch) => {
      return normalize(ch.nameBn) === normalize(group.chapter) || normalize(ch.nameEn) === normalize(group.chapter)
    })

    if (!matchedChapter) {
      console.warn(`\x1b[33m⚠ Warning: No chapter matched for "${group.chapter}"!\x1b[0m`)
    } else {
      console.log(`\x1b[34mℹ Mapping "${group.chapter}" -> Chapter "${matchedChapter.nameBn}" [ID: ${matchedChapter.id}]\x1b[0m`)
    }

    const chapterId = matchedChapter?.id || null

    for (const q of group.questions) {
      // Create MathQuestion
      await prisma.mathQuestion.create({
        data: {
          question: q.question,
          answer: q.answer,
          isMath: q.isMath,
          reference: q.reference,
          source: "গাইড বুক",
          session: "2026",
          difficulty: q.difficulty,
          popularityCount: 0,
          subjectId: mathSubject.id,
          academicChapterId: chapterId,
          questionTypeId: mathQt.id,
          isGlobal: true,
          isActive: true,
        },
      })
      mathInserted++

      // Create GrammarQuestion (so both tables are seeded for maximum compatibility)
      await prisma.grammarQuestion.create({
        data: {
          question: q.question,
          answer: q.answer,
          reference: q.reference,
          source: "গাইড বুক",
          session: "2026",
          difficulty: q.difficulty,
          popularityCount: 0,
          subjectId: mathSubject.id,
          academicChapterId: chapterId,
          questionTypeId: grammarQt.id,
          isGlobal: true,
          isActive: true,
        },
      })
      grammarInserted++
    }
  }

  console.log(`\n\x1b[1m\x1b[32m✔ Successfully seeded ${mathInserted} records into MathQuestion!\x1b[0m`)
  console.log(`\x1b[1m\x1b[32m✔ Successfully seeded ${grammarInserted} records into GrammarQuestion!\x1b[0m`)

  const totalMathInDb = await prisma.mathQuestion.count({ where: { subjectId: mathSubject.id } })
  const totalGrammarInDb = await prisma.grammarQuestion.count({ where: { subjectId: mathSubject.id } })

  console.log(`\x1b[32m✔ Total MathQuestions in DB for Class 3 Math: ${totalMathInDb}\x1b[0m`)
  console.log(`\x1b[32m✔ Total GrammarQuestions in DB for Class 3 Math: ${totalGrammarInDb}\x1b[0m\n`)
}

main()
  .catch((err) => {
    console.error("\x1b[31m✖ Error during organize & seed:\x1b[0m", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

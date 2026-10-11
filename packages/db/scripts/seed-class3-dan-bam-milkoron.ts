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
  }

  return null
}

interface ParsedQuestion {
  chapterId: string
  chapterNameBn: string
  chapterNameEn: string
  questionNo: string
  leftColumn: string[]
  rightColumn: string[]
}

function parseQuestionsFromText(
  content: string,
  chapterList: Array<{ id: string; nameBn: string; nameEn: string }>
): ParsedQuestion[] {
  const lines = content.split(/\r?\n/)

  const chapterOccurrences: Array<{
    lineIndex: number
    text: string
    chapter: { id: string; nameBn: string; nameEn: string }
  }> = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line === "ডান-বাম মিলকরণ" || line.includes("বাম পাশের বাক্যাংশের")) {
      continue
    }
    const match = findMatchingDbChapter(line, chapterList)
    if (match) {
      chapterOccurrences.push({ lineIndex: i, text: line, chapter: match })
    }
  }

  const parsedQuestions: ParsedQuestion[] = []

  for (let cIdx = 0; cIdx < chapterOccurrences.length; cIdx++) {
    const currentOccur = chapterOccurrences[cIdx]
    const startLine = currentOccur.lineIndex
    const endLine =
      cIdx + 1 < chapterOccurrences.length
        ? chapterOccurrences[cIdx + 1].lineIndex
        : lines.length

    const chapterSectionLines = lines.slice(startLine + 1, endLine)

    const qStarts: number[] = []
    for (let l = 0; l < chapterSectionLines.length; l++) {
      if (
        /^[১-৯]+\.\s*বাম পাশের বাক্যাংশের সাথে ডান পাশের বাক্যাংশ মিল কর:/.test(
          chapterSectionLines[l].trim()
        )
      ) {
        qStarts.push(l)
      }
    }

    for (let qI = 0; qI < qStarts.length; qI++) {
      const qStartIdx = qStarts[qI]
      const qEndIdx =
        qI + 1 < qStarts.length ? qStarts[qI + 1] : chapterSectionLines.length
      const qHeader = chapterSectionLines[qStartIdx].trim()
      const qNum = qHeader.match(/^([১-৯]+)/)?.[1] || "১"
      const rawLines = chapterSectionLines
        .slice(qStartIdx + 1, qEndIdx)
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && l !== "বাম পাশ" && l !== "ডান পাশ")

      const left: string[] = []
      const right: string[] = []

      // If this question has no left prefixes (like "দেখে বুঝে কাজ করি"), all are right options
      const hasAnyPrefix = rawLines.some((l) => /^[ক-ঙa-e]\./.test(l))
      if (!hasAnyPrefix) {
        for (const line of rawLines) {
          right.push(line.trim())
        }
      } else {
        for (let k = 0; k < rawLines.length; k++) {
          const lineText = rawLines[k]
          const m = lineText.match(/^([ক-ঙa-e])\.\s*(.*)/)
          if (m) {
            let leftVal = m[2].trim()

            // Handle tab-separated carryover if present (e.g. "মামা দুজনকে দুটি\tকামানসহ")
            let rightPrefixCarryOver = ""
            if (leftVal.includes("\t")) {
              const parts = leftVal.split("\t")
              leftVal = parts[0].trim()
              rightPrefixCarryOver = parts.slice(1).join(" ").trim()
            }

            left.push(leftVal)

            if (k + 1 < rawLines.length && !rawLines[k + 1].match(/^[ক-ঙa-e]\./)) {
              let rightVal = rawLines[k + 1].trim()
              if (rightPrefixCarryOver) {
                rightVal = `${rightPrefixCarryOver} ${rightVal}`.trim()
              }

              // Handle merged sentence glitch in "আমাদের পরিবার ও আমাদের প্রতিবেশী"
              if (rightVal.includes("হাঁস-মুরগির স্কুলে যাই।খামার আছে।")) {
                right.push("হাঁস-মুরগির খামার আছে।")
                rightVal = "স্কুলে যাই।"
              } else {
                right.push(rightVal)
              }
              k++
            } else {
              // Missing direct right line (e.g. ঙ. সবাই আমরা when স্কুলে যাই was decoupled above)
              if (
                currentOccur.chapter.nameBn.includes("আমাদের পরিবার") &&
                leftVal === "সবাই আমরা"
              ) {
                right.push("স্কুলে যাই।")
              }
            }
          } else {
            // Extra right option if more right items exist
            right.push(lineText)
          }
        }
      }

      parsedQuestions.push({
        chapterId: currentOccur.chapter.id,
        chapterNameBn: currentOccur.chapter.nameBn,
        chapterNameEn: currentOccur.chapter.nameEn,
        questionNo: qNum,
        leftColumn: left,
        rightColumn: right,
      })
    }
  }

  return parsedQuestions
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run")
  const shouldClean = !process.argv.includes("--no-clean")

  console.log("\x1b[36m====================================================\x1b[0m")
  console.log("\x1b[36m Seeding Dan-Bam Milkoron (Class 3 Bengali) \x1b[0m")
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

  // 3. Resolve QuestionType for Dan Bam Milkoron
  let questionType = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Dan Bam Milkoron", mode: "insensitive" } },
        { nameBn: { equals: "ডান-বাম মিলকরণ", mode: "insensitive" } },
        { nameEn: { equals: "Matching Table", mode: "insensitive" } },
      ],
    },
  })

  if (!questionType) {
    console.log("QuestionType for Dan Bam Milkoron not found, creating it...")
    if (!isDryRun) {
      questionType = await prisma.questionType.create({
        data: {
          nameEn: "Dan Bam Milkoron",
          nameBn: "ডান-বাম মিলকরণ",
          label: "Dan Bam Milkoron",
          mark: 5,
          position: 24,
          descriptionEn: "Matching left and right columns",
          descriptionBn: "ডান পাশ ও বাম পাশ মিলকরণ",
          creditCost: 1,
          isActive: true,
        },
      })
    } else {
      questionType = { id: "dry-run-question-type-id" } as any
    }
  }

  console.log(`\x1b[32m✔ QuestionType:\x1b[0m ${questionType!.nameBn || questionType!.nameEn} [ID: ${questionType!.id}]`)

  // 4. Load & Parse File
  const sourceFile = findSourceFile()
  console.log(`\x1b[32m✔ Source File:\x1b[0m ${sourceFile.path}`)

  const parsedQuestions = parseQuestionsFromText(sourceFile.content, subject.chapters)
  console.log(`\x1b[32m✔ Total Questions Parsed:\x1b[0m ${parsedQuestions.length}\n`)

  // Summary preview table
  console.log("-----------------------------------------------------------------------------------------------------")
  console.log(
    `| #  | Chapter (বাংলা)`.padEnd(36) +
      `| Q# | L Cols | R Cols | Chapter ID`.padEnd(30) +
      "|"
  )
  console.log("-----------------------------------------------------------------------------------------------------")
  parsedQuestions.forEach((q, idx) => {
    const numStr = (idx + 1).toString().padStart(2)
    const chapBn = q.chapterNameBn.slice(0, 30).padEnd(30)
    const qNo = q.questionNo.padEnd(2)
    const lCount = q.leftColumn.length.toString().padStart(6)
    const rCount = q.rightColumn.length.toString().padStart(6)
    console.log(`| ${numStr} | ${chapBn} | ${qNo} | ${lCount} | ${rCount} | ${q.chapterId} |`)
  })
  console.log("-----------------------------------------------------------------------------------------------------\n")

  if (isDryRun) {
    console.log("\x1b[33m[DRY-RUN] Finished parse verification successfully without database modifications.\x1b[0m")
    return
  }

  // 5. Clean existing Class 3 Bengali DanBamMilkoron records if requested
  if (shouldClean) {
    const deleteRes = await prisma.danBamMilkoron.deleteMany({
      where: {
        subjectId: subject.id,
      },
    })
    if (deleteRes.count > 0) {
      console.log(`\x1b[33mℹ Cleaned ${deleteRes.count} existing DanBamMilkoron records for Class 3 Bengali.\x1b[0m`)
    }
  }

  // 6. Insert parsed questions
  console.log("Inserting questions into database...")
  let insertedCount = 0

  for (const q of parsedQuestions) {
    await prisma.danBamMilkoron.create({
      data: {
        leftColumn: q.leftColumn,
        rightColumn: q.rightColumn,
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

  console.log(`\n\x1b[32m✔ Successfully created ${insertedCount} DanBamMilkoron questions in Class 3 Bengali!\x1b[0m`)
}

main()
  .catch((err) => {
    console.error("\x1b[31m✖ Error executing script:\x1b[0m", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

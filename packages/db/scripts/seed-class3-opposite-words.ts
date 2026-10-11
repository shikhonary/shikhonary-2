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

interface ParsedWordItem {
  chapterId: string
  chapterNameBn: string
  word: string
}

interface ParsedPassageItem {
  chapterId: string
  chapterNameBn: string
  prompt: string
  passage: string
}

function parseOppositeWordFile(
  content: string,
  chapterList: Array<{ id: string; nameBn: string; nameEn: string }>
): { words: ParsedWordItem[]; passages: ParsedPassageItem[] } {
  const lines = content.split(/\r?\n/)

  const sec1Idx = lines.findIndex((l) => l.trim() === "বিপরীত শব্দ")
  const sec2Idx = lines.findIndex((l) => l.trim() === "অনুচ্ছেদ থেকে বিপরীত শব্দ")

  const words: ParsedWordItem[] = []
  const passages: ParsedPassageItem[] = []

  // 1. Parse Section 1: Word-level opposite words
  let currentChapterSec1: { id: string; nameBn: string; nameEn: string } | null = null
  const endSec1 = sec2Idx !== -1 ? sec2Idx : lines.length

  for (let i = sec1Idx; i < endSec1; i++) {
    const line = lines[i].trim()
    if (!line || line === "বিপরীত শব্দ") continue

    const ch = findMatchingDbChapter(line, chapterList)
    if (ch && !line.match(/^[১-৯]+\./)) {
      currentChapterSec1 = ch
      continue
    }

    const qMatch = line.match(/^([১-৯]+)\.\s*নিচের শব্দগুলোর বিপরীত শব্দ লেখো:/)
    if (qMatch && currentChapterSec1) {
      let wordLine = ""
      let j = i + 1
      while (j < endSec1) {
        const next = lines[j].trim()
        if (next === "অনুচ্ছেদ থেকে বিপরীত শব্দ" || next === "বিপরীত শব্দ") break
        if (next.match(/^([১-৯]+)\.\s*নিচের শব্দগুলোর/)) break
        if (findMatchingDbChapter(next, chapterList) && !next.match(/^[১-৯]+\./)) break
        if (next) {
          wordLine = next
          i = j
          break
        }
        j++
      }

      if (wordLine) {
        const cleaned = wordLine.replace(/[।.]/g, "")
        const rawWords = cleaned
          .split(/[,،]/)
          .map((w) => w.trim())
          .filter((w) => w.length > 0)

        // Deduplicate words within the same chapter
        const seenWords = new Set<string>()
        for (const w of rawWords) {
          if (!seenWords.has(w)) {
            seenWords.add(w)
            words.push({
              chapterId: currentChapterSec1.id,
              chapterNameBn: currentChapterSec1.nameBn,
              word: w,
            })
          }
        }
      }
    }
  }

  // 2. Parse Section 2: Passage-based opposite words (if present)
  if (sec2Idx !== -1) {
    let currentChapterSec2: { id: string; nameBn: string; nameEn: string } | null = null

    for (let i = sec2Idx; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line === "অনুচ্ছেদ থেকে বিপরীত শব্দ") continue

      const ch = findMatchingDbChapter(line, chapterList)
      if (ch && !line.match(/^[১-৯]+\./)) {
        currentChapterSec2 = ch
        continue
      }

      const qMatch = line.match(/^([১-৯]+)\.\s*(নিচের অনুচ্ছেদ থেকে[^:]+:)/)
      if (qMatch && currentChapterSec2) {
        const prompt = qMatch[2]
        const passageLines: string[] = []
        let j = i + 1
        while (j < lines.length) {
          const next = lines[j].trim()
          if (findMatchingDbChapter(next, chapterList) && !next.match(/^[১-৯]+\./)) break
          if (next.match(/^([১-৯]+)\.\s*নিচের অনুচ্ছেদ/)) break
          if (next) {
            passageLines.push(next)
          }
          j++
        }

        if (passageLines.length > 0) {
          passages.push({
            chapterId: currentChapterSec2.id,
            chapterNameBn: currentChapterSec2.nameBn,
            prompt,
            passage: passageLines.join("\n"),
          })
          i = j - 1
        }
      }
    }
  }

  return { words, passages }
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run")
  const shouldClean = !process.argv.includes("--no-clean")

  console.log("\x1b[36m====================================================\x1b[0m")
  console.log("\x1b[36m Seeding Opposite Words (Class 3 Bengali) \x1b[0m")
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

  // 3. Resolve QuestionType for Opposite Word
  let oppositeWordQt = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Opposite Word", mode: "insensitive" } },
        { nameBn: { equals: "বিপরীত শব্দ", mode: "insensitive" } },
        { label: { equals: "Opposite Word", mode: "insensitive" } },
      ],
    },
  })

  if (!oppositeWordQt) {
    console.log("QuestionType for Opposite Word not found, creating it...")
    if (!isDryRun) {
      oppositeWordQt = await prisma.questionType.create({
        data: {
          nameEn: "Opposite Word",
          nameBn: "বিপরীত শব্দ",
          label: "Opposite Word",
          mark: 5,
          position: 22,
          descriptionEn: "Opposite Word Questions",
          descriptionBn: "বিপরীত শব্দ প্রশ্নসমূহ",
          creditCost: 1,
          isActive: true,
        },
      })
    } else {
      oppositeWordQt = { id: "dry-run-ow-qt-id" } as any
    }
  }

  console.log(`\x1b[32m✔ QuestionType (Opposite Word):\x1b[0m ${oppositeWordQt!.nameBn || oppositeWordQt!.nameEn} [ID: ${oppositeWordQt!.id}]`)

  // Resolve ShortQuestion QuestionType for Section 2 passages
  const shortQuestionQt = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Short Question", mode: "insensitive" } },
        { nameBn: { equals: "সংক্ষিপ্ত প্রশ্ন", mode: "insensitive" } },
      ],
    },
  })

  // 4. Load & Parse File
  const sourceFile = findSourceFile()
  console.log(`\x1b[32m✔ Source File:\x1b[0m ${sourceFile.path}`)

  const { words, passages } = parseOppositeWordFile(sourceFile.content, subject.chapters)
  console.log(`\x1b[32m✔ Section 1 Words Parsed:\x1b[0m ${words.length}`)
  console.log(`\x1b[32m✔ Section 2 Passages Parsed:\x1b[0m ${passages.length}\n`)

  // Words breakdown by chapter
  const wordsByChapter = new Map<string, string[]>()
  words.forEach((item) => {
    const list = wordsByChapter.get(item.chapterNameBn) || []
    list.push(item.word)
    wordsByChapter.set(item.chapterNameBn, list)
  })

  console.log("-----------------------------------------------------------------------------------------------------")
  console.log(
    `| #  | Chapter (বাংলা)`.padEnd(36) +
      `| Words Count | Sample Words`.padEnd(50) +
      "|"
  )
  console.log("-----------------------------------------------------------------------------------------------------")
  let rowIdx = 1
  wordsByChapter.forEach((wList, chapName) => {
    const numStr = rowIdx.toString().padStart(2)
    const chapBn = chapName.slice(0, 30).padEnd(30)
    const countStr = wList.length.toString().padStart(11)
    const sampleStr = wList.slice(0, 4).join(", ").slice(0, 46).padEnd(46)
    console.log(`| ${numStr} | ${chapBn} | ${countStr} | ${sampleStr} |`)
    rowIdx++
  })
  console.log("-----------------------------------------------------------------------------------------------------\n")

  if (isDryRun) {
    console.log("\x1b[33m[DRY-RUN] Finished parse verification successfully without database modifications.\x1b[0m")
    return
  }

  // 5. Clean existing Class 3 Bengali OppositeWord records if requested
  if (shouldClean) {
    const deleteRes = await prisma.oppositeWord.deleteMany({
      where: {
        subjectId: subject.id,
      },
    })
    if (deleteRes.count > 0) {
      console.log(`\x1b[33mℹ Cleaned ${deleteRes.count} existing OppositeWord records for Class 3 Bengali.\x1b[0m`)
    }
  }

  // 6. Insert Section 1 Words into OppositeWord model
  console.log("Inserting OppositeWord records into database...")
  let insertedWordsCount = 0

  for (const item of words) {
    await prisma.oppositeWord.create({
      data: {
        word: item.word,
        oppositeWord: null,
        oppositeWords: [],
        reference: [],
        source: "গাইড বুক",
        session: "2026",
        difficulty: "MEDIUM",
        popularityCount: 0,
        subjectId: subject.id,
        academicChapterId: item.chapterId,
        questionTypeId: oppositeWordQt!.id,
        isGlobal: true,
        isActive: true,
      },
    })
    insertedWordsCount++
  }

  console.log(`\x1b[32m✔ Successfully created ${insertedWordsCount} OppositeWord items in Class 3 Bengali!\x1b[0m`)

  // 7. Insert Section 2 Passages into ShortQuestion model (if any)
  if (passages.length > 0) {
    console.log(`\nInserting ${passages.length} passage-based questions into ShortQuestion...`)
    let insertedPassagesCount = 0

    for (const p of passages) {
      const fullQuestionText = `${p.prompt}\n\n${p.passage}`

      // Check if duplicate already exists
      const existing = await prisma.shortQuestion.findFirst({
        where: {
          subjectId: subject.id,
          chapterId: p.chapterId,
          question: fullQuestionText,
        },
      })

      if (!existing) {
        await prisma.shortQuestion.create({
          data: {
            question: fullQuestionText,
            reference: [],
            source: "গাইড বুক",
            session: "2026",
            difficulty: "MEDIUM",
            popularityCount: 0,
            subjectId: subject.id,
            chapterId: p.chapterId,
            questionTypeId: shortQuestionQt?.id || null,
            isGlobal: true,
            isActive: true,
          },
        })
        insertedPassagesCount++
      }
    }

    console.log(`\x1b[32m✔ Successfully created ${insertedPassagesCount} passage-based ShortQuestion items!\x1b[0m`)
  }
}

main()
  .catch((err) => {
    console.error("\x1b[31m✖ Error executing script:\x1b[0m", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

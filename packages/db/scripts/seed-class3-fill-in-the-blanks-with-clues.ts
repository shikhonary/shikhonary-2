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
    resolve(process.cwd(), "dam-bam-milkoron.json"),
    resolve(process.cwd(), "dan-bam-milkoron.json"),
    resolve(import.meta.dirname, "../../../dam-bam-milkoron.json"),
    resolve(import.meta.dirname, "../../../dan-bam-milkoron.json"),
  ]

  for (const p of candidatePaths) {
    if (existsSync(p)) {
      return { path: p, content: readFileSync(p, "utf-8") }
    }
  }

  throw new Error(
    "Could not find dam-bam-milkoron.json or dan-bam-milkoron.json in the project root."
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

interface ParsedQuestionWithClues {
  section: string
  chapterId: string
  chapterNameBn: string
  chapterNameEn: string
  questionNo: string
  prompt: string
  clues: string[]
  options: string[]
  content: string | null
}

interface ParsedQuestionWithoutClues {
  section: string
  chapterId: string
  chapterNameBn: string
  chapterNameEn: string
  questionNo: string
  prompt: string
  content: string
}

function parseQuestions(
  content: string,
  chapterList: Array<{ id: string; nameBn: string; nameEn: string }>
): {
  withClues: ParsedQuestionWithClues[]
  withoutClues: ParsedQuestionWithoutClues[]
} {
  const lines = content.split(/\r?\n/)
  const withClues: ParsedQuestionWithClues[] = []
  const withoutClues: ParsedQuestionWithoutClues[] = []

  let currentSection = ""
  let currentChapter: { id: string; nameBn: string; nameEn: string } | null = null

  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line) {
      i++
      continue
    }

    if (
      line === "উপযুক্ত শব্দ নিয়ে শূন্যস্থান পূরণ" ||
      line === "শূন্যস্থান পূরণ" ||
      line === "অনুচ্ছেদে শূন্যস্থান পূরণ"
    ) {
      currentSection = line
      i++
      continue
    }

    // Check if line is a chapter header (must be followed by a question prompt within next few non-empty lines)
    const chapMatch = findMatchingDbChapter(line, chapterList)
    if (chapMatch && !line.match(/^[১-৯]+\./)) {
      let isTrueChapter = false
      for (let look = i + 1; look < Math.min(i + 5, lines.length); look++) {
        const nextLine = lines[look].trim()
        if (!nextLine) continue
        if (nextLine.match(/^[১-৯]+\./)) {
          isTrueChapter = true
          break
        }
        break
      }

      if (isTrueChapter) {
        currentChapter = chapMatch
        i++
        continue
      }
    }

    // Question header e.g. "১. উপযুক্ত শব্দটি বাছাই করে..."
    if (line.match(/^[১-৯]+\.\s+/)) {
      const qPrompt = line
      const qNumMatch = line.match(/^([১-৯]+)\./)
      const qNum = qNumMatch ? qNumMatch[1] : "১"
      i++

      const blockLines: string[] = []
      while (i < lines.length) {
        const next = lines[i].trim()
        if (
          next === "উপযুক্ত শব্দ নিয়ে শূন্যস্থান পূরণ" ||
          next === "শূন্যস্থান পূরণ" ||
          next === "অনুচ্ছেদে শূন্যস্থান পূরণ" ||
          next.match(/^[১-৯]+\.\s+/)
        ) {
          break
        }

        // Check if next is a true chapter header (followed by question number)
        const nextChap = findMatchingDbChapter(next, chapterList)
        if (nextChap && !next.match(/^[১-৯]+\./)) {
          let nextIsTrueChap = false
          for (let look = i + 1; look < Math.min(i + 5, lines.length); look++) {
            const nl = lines[look].trim()
            if (!nl) continue
            if (nl.match(/^[১-৯]+\./)) {
              nextIsTrueChap = true
              break
            }
            break
          }
          if (nextIsTrueChap) break
        }

        if (next) {
          blockLines.push(next)
        }
        i++
      }

      if (!currentChapter) {
        throw new Error(`Question found without active chapter around line ${i}: "${qPrompt}"`)
      }

      // Distinguish option sentences vs clue words vs passage
      const optionLines = blockLines.filter((l) => l.match(/^\([^\)]+\)/))
      const nonOptionLines = blockLines.filter((l) => !l.match(/^\([^\)]+\)/))

      let clues: string[] = []
      let options: string[] = []
      let content: string | null = null

      const replaceThoUnderline = (str: string) => str.replace(/থ{2,}/g, "__________")

      if (optionLines.length > 0) {
        // Sentence-based fill in the blanks
        clues = nonOptionLines.map((c) => c.trim().replace(/[।.,]/g, "").trim()).filter(Boolean)
        // Clean each option: strip leading (ক)\t or (ক), replace corrupted 'থথ...' with underline, normalize whitespace
        options = optionLines.map((opt) => {
          const cleaned = opt.replace(/^\([^\)]+\)[\s\t]*/, "").replace(/\t+/g, " ").trim()
          return replaceThoUnderline(cleaned)
        })
      } else {
        // Passage-based fill in the blanks
        // Clues are short single words, passage is longer or has gap indicators
        const passageLines = nonOptionLines.filter(
          (l) =>
            l.length > 30 ||
            l.includes("..........") ||
            l.includes("---------") ||
            l.includes("থথথথ") ||
            l.includes("————")
        )
        const clueLines = nonOptionLines.filter(
          (l) =>
            l.length <= 30 &&
            !l.includes("..........") &&
            !l.includes("---------") &&
            !l.includes("থথথথ") &&
            !l.includes("————")
        )

        if (clueLines.length > 0 && passageLines.length > 0) {
          clues = clueLines.map((c) => c.trim().replace(/[।.,]/g, "").trim()).filter(Boolean)
          content = replaceThoUnderline(passageLines.join("\n").replace(/\t+/g, " ").trim())
        } else {
          content = replaceThoUnderline(nonOptionLines.join("\n").replace(/\t+/g, " ").trim())
        }
      }

      if (clues.length > 0) {
        withClues.push({
          section: currentSection,
          chapterId: currentChapter.id,
          chapterNameBn: currentChapter.nameBn,
          chapterNameEn: currentChapter.nameEn,
          questionNo: qNum,
          prompt: qPrompt,
          clues,
          options,
          content,
        })
      } else if (content || options.length > 0) {
        const fullContent = content || options.join("\n")
        withoutClues.push({
          section: currentSection,
          chapterId: currentChapter.id,
          chapterNameBn: currentChapter.nameBn,
          chapterNameEn: currentChapter.nameEn,
          questionNo: qNum,
          prompt: qPrompt,
          content: fullContent,
        })
      }

      continue
    }

    i++
  }

  return { withClues, withoutClues }
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run")
  const shouldClean = !process.argv.includes("--no-clean")
  const includeWithoutClues = process.argv.includes("--include-without-clues")

  console.log("\x1b[36m=================================================================\x1b[0m")
  console.log("\x1b[36m Seeding Fill in the Blanks with Clues (Class 3 Bengali) \x1b[0m")
  console.log("\x1b[36m=================================================================\x1b[0m\n")

  if (isDryRun) {
    console.log("\x1b[33m[DRY-RUN MODE] No database writes will be executed.\x1b[0m\n")
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
  console.log(`\x1b[32m✔ Total Chapters in Subject:\x1b[0m ${subject.chapters.length}`)

  // 3. Resolve QuestionType for Fill in the Blanks with Clues
  let questionTypeWithClues = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Fill in the Blanks with Clues", mode: "insensitive" } },
        { label: { contains: "blanks with appropriate words", mode: "insensitive" } },
        { nameBn: { contains: "ক্লুসহ" } },
        { nameBn: { equals: "Fill in the Blanks with Clues" } },
      ],
    },
  })

  if (!questionTypeWithClues) {
    console.log("QuestionType for Fill in the Blanks with Clues not found, creating it...")
    if (!isDryRun) {
      questionTypeWithClues = await prisma.questionType.create({
        data: {
          nameEn: "Fill in the Blanks with Clues",
          nameBn: "শূন্যস্থান পূরণ (ক্লুসহ)",
          label: "Complete the passage by filling in the blanks with appropriate words from the box.",
          mark: 5,
          position: 10,
          descriptionEn: "Fill in the Blanks with Clues",
          descriptionBn: "উপযুক্ত শব্দ দিয়ে শূন্যস্থান পূরণ",
          creditCost: 1,
          isActive: true,
        },
      })
    } else {
      questionTypeWithClues = { id: "dry-run-qt-with-clues", nameEn: "Fill in the Blanks with Clues", nameBn: "শূন্যস্থান পূরণ (ক্লুসহ)" } as any
    }
  }

  console.log(`\x1b[32m✔ QuestionType (With Clues):\x1b[0m ${questionTypeWithClues!.nameBn || questionTypeWithClues!.nameEn} [ID: ${questionTypeWithClues!.id}]`)

  // 4. Load & Parse File
  const sourceFile = findSourceFile()
  console.log(`\x1b[32m✔ Source File:\x1b[0m ${sourceFile.path}\n`)

  const parsed = parseQuestions(sourceFile.content, subject.chapters)
  console.log(`\x1b[32m✔ Total 'With Clues' Questions Parsed:\x1b[0m ${parsed.withClues.length}`)
  console.log(`\x1b[34mℹ Total 'Without Clues' Questions Detected:\x1b[0m ${parsed.withoutClues.length}\n`)

  // 5. Preview Table
  console.log("--------------------------------------------------------------------------------------------------------------------------------")
  console.log(
    `| #  | Section`.padEnd(25) +
      `| Chapter (বাংলা)`.padEnd(30) +
      `| Q# | Clues | Opts | Type   | Clues Sample`.padEnd(40) +
      "|"
  )
  console.log("--------------------------------------------------------------------------------------------------------------------------------")
  parsed.withClues.forEach((q, idx) => {
    const numStr = (idx + 1).toString().padStart(2)
    const secStr = q.section.slice(0, 20).padEnd(20)
    const chapBn = q.chapterNameBn.slice(0, 24).padEnd(25)
    const qNo = q.questionNo.padEnd(2)
    const cCount = q.clues.length.toString().padStart(4)
    const oCount = (q.options.length > 0 ? q.options.length.toString() : "Passage").padStart(5)
    const typeStr = (q.content ? "Passage " : "Sentence").padEnd(8)
    const cluesSample = q.clues.slice(0, 3).join(", ").slice(0, 28).padEnd(30)
    console.log(`| ${numStr} | ${secStr} | ${chapBn} | ${qNo} | ${cCount} | ${oCount} | ${typeStr} | ${cluesSample} |`)
  })
  console.log("--------------------------------------------------------------------------------------------------------------------------------\n")

  if (isDryRun) {
    console.log("\x1b[33m[DRY-RUN] Finished preview without database modifications.\x1b[0m")
    return
  }

  // 6. Clean existing records for this subject if requested
  if (shouldClean) {
    const deleteRes = await prisma.fillInTheBlanksWithClues.deleteMany({
      where: {
        subjectId: subject.id,
      },
    })
    if (deleteRes.count > 0) {
      console.log(`\x1b[33mℹ Cleaned ${deleteRes.count} existing FillInTheBlanksWithClues records for Class 3 Bengali.\x1b[0m`)
    }
  }

  // 7. Seed FillInTheBlanksWithClues records
  console.log("Inserting Fill in the Blanks with Clues questions into database...")
  let insertedWithCluesCount = 0

  for (const q of parsed.withClues) {
    await prisma.fillInTheBlanksWithClues.create({
      data: {
        content: q.content,
        options: q.options,
        clues: q.clues,
        reference: [],
        source: "গাইড বুক",
        session: "2026",
        difficulty: "MEDIUM",
        popularityCount: 0,
        subjectId: subject.id,
        academicChapterId: q.chapterId,
        questionTypeId: questionTypeWithClues!.id,
        isGlobal: true,
        isActive: true,
      },
    })
    insertedWithCluesCount++
  }

  const totalInDb = await prisma.fillInTheBlanksWithClues.count({
    where: {
      subjectId: subject.id,
    },
  })

  console.log(`\n\x1b[1m\x1b[32m✔ Successfully seeded ${insertedWithCluesCount} FillInTheBlanksWithClues records across Class 3 Bengali chapters!\x1b[0m`)
  console.log(`\x1b[32m✔ Total FillInTheBlanksWithClues records in DB for this subject: ${totalInDb}\x1b[0m`)

  // 8. Optionally seed Without Clues questions if flag provided
  if (includeWithoutClues && parsed.withoutClues.length > 0) {
    console.log(`\n\x1b[34mℹ Seeding ${parsed.withoutClues.length} Without Clues questions (--include-without-clues flag active)...\x1b[0m`)
    let questionTypeWithoutClues = await prisma.questionType.findFirst({
      where: {
        OR: [
          { nameEn: { equals: "Fill in the Blanks without Clues", mode: "insensitive" } },
          { nameBn: { equals: "শূন্যস্থান পূরণ" } },
        ],
      },
    })

    if (!questionTypeWithoutClues) {
      questionTypeWithoutClues = await prisma.questionType.findFirst({
        where: { nameEn: { contains: "without", mode: "insensitive" } },
      })
    }

    if (shouldClean) {
      await prisma.fillInTheBlanksWithoutClues.deleteMany({
        where: {
          subjectId: subject.id,
          source: "গাইড বুক",
          session: "2026",
        },
      })
    }

    let insertedWithoutClues = 0
    for (const q of parsed.withoutClues) {
      await prisma.fillInTheBlanksWithoutClues.create({
        data: {
          content: q.content,
          reference: [],
          source: "গাইড বুক",
          session: "2026",
          difficulty: "MEDIUM",
          popularityCount: 0,
          subjectId: subject.id,
          academicChapterId: q.chapterId,
          questionTypeId: questionTypeWithoutClues!.id,
          isGlobal: true,
          isActive: true,
        },
      })
      insertedWithoutClues++
    }
    console.log(`\x1b[32m✔ Successfully seeded ${insertedWithoutClues} FillInTheBlanksWithoutClues records!\x1b[0m`)
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

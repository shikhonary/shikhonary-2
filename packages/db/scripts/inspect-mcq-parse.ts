import { config } from "dotenv"
import { resolve } from "node:path"
import { readFileSync } from "node:fs"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/main/client.js"

config({ path: resolve(import.meta.dirname, "../../../.env") })
config({ path: resolve(import.meta.dirname, "../.env") })
config()

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

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

interface ParsedMcq {
  question: string
  options: string[]
}

interface ChapterMcqs {
  chapterName: string
  chapterId: string | null
  questions: ParsedMcq[]
}

async function run() {
  const content = readFileSync(resolve(import.meta.dirname, "../../../dam-bam-milkoron.json"), "utf-8")
  const lines = content.split(/\r?\n/)

  const chapters = await prisma.academicChapter.findMany({
    where: { subjectId: "cmu18mwe30001gctyq6fgwri7" },
    select: { id: true, nameBn: true, nameEn: true },
  })

  const results: ChapterMcqs[] = []
  let currentChapter: string | null = null
  let currentQuestions: ParsedMcq[] = []

  let pendingQuestion: string | null = null
  let pendingOptions: string[] = []

  function flushPending() {
    if (pendingQuestion && pendingOptions.length > 0) {
      currentQuestions.push({
        question: pendingQuestion,
        options: [...pendingOptions]
      })
    }
    pendingQuestion = null
    pendingOptions = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line === "সঠিক উত্তর") continue

    if (line === "সঠিক উত্তরটি উত্তরপত্রে লেখো।") {
      continue
    }

    // Check if line is a chapter header
    const matchedChap = findMatchingDbChapter(line, chapters)
    if (matchedChap && !line.includes("?") && !line.startsWith("ক") && !line.startsWith("গ") && !line.includes("—")) {
      flushPending()
      if (currentChapter && currentQuestions.length > 0) {
        const dbC = findMatchingDbChapter(currentChapter, chapters)
        results.push({
          chapterName: currentChapter,
          chapterId: dbC ? dbC.id : null,
          questions: currentQuestions
        })
      }
      currentChapter = line
      currentQuestions = []
      continue
    }

    // Check if line contains options (tabs or spacing separating ক, খ, গ, ঘ)
    // Examples: "ক মেলা  খ হাট", "গ স্কুল  ঘ ছুটি", "ক এক    খ দুই"
    const hasOptions = line.match(/(?:^|\s)[ক-ঘ]\s+/)
    if (hasOptions) {
      // Parse individual options from this line
      // E.g. "ক মেলা\tখ হাট" -> ["মেলা", "হাট"]
      // Let's split by regex matching "ক ", "খ ", "গ ", "ঘ "
      const optionMatches = line.split(/(?=[কখগঘ]\s+)/).map(s => s.trim()).filter(Boolean)
      for (const optStr of optionMatches) {
        const text = optStr.replace(/^[কখগঘ]\s+/, "").trim()
        if (text) {
          pendingOptions.push(text)
        }
      }
      continue
    }

    // If it's not options and not chapter, it's a question!
    if (line.endsWith("?") || line.includes("কী") || line.includes("কার") || line.includes("কেমন") || line.includes("—") || line.includes("কোন")) {
      flushPending()
      pendingQuestion = line
    } else {
      // Possible continuation or standalone question
      if (!pendingQuestion) {
        pendingQuestion = line
      } else {
        // flush and new
        flushPending()
        pendingQuestion = line
      }
    }
  }

  flushPending()
  if (currentChapter && currentQuestions.length > 0) {
    const dbC = findMatchingDbChapter(currentChapter, chapters)
    results.push({
      chapterName: currentChapter,
      chapterId: dbC ? dbC.id : null,
      questions: currentQuestions
    })
  }

  console.log(`Parsed ${results.length} chapters:`)
  let totalQ = 0
  for (const r of results) {
    totalQ += r.questions.length
    const sample = r.questions[0]
    console.log(`- ${r.chapterName} => DB Chapter ID: ${r.chapterId ? "YES" : "NO"} (${r.questions.length} questions)`)
    if (sample) {
      console.log(`    Sample: "${sample.question}" -> Options (${sample.options.length}): ${sample.options.join(" | ")}`)
    }
  }
  console.log(`Total questions parsed: ${totalQ}`)
}

run().catch(console.error).finally(() => process.exit(0))

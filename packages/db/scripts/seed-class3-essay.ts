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

function parseEssayTitles(content: string): string[] {
  const lines = content.split(/\r?\n/)
  const seen = new Set<string>()
  const result: string[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line === "রচনা") continue
    if (!seen.has(line)) {
      seen.add(line)
      result.push(line)
    }
  }

  return result
}

async function main() {
  console.log("\x1b[36m=== Seeding Class 3 Bengali Essays (রচনা) ===\x1b[0m\n")

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
          academicSubject: true,
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

  // 3. Resolve QuestionType for Essay
  let questionType = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Essay", mode: "insensitive" } },
        { nameBn: { equals: "রচনা" } },
        { label: { contains: "প্রবন্ধ রচনা" } },
      ],
    },
  })
  if (!questionType) {
    questionType = await prisma.questionType.create({
      data: {
        nameEn: "Essay",
        nameBn: "রচনা",
        label: "যেকোনো একটি বিষয়ে প্রবন্ধ রচনা করো:",
        mark: 20,
        position: 8,
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
  const titles = parseEssayTitles(content)
  console.log(`\x1b[35m=== Parsed ${titles.length} Unique Essay Titles from Input ===\x1b[0m\n`)

  // 5. Clean up old records with source: "গাইড বুক" and session: "2026"
  const deletedOld = await prisma.essay.deleteMany({
    where: {
      subjectId: subject.id,
      source: "গাইড বুক",
      session: "2026",
    },
  })
  if (deletedOld.count > 0) {
    console.log(`\x1b[33mℹ Cleaned up ${deletedOld.count} previously seeded Essays for 2026 গাইড বুক.\x1b[0m\n`)
  }

  // 6. Seed Essay records
  let totalInserted = 0
  const summary: Array<{ index: number; title: string }> = []

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i]

    await prisma.essay.create({
      data: {
        title,
        reference: [],
        source: "গাইড বুক",
        session: "2026",
        difficulty: "MEDIUM",
        subjectId: subject.id,
        questionTypeId: questionType.id,
        isGlobal: true,
        isActive: true,
      },
    })
    totalInserted++

    summary.push({
      index: i + 1,
      title,
    })
  }

  console.log("\x1b[32m=== Seeding Complete ===\x1b[0m")
  console.table(summary)
  console.log(`\n\x1b[1m\x1b[32m✔ Successfully seeded ${totalInserted} Essay records!\x1b[0m\n`)
}

main()
  .catch((e) => {
    console.error("\x1b[31mError during seeding:\x1b[0m", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

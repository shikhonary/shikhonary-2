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

interface FormFillingItem {
  scenario: string
  institution?: string | null
  title?: string | null
  description?: string | null
  hasPhoto?: boolean
  formData: Record<string, any>
  solution?: Record<string, any> | null
  declaration?: string | null
  signatures?: string[]
  reference?: string[]
  source?: string
  session?: string
  difficulty?: string
  popularityCount?: number
}

function findSourceFile(): { path: string; content: string } {
  const candidatePaths = [
    resolve(process.cwd(), "form-filling.json"),
    resolve(import.meta.dirname, "../../../form-filling.json"),
    resolve(import.meta.dirname, "../../form-filling.json"),
  ]

  for (const p of candidatePaths) {
    if (existsSync(p)) {
      return { path: p, content: readFileSync(p, "utf-8") }
    }
  }

  throw new Error("Could not find form-filling.json in project root or current working directory.")
}

async function main() {
  console.log("\x1b[36m=== Seeding Class 3 Bengali Form Fillup (ফরম পূরণ) ===\x1b[0m\n")

  const { path: sourcePath, content } = findSourceFile()
  console.log(`\x1b[34mℹ Reading source file from: ${sourcePath}\x1b[0m\n`)

  const items: FormFillingItem[] = JSON.parse(content)
  console.log(`\x1b[35m=== Loaded ${items.length} Form Fillup Items ===\x1b[0m\n`)

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



  // 3. Resolve QuestionType for Form Fillup
  let questionType = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Form Fillup", mode: "insensitive" } },
        { nameBn: { equals: "ফরম পূরণ" } },
        { label: { contains: "ফরম পূরণ" } },
      ],
    },
  })

  if (!questionType) {
    questionType = await prisma.questionType.create({
      data: {
        nameEn: "Form Fillup",
        nameBn: "ফরম পূরণ",
        label: "নিচের ফরমটি পূরণ করো:",
        mark: 5,
        position: 30,
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

  // 4. Clean up old records with source: "গাইড বুক" and session: "2026"
  const deletedOld = await prisma.formFillup.deleteMany({
    where: {
      subjectId: subject.id,
      source: "গাইড বুক",
      session: "2026",
    },
  })
  if (deletedOld.count > 0) {
    console.log(`\x1b[33mℹ Cleaned up ${deletedOld.count} previously seeded FormFillups for 2026 গাইড বুক.\x1b[0m\n`)
  }

  // 5. Seed FormFillup records
  let totalInserted = 0
  const summary: Array<{ index: number; scenario: string; institution: string; title: string }> = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    await prisma.formFillup.create({
      data: {
        scenario: item.scenario,
        institution: item.institution ?? null,
        title: item.title ?? null,
        description: item.description ?? null,
        hasPhoto: item.hasPhoto ?? false,
        formData: item.formData,
        solution: item.solution ?? null,
        declaration: item.declaration ?? null,
        signatures: item.signatures ?? [],
        reference: item.reference ?? [],
        source: item.source ?? "গাইড বুক",
        session: item.session ?? "2026",
        difficulty: item.difficulty ?? "EASY",
        popularityCount: item.popularityCount ?? 0,
        subjectId: subject.id,
        academicChapterId: null,
        questionTypeId: questionType.id,
        isGlobal: true,
        isActive: true,
      },
    })
    totalInserted++

    summary.push({
      index: i + 1,
      scenario: item.scenario.length > 40 ? item.scenario.slice(0, 37) + "..." : item.scenario,
      institution: item.institution ?? "N/A",
      title: item.title ?? "N/A",
    })
  }

  console.log("\x1b[32m=== Seeding Complete ===\x1b[0m")
  console.table(summary)
  console.log(`\n\x1b[1m\x1b[32m✔ Successfully seeded ${totalInserted} FormFillup records!\x1b[0m\n`)
}

main()
  .catch((e) => {
    console.error("\x1b[31mError during seeding:\x1b[0m", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

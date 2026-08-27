import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient as MainPrismaClient } from "../../generated/main/client.js"
import { PrismaClient as TenantPrismaClient } from "../../generated/tenant/client.js"

const mainConnectionString = process.env.MAIN_DATABASE_URL
const tenantConnectionString = "postgresql://neondb_owner:npg_N9mqxHyzla0U@ep-noisy-cherry-azw3ztbf-pooler.c-3.ap-southeast-1.aws.neon.tech:5432/tenant_basic?sslmode=verify-full"

if (!mainConnectionString) {
  console.error("ERROR: MAIN_DATABASE_URL not set in environment.")
  process.exit(1)
}

const mainAdapter = new PrismaPg({ connectionString: mainConnectionString })
const mainPrisma = new MainPrismaClient({ adapter: mainAdapter })

const tenantAdapter = new PrismaPg({ connectionString: tenantConnectionString })
const tenantPrisma = new TenantPrismaClient({ adapter: tenantAdapter })

// Import the service function logic directly to execute in Node.js
async function simulateGetAvailableQuestions(input: any) {
  const { subjectId, chapterId, questionTypeId, category, difficulty, search, year, excludePaperId, limit = 50, cursor } = input

  const excludedMcqIds = new Set<string>()
  const excludedCqIds = new Set<string>()
  const excludedShortIds = new Set<string>()

  if (excludePaperId) {
    const existing = await tenantPrisma.questionPaperQuestion.findMany({
      where: { questionPaperId: excludePaperId },
      select: { mcqId: true, cqId: true, shortAnswerId: true },
    })
    for (const q of existing) {
      if (q.mcqId) excludedMcqIds.add(q.mcqId)
      if (q.cqId) excludedCqIds.add(q.cqId)
      if (q.shortAnswerId) excludedShortIds.add(q.shortAnswerId)
    }
  }

  const whereCommon: any = {
    subjectId,
    isActive: true,
  }
  if (chapterId && chapterId !== "all" && chapterId !== "All") whereCommon.chapterId = chapterId
  if (questionTypeId && questionTypeId !== "all" && questionTypeId !== "All") whereCommon.questionTypeId = questionTypeId
  if (difficulty && difficulty !== "all" && difficulty !== "All") whereCommon.difficulty = difficulty
  if (year) whereCommon.year = year

  console.log(`[Simulation] category: ${category}, whereCommon:`, whereCommon)

  if (category === "CQ") {
    const where: any = { ...whereCommon }
    if (search && search.trim()) {
      where.OR = [
        { questionA: { contains: search.trim(), mode: "insensitive" } },
        { questionB: { contains: search.trim(), mode: "insensitive" } },
        { context: { contains: search.trim(), mode: "insensitive" } },
      ]
    }
    const cqs = await mainPrisma.cq.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        chapter: true,
        questionType: true,
        answer: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const hasNext = cqs.length > limit
    const items = hasNext ? cqs.slice(0, limit) : cqs
    return {
      category: "CQ",
      count: items.length,
      items: items.map((c) => ({ id: c.id, questionA: c.questionA.substring(0, 30), isAssigned: excludedCqIds.has(c.id) }))
    }
  }

  if (category === "SHORT") {
    const where: any = { ...whereCommon }
    if (search && search.trim()) {
      where.question = { contains: search.trim(), mode: "insensitive" }
    }
    const shorts = await mainPrisma.shortAnswer.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        chapter: true,
        questionType: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const hasNext = shorts.length > limit
    const items = hasNext ? shorts.slice(0, limit) : shorts
    return {
      category: "SHORT",
      count: items.length,
      items: items.map((s) => ({ id: s.id, question: s.question.substring(0, 30), isAssigned: excludedShortIds.has(s.id) }))
    }
  }

  // Default: MCQ
  const where: any = { ...whereCommon }
  if (search && search.trim()) {
    where.question = { contains: search.trim(), mode: "insensitive" }
  }
  const mcqs = await mainPrisma.mcq.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    include: {
      chapter: true,
      questionType: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const hasNext = mcqs.length > limit
  const items = hasNext ? mcqs.slice(0, limit) : mcqs
  return {
    category: "MCQ",
    count: items.length,
    items: items.map((m) => ({ id: m.id, question: m.question.substring(0, 30), isAssigned: excludedMcqIds.has(m.id) }))
  }
}

async function run() {
  const subjectId = "cmtbdlkmt0009h4uyd15t9qk4"
  const paperId = "cd531881-ec5a-4dac-93dc-9b831f6a02b9"

  console.log("--- SIMULATING CQ ---")
  const cqResult = await simulateGetAvailableQuestions({
    subjectId,
    questionTypeId: "cmtbdoj2q000gh4uy6rxw4yul",
    category: "CQ",
    excludePaperId: paperId
  })
  console.log("CQ result count:", cqResult.count)

  console.log("\n--- SIMULATING MCQ ---")
  const mcqResult = await simulateGetAvailableQuestions({
    subjectId,
    questionTypeId: "cmtbdndrw000fh4uysik2hq39",
    category: "MCQ",
    excludePaperId: paperId
  })
  console.log("MCQ result count:", mcqResult.count)

  console.log("\n--- SIMULATING SHORT (SAQ) ---")
  const shortResult = await simulateGetAvailableQuestions({
    subjectId,
    questionTypeId: "cmtbdu852000hh4uyu9s48kba",
    category: "SHORT",
    excludePaperId: paperId
  })
  console.log("SHORT result count:", shortResult.count)
}

run().catch(console.error).finally(() => {
  mainPrisma.$disconnect()
  tenantPrisma.$disconnect()
})

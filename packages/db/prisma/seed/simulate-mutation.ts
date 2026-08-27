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

async function simulateBulkAssignQuestions(input: any) {
  const paper = await tenantPrisma.questionPaper.findUnique({
    where: { id: input.questionPaperId },
  })
  if (!paper) throw new Error("Paper not found")

  const dist = await tenantPrisma.questionPaperSubjectMarkDistribution.findUnique({
    where: { id: input.distributionId },
  })
  if (!dist) throw new Error("Distribution not found")

  const highest = await tenantPrisma.questionPaperQuestion.findFirst({
    where: { questionPaperId: input.questionPaperId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  })
  let nextOrder = (highest?.orderIndex ?? -1) + 1

  const recordsToCreate: any[] = []

  if (input.mcqIds && input.mcqIds.length > 0) {
    for (const mcqId of input.mcqIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        mcqId,
        distributionId: input.distributionId,
        sectionId: input.sectionId ?? null,
        orderIndex: nextOrder++,
      })
    }
  }

  console.log(`[Simulation] paper status: ${paper.status}`)
  console.log(`[Simulation] records to create:`, recordsToCreate)

  for (const record of recordsToCreate) {
    if (paper.status === "Published") {
      if (record.mcqId) {
        console.log(`[Simulation] Published paper: querying db.mcq.findUnique for ID ${record.mcqId}...`)
        record.contentSnapshot = (await mainPrisma.mcq.findUnique({ where: { id: record.mcqId } })) as any
      }
    }
    console.log(`[Simulation] upserting record...`)
    await tenantPrisma.questionPaperQuestion.upsert({
      where: record.mcqId
        ? { questionPaperId_mcqId: { questionPaperId: input.questionPaperId, mcqId: record.mcqId } }
        : { questionPaperId_cqId: { questionPaperId: input.questionPaperId, cqId: record.cqId } },
      create: record,
      update: { distributionId: input.distributionId, sectionId: input.sectionId ?? null },
    })
  }

  console.log(`[Simulation] Mutation Succeeded!`)
}

async function run() {
  const paperId = "0f920445-8770-4668-be25-3bc47a271611" // Published paper
  const distributionId = "322c110e-dc62-433d-ac83-8d5eef828843" // CQ distribution (just for testing the endpoint connection, let's pass a real MCQ id to mcqIds)
  const mcqId = "cmtbgxwob0000ywuyesxc0ham"

  console.log("Running simulated MCQ bulkAssignQuestions on Published paper...")
  await simulateBulkAssignQuestions({
    questionPaperId: paperId,
    distributionId,
    mcqIds: [mcqId]
  })
}

run().catch(console.error).finally(() => {
  mainPrisma.$disconnect()
  tenantPrisma.$disconnect()
})

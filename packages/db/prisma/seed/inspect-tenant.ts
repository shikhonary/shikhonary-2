import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient as MainPrismaClient } from "../../generated/main/client.js"
import { PrismaClient as TenantPrismaClient } from "../../generated/tenant/client.js"

const mainConnectionString = process.env.MAIN_DATABASE_URL

if (!mainConnectionString) {
  console.error("ERROR: MAIN_DATABASE_URL not set in environment.")
  process.exit(1)
}

const mainAdapter = new PrismaPg({ connectionString: mainConnectionString })
const mainPrisma = new MainPrismaClient({ adapter: mainAdapter })

async function main() {
  console.log("Analyzing main database tenants...")

  const tenants = await mainPrisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      connectionString: true
    }
  })

  console.log(`Found ${tenants.length} tenants:`)
  for (const tenant of tenants) {
    console.log(`Tenant: ${tenant.name} (${tenant.slug})`)
    console.log(`  ID: ${tenant.id}`)
    console.log(`  ConnString: ${tenant.connectionString}`)

    if (tenant.connectionString) {
      try {
        const tenantAdapter = new PrismaPg({ connectionString: tenant.connectionString })
        const tenantPrisma = new TenantPrismaClient({ adapter: tenantAdapter })

        const papers = await tenantPrisma.questionPaper.findMany({
          include: {
            subjects: {
              include: {
                distributions: true
              }
            },
            questions: true
          }
        })

        console.log(`  Found ${papers.length} question papers:`)
        for (const paper of papers) {
          console.log(`    Paper ID: ${paper.id}, Title: ${paper.title}, Status: ${paper.status}`)
          for (const sub of paper.subjects) {
            console.log(`      Subject: ${sub.subjectName} (${sub.subjectId})`)
            for (const dist of sub.distributions) {
              console.log(`        Distribution: ID ${dist.id}, Type ID ${dist.questionTypeId}, Name ${dist.questionTypeName}, Target ${dist.questionCount}`)
            }
          }
          console.log(`      Questions assigned: ${paper.questions.length}`)
          for (const q of paper.questions) {
            console.log(`        Question ID: ${q.id}, MCQ ID: ${q.mcqId}, CQ ID: ${q.cqId}, SHORT ID: ${q.shortAnswerId}`)
          }
        }

        await tenantPrisma.$disconnect()
      } catch (err: any) {
        console.error(`  Error connecting to tenant DB: ${err.message}`)
      }
    }
  }
}

main().catch(console.error).finally(() => {
  mainPrisma.$disconnect()
})

import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/main/client.js"

const connectionString = process.env.MAIN_DATABASE_URL
if (!connectionString) {
  console.error("ERROR: MAIN_DATABASE_URL is not set.")
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Analyzing Database...")

  const mcqCount = await prisma.mcq.count()
  const cqCount = await prisma.cq.count()
  const shortCount = await prisma.shortAnswer.count()

  console.log(`Total MCQ count: ${mcqCount}`)
  console.log(`Total CQ count: ${cqCount}`)
  console.log(`Total ShortAnswer count: ${shortCount}`)

  const mcqTypes = await prisma.mcq.groupBy({
    by: ['questionTypeId'],
    _count: { id: true }
  })
  console.log("MCQ grouped by questionTypeId:", mcqTypes)

  const cqTypes = await prisma.cq.groupBy({
    by: ['questionTypeId'],
    _count: { id: true }
  })
  console.log("CQ grouped by questionTypeId:", cqTypes)

  const shortTypes = await prisma.shortAnswer.groupBy({
    by: ['questionTypeId'],
    _count: { id: true }
  })
  console.log("ShortAnswer grouped by questionTypeId:", shortTypes)

  const qtypes = await prisma.questionType.findMany({
    select: { id: true, nameEn: true, nameBn: true, label: true }
  })
  console.log("QuestionTypes in DB:", qtypes)
}

main().catch(console.error).finally(() => prisma.$disconnect())

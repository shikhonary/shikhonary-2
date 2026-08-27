import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient as MainPrismaClient } from "../../generated/main/client.js"

const mainConnectionString = process.env.MAIN_DATABASE_URL

if (!mainConnectionString) {
  console.error("ERROR: MAIN_DATABASE_URL not set in environment.")
  process.exit(1)
}

const mainAdapter = new PrismaPg({ connectionString: mainConnectionString })
const mainPrisma = new MainPrismaClient({ adapter: mainAdapter })

async function main() {
  const subjectId = "cmtbdlkmt0009h4uyd15t9qk4"
  console.log(`Querying questions for subjectId: ${subjectId}...`)

  const mcqs = await mainPrisma.mcq.findMany({
    where: {
      subjectId
    }
  })
  console.log(`Found ${mcqs.length} MCQs for subject:`)
  for (const m of mcqs) {
    console.log(`  MCQ: ID ${m.id}, Question ${m.question.substring(0, 30)}, Type ${m.type}, Difficulty ${m.difficulty}, TypeID ${m.questionTypeId}`)
  }

  const shorts = await mainPrisma.shortAnswer.findMany({
    where: {
      subjectId
    }
  })
  console.log(`Found ${shorts.length} ShortAnswers for subject:`)
  for (const s of shorts) {
    console.log(`  Short: ID ${s.id}, Question ${s.question.substring(0, 30)}, Difficulty ${s.difficulty}, TypeID ${s.questionTypeId}`)
  }
}

main().catch(console.error).finally(() => {
  mainPrisma.$disconnect()
})

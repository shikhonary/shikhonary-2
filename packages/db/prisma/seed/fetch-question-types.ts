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
  console.log("Fetching Question Types from Database...\n")

  const questionTypes = await prisma.questionType.findMany({
    orderBy: { position: "asc" },
    select: {
      id: true,
      nameEn: true,
      nameBn: true,
      label: true,
      mark: true,
      position: true,
      isActive: true,
      descriptionEn: true,
      descriptionBn: true,
    },
  })

  console.table(
    questionTypes.map((qt) => ({
      ID: qt.id,
      "English Name": qt.nameEn,
      "Bangla Name": qt.nameBn,
      Mark: qt.mark,
      Position: qt.position,
      Active: qt.isActive ? "Yes" : "No",
      Label: qt.label ?? "-",
    }))
  )

  console.log("\nRaw JSON format:")
  console.log(JSON.stringify(questionTypes, null, 2))
}

main()
  .catch((e) => {
    console.error("Error fetching question types:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/main/client.js"

const connectionString = process.env.MAIN_DATABASE_URL
if (!connectionString) {
  console.error("ERROR: MAIN_DATABASE_URL is not set in environment variables.")
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding main database...")

  await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: {
      name: "USER",
      description: "Default standard user role",
    },
  })

  await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "SUPER_ADMIN",
      description: "Super administrator role",
    },
  })

  await prisma.role.upsert({
    where: { name: "STUDENT" },
    update: {},
    create: {
      name: "STUDENT",
      description: "Enrolled student role",
    },
  })

  await prisma.role.upsert({
    where: { name: "Student" },
    update: {},
    create: {
      name: "Student",
      description: "Enrolled student role",
    },
  })

  console.log("Main database seeded successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

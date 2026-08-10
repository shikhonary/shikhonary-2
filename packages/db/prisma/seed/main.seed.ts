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

  const roles = [
    { name: "SUPER_ADMIN", description: "Super administrator role" },
    { name: "Admin", description: "Union Parishad Secretary / Admin" },
    { name: "Chairman", description: "Union Parishad Chairman" },
    { name: "Member", description: "Union Parishad Ward Member" },
    { name: "User", description: "General Citizen / User" },
  ]

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    })
  }

  console.log("Main database seeded successfully with UP roles.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

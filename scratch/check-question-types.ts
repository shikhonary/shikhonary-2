import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.js";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "packages/db/.env") });

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: connectionString! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const types = await prisma.questionType.findMany();
  console.log("QuestionTypes in DB:", types.map(t => ({ id: t.id, nameEn: t.nameEn, nameBn: t.nameBn })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

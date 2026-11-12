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
  const sa = await prisma.shortAnswer.findMany({
    select: { questionType: { select: { nameEn: true, nameBn: true } } }
  });
  const map: Record<string, number> = {};
  for (const s of sa) {
    const k = s.questionType ? s.questionType.nameEn : "None";
    map[k] = (map[k] || 0) + 1;
  }
  console.log("ShortAnswer QuestionTypes distribution:", map);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

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
  const count = await prisma.shortAnswer.count();
  console.log("Total ShortAnswer count in DB:", count);
  if (count > 0) {
    const sample = await prisma.shortAnswer.findFirst({
      include: { questionType: true, subject: true, chapter: true }
    });
    console.log("Sample ShortAnswer:", JSON.stringify(sample, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

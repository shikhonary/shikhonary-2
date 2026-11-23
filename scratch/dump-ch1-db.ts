import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.ts";
import { config } from "dotenv";
import { resolve } from "path";

const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: connectionString! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const ch1Questions = await prisma.shortAnswer.findMany({
    where: { chapterId: "cmwrmiy4g00007ktofcf1fs7i" },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Total in Chapter 1 DB: ${ch1Questions.length}`);
  ch1Questions.forEach((q, idx) => {
    console.log(`${idx}: [${q.id}] ${q.question}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);

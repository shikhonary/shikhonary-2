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
  const ch2Questions = await prisma.shortAnswer.findMany({
    where: { chapterId: "cmwrmiy7i00017kto9z8ipkhy" },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Total in DB: ${ch2Questions.length}`);
  ch2Questions.forEach((q, idx) => {
    console.log(`${idx}: [${q.id}] ${q.question}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);

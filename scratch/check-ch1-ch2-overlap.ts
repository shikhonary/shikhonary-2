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
  // Get all SA in Chapter 1 ("ভূগোল ও পরিবেশ")
  const ch1Questions = await prisma.shortAnswer.findMany({
    where: { chapterId: "cmwrmiy4g00007ktofcf1fs7i" },
    select: { id: true, question: true }
  });

  // Get all SA in Chapter 2 ("মহাবিশ্ব ও আমাদের পৃথিবী")
  const ch2Questions = await prisma.shortAnswer.findMany({
    where: { chapterId: "cmwrmiy7i00017kto9z8ipkhy" },
    select: { id: true, question: true }
  });

  console.log(`Chapter 1 SA count in DB: ${ch1Questions.length}`);
  console.log(`Chapter 2 SA count in DB: ${ch2Questions.length}`);

  function norm(str: string) {
    return str.replace(/[।?？！.,:;\"'“”‘’—\-\s]/g, "").trim().toLowerCase();
  }

  const ch1NormSet = new Set(ch1Questions.map(q => norm(q.question)));

  let inCh1AndCh2 = 0;
  const overlap: any[] = [];
  ch2Questions.forEach((q, idx) => {
    if (ch1NormSet.has(norm(q.question))) {
      inCh1AndCh2++;
      overlap.push({ idx, id: q.id, question: q.question });
    }
  });

  console.log(`\nOverlap: How many Chapter 2 questions exist in Chapter 1: ${inCh1AndCh2}`);
  console.log(`Chapter 2 count without overlap: ${ch2Questions.length - inCh1AndCh2}`);

  overlap.forEach(o => {
    console.log(`- [${o.idx}]: ${o.question}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);

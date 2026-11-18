import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.js";

const WORKSPACE_ROOT = resolve(import.meta.dirname, "..");
config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });
config();

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: connectionString! });
const prisma = new PrismaClient({ adapter });

async function verify(chapterId: string) {
  const chapter = await prisma.academicChapter.findUnique({
    where: { id: chapterId },
    include: { subject: true },
  });

  if (!chapter) {
    console.error(`Chapter "${chapterId}" not found!`);
    process.exit(1);
  }

  const sas = await prisma.shortAnswer.findMany({
    where: { chapterId: chapter.id },
    orderBy: { createdAt: "asc" },
  });

  const diffs: Record<string, number> = {};
  let invalidRefs = 0;

  for (const s of sas) {
    diffs[s.difficulty] = (diffs[s.difficulty] || 0) + 1;
    for (const r of s.reference) {
      if (r.startsWith("প্রশ্ন নং") || r.startsWith("অনন্য প্রশ্ন") || /cite:/i.test(r)) {
        invalidRefs++;
      }
    }
  }

  console.log(`\nVerified ${sas.length} ShortAnswers in Chapter "${chapter.nameBn}" (${chapter.id}):`);
  console.log(`Subject: ${chapter.subject.nameBn} (${chapter.subjectId})`);
  console.log(`Difficulty Breakdown:`, diffs);
  console.log(`Invalid References: ${invalidRefs}`);

  console.log("\nSamples:");
  const samples = [sas[0], sas[1], sas[sas.length - 1]].filter(Boolean);
  for (const s of samples) {
    console.log(`- [${s.difficulty}] Q: ${s.question.slice(0, 50)}... | Answer: ${s.answer ? s.answer.slice(0, 30) : 'null'} | Refs: ${JSON.stringify(s.reference)}`);
  }
}

const targetChapter = process.argv[2] || "cmwlwu88g0005k4tofimidxfl";
verify(targetChapter)
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

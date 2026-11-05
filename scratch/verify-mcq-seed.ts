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

function getBengaliVariants(str: string): string[] {
  const trimmed = str.trim();
  const canon = trimmed
    .replace(/\u09AF\u09BC/g, "\u09DF")
    .replace(/\u09A1\u09BC/g, "\u09DC")
    .replace(/\u09A2\u09BC/g, "\u09DD");
  const decomp = trimmed
    .replace(/\u09DF/g, "\u09AF\u09BC")
    .replace(/\u09DC/g, "\u09A1\u09BC")
    .replace(/\u09DD/g, "\u09A2\u09BC");
  const vowelNorm = canon.replace(/ী/g, "ি").replace(/ূ/g, "ু");
  return [...new Set([trimmed, canon, decomp, vowelNorm])];
}

async function verify(chapterNameOrId: string) {
  let chapter = await prisma.academicChapter.findUnique({
    where: { id: chapterNameOrId },
    include: { subject: true },
  });

  if (!chapter) {
    const variants = getBengaliVariants(chapterNameOrId);
    const searchConditions = variants.flatMap((v) => [
      { nameBn: v },
      { nameEn: { equals: v, mode: "insensitive" as const } },
    ]);

    chapter = await prisma.academicChapter.findFirst({
      where: {
        subject: { nameBn: { contains: "বাংলা ২য় পত্র" } },
        OR: searchConditions,
        isActive: true,
      },
      include: { subject: true },
      orderBy: { position: "desc" },
    });

    if (!chapter) {
      chapter = await prisma.academicChapter.findFirst({
        where: { OR: searchConditions, isActive: true },
        include: { subject: true },
      });
    }

    if (!chapter) {
      const partialConditions = variants.flatMap((v) => [
        { nameBn: { contains: v, mode: "insensitive" as const } },
        { nameEn: { contains: v, mode: "insensitive" as const } },
      ]);
      chapter = await prisma.academicChapter.findFirst({
        where: { OR: partialConditions, isActive: true },
        include: { subject: true },
      });
    }
  }

  if (!chapter) {
    console.error(`Chapter "${chapterName}" not found!`);
    process.exit(1);
  }

  const mcqs = await prisma.mcq.findMany({
    where: { chapterId: chapter.id },
    include: { attachments: true },
    orderBy: { createdAt: "asc" },
  });

  const types: Record<string, number> = {};
  let withAttachments = 0;
  let invalidRefs = 0;
  let emptyAnswer = 0;

  for (const m of mcqs) {
    types[m.type] = (types[m.type] || 0) + 1;
    if (m.attachments.length > 0) withAttachments++;
    if (!m.answer) emptyAnswer++;
    for (const r of m.reference) {
      if (r.startsWith("প্রশ্ন নং") || r.startsWith("অনন্য প্রশ্ন") || /cite:/i.test(r)) {
        invalidRefs++;
      }
    }
  }

  console.log(`\nVerified ${mcqs.length} MCQs in Chapter "${chapter.nameBn}" (${chapter.id}):`);
  console.log(`Type Breakdown:`, types);
  console.log(`Questions with Attachments (Passages): ${withAttachments}`);
  console.log(`Invalid References: ${invalidRefs}`);
  console.log(`Missing Answers: ${emptyAnswer}`);

  // Sample check first 2 and last 2
  const samples = [mcqs[0], mcqs[1], mcqs[mcqs.length - 1]].filter(Boolean);
  console.log("\nSamples:");
  for (const s of samples) {
    console.log(`- [${s.type}] Q: ${s.question.slice(0, 50)}... | Ans: ${s.answer} | Refs: ${JSON.stringify(s.reference)} | Attachments: ${s.attachments.length}`);
  }
}

const targetChapter = process.argv[2] || "আমার দেশ";
verify(targetChapter).catch(console.error);

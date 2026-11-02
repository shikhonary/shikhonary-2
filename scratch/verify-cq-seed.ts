import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.js";

const WORKSPACE_ROOT = resolve(import.meta.dirname, "..");
config({ path: resolve(WORKSPACE_ROOT, ".env") });
config();

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: connectionString! });
const prisma = new PrismaClient({ adapter });

function getBengaliVariants(str: string): string[] {
  const trimmed = str.trim();
  const canon = trimmed
    .replace(/\u09AF\u09BC/g, "\u09DF") // য + ় -> য়
    .replace(/\u09A1\u09BC/g, "\u09DC") // ড + ় -> ড়
    .replace(/\u09A2\u09BC/g, "\u09DD"); // ঢ + ় -> ঢ়
  const decomp = trimmed
    .replace(/\u09DF/g, "\u09AF\u09BC")
    .replace(/\u09DC/g, "\u09A1\u09BC")
    .replace(/\u09DD/g, "\u09A2\u09BC");
  const vowelNorm = canon.replace(/ী/g, "ি").replace(/ূ/g, "ু");
  return [...new Set([trimmed, canon, decomp, vowelNorm])];
}

async function verify() {
  const chapterName = process.argv[2] || "ফুলের বিবাহ";
  const variants = getBengaliVariants(chapterName);
  const searchConditions = variants.flatMap((v) => [
    { nameBn: v },
    { nameEn: { equals: v, mode: "insensitive" as const } },
  ]);

  let ch = await prisma.academicChapter.findFirst({
    where: {
      OR: searchConditions,
      isActive: true,
    },
  });

  if (!ch) {
    const partialConditions = variants.flatMap((v) => [
      { nameBn: { contains: v, mode: "insensitive" as const } },
      { nameEn: { contains: v, mode: "insensitive" as const } },
    ]);
    ch = await prisma.academicChapter.findFirst({
      where: {
        OR: partialConditions,
        isActive: true,
      },
      orderBy: {
        position: "asc",
      },
    });
  }

  if (!ch) {
    console.log(`Chapter "${chapterName}" not found.`);
    return;
  }

  const cqs = await prisma.cq.findMany({
    where: { chapterId: ch.id },
    include: { attachments: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`\nVerified ${cqs.length} CQs in Chapter "${ch.nameBn}" (${ch.id}):\n`);
  for (const [idx, cq] of cqs.entries()) {
    console.log(`CQ #${idx + 1} (ID: ${cq.id}):`);
    console.log(`  CQ Context:  ${JSON.stringify(cq.context)}`);
    console.log(`  Reference:   ${JSON.stringify(cq.reference)}`);
    console.log(`  Question A:  ${cq.questionA}`);
    console.log(`  Question B:  ${cq.questionB}`);
    console.log(`  Question C:  ${cq.questionC}`);
    console.log(`  Question D:  ${cq.questionD}`);
    console.log(`  Attachments: ${cq.attachments.length} attachment(s)`);
    for (const att of cq.attachments) {
      console.log(`    - Type: ${att.type} | Caption: ${att.caption} | Content snippet: ${att.content ? att.content.slice(0, 30) : "null"}...`);
    }
    console.log();
  }
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

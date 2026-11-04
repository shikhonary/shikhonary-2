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

async function verify(chapterName: string) {
  const variants = getBengaliVariants(chapterName);
  const searchConditions = variants.flatMap((v) => [
    { nameBn: v },
    { nameEn: { equals: v, mode: "insensitive" as const } },
  ]);

  let chapter = await prisma.academicChapter.findFirst({
    where: { OR: searchConditions, isActive: true },
    include: { subject: true },
  });

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

  if (!chapter) {
    console.error(`Chapter "${chapterName}" not found!`);
    process.exit(1);
  }

  const csList = await prisma.cS.findMany({
    where: { chapterId: chapter.id },
    include: { attachments: true },
    orderBy: { createdAt: "asc" },
  });

  let withAttachments = 0;
  let invalidRefs = 0;

  for (const cs of csList) {
    if (cs.attachments.length > 0) withAttachments++;
    for (const r of cs.reference) {
      if (r.startsWith("প্রশ্ন নং") || r.startsWith("অনন্য প্রশ্ন") || /cite:/i.test(r)) {
        invalidRefs++;
      }
    }
  }

  console.log(`\nVerified ${csList.length} CS questions in Chapter "${chapter.nameBn}" (${chapter.id}):`);
  console.log(`With Attachments: ${withAttachments}`);
  console.log(`Invalid References: ${invalidRefs}`);

  for (let i = 0; i < Math.min(3, csList.length); i++) {
    const q = csList[i]!;
    console.log(`\nCS #${i + 1} (${q.id}):`);
    console.log(`  Reference:   ${JSON.stringify(q.reference)}`);
    console.log(`  Question A:  ${q.questionA}`);
    console.log(`  Question B:  ${q.questionB}`);
    console.log(`  Attachments: ${q.attachments.length}`);
  }
}

const targetChapter = process.argv[2] || "১৯৭১";
verify(targetChapter).catch(console.error);

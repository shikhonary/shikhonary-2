import { resolve } from "node:path";
import { config } from "dotenv";

const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.ts";

const adapter = new PrismaPg({ connectionString: process.env.MAIN_DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function verify() {
  const chapterName = process.argv[2] || "ফুলের বিবাহ";
  const ch = await prisma.academicChapter.findFirst({
    where: {
      OR: [
        { nameBn: { contains: chapterName } },
        { nameEn: { contains: chapterName, mode: "insensitive" } }
      ]
    }
  });

  if (!ch) {
    console.log(`Chapter "${chapterName}" not found.`);
    return;
  }

  const count = await prisma.mcq.count({
    where: { chapterId: ch.id }
  });
  console.log(`Total MCQs in Chapter "${ch.nameBn}" (${ch.id}): ${count}`);

  const types = await prisma.mcq.groupBy({
    by: ["type"],
    where: { chapterId: ch.id },
    _count: { id: true }
  });
  console.log("MCQ Types Breakdown:", types);

  const sampleCombined = await prisma.mcq.findMany({
    where: {
      chapterId: ch.id,
      attachments: { some: {} }
    },
    take: 3,
    include: { attachments: true }
  });
  console.log("Sample Attachment Questions:", JSON.stringify(sampleCombined.map(q => ({
    question: q.question,
    reference: q.reference,
    attachmentType: q.attachments[0]?.type,
    caption: q.attachments[0]?.caption,
    content: q.attachments[0]?.content?.slice(0, 50) + "..."
  })), null, 2));
}

verify().finally(() => prisma.$disconnect());

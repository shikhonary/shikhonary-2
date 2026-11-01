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

async function verify() {
  const chapterName = process.argv[2] || "ফুলের বিবাহ";
  const ch = await prisma.academicChapter.findFirst({
    where: {
      OR: [
        { nameBn: { contains: chapterName } },
        { nameEn: { contains: chapterName } }
      ]
    }
  });

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

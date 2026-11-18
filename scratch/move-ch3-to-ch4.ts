import { resolve } from "node:path";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { config } from "dotenv";

const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.ts";

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Database connection string missing!");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const FROM_CHAPTER_ID = "cmwlwu7z90002k4toi0psb643"; // হিন্দুধর্মের বৈশিষ্ট্য (Pos 2)
const TO_CHAPTER_ID = "cmwlwu82c0003k4touv4u00ui";   // হিন্দুধর্মীয় আচার- অনুষ্ঠান (Pos 3)

async function main() {
  console.log(`Starting migration of questions...`);
  console.log(`From Chapter ID: ${FROM_CHAPTER_ID}`);
  console.log(`To Chapter ID:   ${TO_CHAPTER_ID}`);

  const fromChapter = await prisma.academicChapter.findUnique({
    where: { id: FROM_CHAPTER_ID },
  });
  const toChapter = await prisma.academicChapter.findUnique({
    where: { id: TO_CHAPTER_ID },
  });

  if (!fromChapter || !toChapter) {
    throw new Error("One of the chapters was not found in the database!");
  }

  console.log(`From: "${fromChapter.nameBn}" [Pos ${fromChapter.position}]`);
  console.log(`To:   "${toChapter.nameBn}" [Pos ${toChapter.position}]`);

  // 1. Move MCQs
  const mcqUpdate = await prisma.mcq.updateMany({
    where: { chapterId: FROM_CHAPTER_ID },
    data: { chapterId: TO_CHAPTER_ID },
  });
  console.log(`Moved ${mcqUpdate.count} MCQs to "${toChapter.nameBn}".`);

  // 2. Move CQs
  const cqUpdate = await prisma.cq.updateMany({
    where: { chapterId: FROM_CHAPTER_ID },
    data: { chapterId: TO_CHAPTER_ID },
  });
  console.log(`Moved ${cqUpdate.count} CQs to "${toChapter.nameBn}".`);

  // 3. Move ShortAnswers
  const saUpdate = await prisma.shortAnswer.updateMany({
    where: { chapterId: FROM_CHAPTER_ID },
    data: { chapterId: TO_CHAPTER_ID },
  });
  console.log(`Moved ${saUpdate.count} ShortAnswers to "${toChapter.nameBn}".`);

  // 4. Update Audit Report if exists
  const reportPath = resolve(WORKSPACE_ROOT, "scratch/reports/CQ_RESOURCE_AUDIT_REPORT.md");
  if (existsSync(reportPath)) {
    let reportContent = readFileSync(reportPath, "utf-8");
    if (reportContent.includes("### CQ Audit for Chapter: হিন্দুধর্মের বৈশিষ্ট্য")) {
      reportContent = reportContent.replace(
        "### CQ Audit for Chapter: হিন্দুধর্মের বৈশিষ্ট্য",
        "### CQ Audit for Chapter: হিন্দুধর্মীয় আচার- অনুষ্ঠান"
      );
      writeFileSync(reportPath, reportContent, "utf-8");
      console.log(`Updated CQ Resource Audit Report header.`);
    }
  }

  // 5. Final verification
  const fromCounts = await prisma.academicChapter.findUnique({
    where: { id: FROM_CHAPTER_ID },
    include: { _count: { select: { mcqs: true, shortAnswers: true, cqs: true } } },
  });
  const toCounts = await prisma.academicChapter.findUnique({
    where: { id: TO_CHAPTER_ID },
    include: { _count: { select: { mcqs: true, shortAnswers: true, cqs: true } } },
  });

  console.log("\n--- Verification ---");
  console.log(`Chapter 3 ("${fromChapter.nameBn}") now has:`, fromCounts?._count);
  console.log(`Chapter 4 ("${toChapter.nameBn}") now has:`, toCounts?._count);
  console.log("Migration completed successfully!");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

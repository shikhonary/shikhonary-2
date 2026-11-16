import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

const WORKSPACE_ROOT = process.cwd().includes("packages")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.ts";

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: connectionString! });
const prisma = new PrismaClient({ adapter });

async function check() {
  const cqPath = resolve(WORKSPACE_ROOT, "scratch/raw-data/test-cq.json");
  const cqData = JSON.parse(readFileSync(cqPath, "utf-8"));
  const cqs = cqData.questions || cqData.cqs || [];

  console.log("--- test-cq.json ---");
  console.log("Chapter Title:", cqData.chapterTitle);
  console.log("Total CQs in file:", cqs.length);

  const saPath = resolve(WORKSPACE_ROOT, "scratch/raw-data/test-sa.json");
  const saData = JSON.parse(readFileSync(saPath, "utf-8"));
  const sas = saData.questions || saData.shortAnswers || [];

  console.log("\n--- test-sa.json ---");
  console.log("Chapter Title:", saData.chapterTitle);
  console.log("Total SAs in file:", sas.length);

  // Check DB for both
  const ch4 = await prisma.academicChapter.findFirst({
    where: {
      subjectId: "cmwhp8esd000k90ej2lltgpcq",
      nameBn: { contains: "নদ-নদী" },
    },
    include: {
      _count: { select: { mcqs: true, shortAnswers: true, cqs: true } },
    },
  });

  const ch5 = await prisma.academicChapter.findFirst({
    where: {
      subjectId: "cmwhp8esd000k90ej2lltgpcq",
      nameBn: { contains: "রাষ্ট্র, নাগরিকতা" },
    },
    include: {
      _count: { select: { mcqs: true, shortAnswers: true, cqs: true } },
    },
  });

  console.log(`\nDB [Pos 4] ${ch4?.nameBn}: MCQs=${ch4?._count.mcqs}, SAs=${ch4?._count.shortAnswers}, CQs=${ch4?._count.cqs}`);
  console.log(`DB [Pos 5] ${ch5?.nameBn}: MCQs=${ch5?._count.mcqs}, SAs=${ch5?._count.shortAnswers}, CQs=${ch5?._count.cqs}`);

  await prisma.$disconnect();
}

check().catch(console.error);

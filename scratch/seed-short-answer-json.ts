import { resolve, join } from "node:path";
import { readFileSync, existsSync, appendFileSync, mkdirSync } from "node:fs";
import { config } from "dotenv";

const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.ts";
import { DEFAULT_SOURCE } from "../packages/utils/src/constants/index.ts";

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Database connection string missing!");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export function normalizeReferences(rawList: string[]): string[] {
  const result: string[] = [];
  for (const raw of rawList) {
    if (!raw || typeof raw !== "string") continue;
    let text = raw
      .replace(/\[cite:\s*[^\]]+\]/gi, "")
      .replace(/\[?\bcite:\s*\d+\b\]?/gi, "")
      .replace(/\s*\|\s*প্রশ্ন\s*(?:নং|নম্বর)?\s*[-:–.]?\s*[০-৯0-9]+/gi, "")
      .replace(/,\s*প্রশ্ন\s*(?:নং|নম্বর)?\s*[-:–.]?\s*[০-৯0-9]+/gi, "")
      .trim();

    const parts = text.split(/[;；|]+|,\s*(?=নি[.\s]*প)/).map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (!part || /^(?:প্রশ্ন\s*(?:নং|নম্বর)?|অনন্য প্রশ্ন)/i.test(part)) continue;
      result.push(part);
    }
  }
  return [...new Set(result)];
}

async function seedShortAnswers(filePath: string) {
  const fullPath = resolve(WORKSPACE_ROOT, filePath);
  if (!existsSync(fullPath)) {
    throw new Error(`File does not exist: ${fullPath}`);
  }

  const rawText = readFileSync(fullPath, "utf8");
  const data = JSON.parse(rawText);

  const rawQuestions = data.questions || data.shortAnswers || [];
  if (rawQuestions.length === 0) {
    console.log(`[Skip] No questions found in ${fullPath}`);
    return;
  }

  // 1. Resolve Target Subject and Chapter for Class 9/10 Science
  let targetChapter: any = null;
  const chapterTitle = (data.chapterTitle || "").trim();

  // If chapterTitle is "খাদ্য ও পুষ্টি", "উন্নত জীবনধারা", or "উন্নততর জীবনধারা", it belongs to Chapter 1: "উন্নততর জীবনধারা"
  if (
    chapterTitle.includes("খাদ্য") ||
    chapterTitle.includes("পুষ্টি") ||
    chapterTitle.includes("উন্নত") ||
    chapterTitle.includes("জীবনধারা")
  ) {
    targetChapter = await prisma.academicChapter.findFirst({
      where: {
        id: "cmwd7woyw00002oejaeoce9n6", // Pos 0: উন্নততর জীবনধারা (Science 9/10)
      },
      include: {
        subject: true,
      },
    });
  }

  if (!targetChapter) {
    const strippedTitle = chapterTitle
      .replace(/^(?:[০-৯\d]+|প্রথম|দ্বিতীয়|দ্বিতীয়|তৃতীয়|তৃতীয়|চতুর্থ|পঞ্চম|ষষ্ঠ|সপ্তম|অষ্টম|নবম|দশম|একাদশ|দ্বাদশ)\s*(?:অধ্যায়|অধ্যায়|অধ্যায়ঃ|অধ্যায়ঃ)\s*[:：\-–.]\s*/i, "")
      .trim();

    targetChapter = await prisma.academicChapter.findFirst({
      where: {
        OR: [
          { nameBn: { in: [chapterTitle, strippedTitle] } },
          { nameBn: { contains: strippedTitle } },
        ],
        subject: {
          OR: [{ nameEn: "Science" }, { nameBn: "বিজ্ঞান" }],
          academicYear: { isCurrent: true },
          classSubjects: {
            some: {
              academicClass: {
                OR: [{ nameEn: "Nine" }, { nameBn: "নবম" }, { nameEn: "Ten" }, { nameBn: "দশম" }],
              },
            },
          },
        },
      },
      include: {
        subject: true,
      },
    });
  }

  if (!targetChapter) {
    throw new Error(`Could not resolve chapter for title "${chapterTitle}" in Class 9/10 Science!`);
  }

  console.log(`\n======================================================`);
  console.log(`FILE:              ${fullPath}`);
  console.log(`TARGET MODEL:      ShortAnswer (short_answer)`);
  console.log(`TARGET SUBJECT:    ${targetChapter.subject.nameBn} (${targetChapter.subjectId})`);
  console.log(`TARGET CHAPTER:    ${targetChapter.nameBn} [Pos ${targetChapter.position}] (${targetChapter.id})`);
  console.log(`QUESTIONS IN FILE: ${rawQuestions.length}`);
  console.log(`======================================================\n`);

  // 2. Resolve QuestionType
  const questionType = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: "Short Question" },
        { nameBn: "সংক্ষিপ্ত প্রশ্ন" },
        { nameEn: "Short Answer" },
        { nameEn: "Passage Based" },
      ],
      isActive: true,
    },
    select: { id: true, nameEn: true, nameBn: true },
  });
  console.log(`Resolved QuestionType: ${questionType?.nameBn} / ${questionType?.nameEn} (${questionType?.id})`);

  const currentYear = new Date().getFullYear().toString();
  const sourceName = data.source || DEFAULT_SOURCE || "সহায়ক সংকলন";
  const sessionYear = data.session || currentYear;

  let insertedCount = 0;
  let updatedCount = 0;
  const auditItems: any[] = [];

  for (let idx = 0; idx < rawQuestions.length; idx++) {
    const q = rawQuestions[idx];

    // Strip question numbering prefixes like "১। ", "১. ", etc.
    let cleanQuestion = (q.question || "")
      .replace(/^[০-৯\d]+[.)।|\-\s]+/g, "")
      .trim();

    const normalizedRefs = normalizeReferences(q.reference || []);
    const isMathDetected = Boolean(q.isMath || /[\$\\\{\}\^]|(?:\\frac|\\sqrt|\\times)/.test(cleanQuestion));
    const difficulty = q.difficulty || "MEDIUM";

    // Deduplication check
    const existing = await prisma.shortAnswer.findFirst({
      where: {
        chapterId: targetChapter.id,
        question: cleanQuestion,
      },
    });

    let currentSaId: string;

    if (existing) {
      const mergedRefs = normalizeReferences([...(existing.reference || []), ...normalizedRefs]);
      const updated = await prisma.shortAnswer.update({
        where: { id: existing.id },
        data: {
          reference: mergedRefs,
          difficulty,
          isMath: isMathDetected,
          source: q.source || sourceName,
          session: q.session || sessionYear,
          questionTypeId: questionType?.id || undefined,
          isActive: true,
        },
      });
      currentSaId = updated.id;
      updatedCount++;
    } else {
      const created = await prisma.shortAnswer.create({
        data: {
          question: cleanQuestion,
          answer: q.answer || null,
          options: q.options || [],
          isMath: isMathDetected,
          difficulty,
          reference: normalizedRefs,
          source: q.source || sourceName,
          session: q.session || sessionYear,
          subjectId: targetChapter.subjectId,
          chapterId: targetChapter.id,
          questionTypeId: questionType?.id || undefined,
          isGlobal: true,
          isActive: true,
        },
      });
      currentSaId = created.id;
      insertedCount++;
    }

    // Attachment & missing image report handling
    if (q.hasAttachment) {
      const existingAttachment = await prisma.questionAttachment.findFirst({
        where: { shortAnswerId: currentSaId },
      });

      const attachmentType = q.attachmentType || "DIAGRAM";
      const caption = q.attachmentDescription?.trim() || "চিত্র সংযুক্ত করুন";

      if (!existingAttachment) {
        await prisma.questionAttachment.create({
          data: {
            shortAnswerId: currentSaId,
            type: attachmentType,
            caption,
          },
        });
      }

      auditItems.push({
        id: currentSaId,
        question: cleanQuestion,
        type: attachmentType,
        description: q.attachmentDescription || "চিত্র / ডায়াগ্রাম সংযোজন প্রয়োজন",
        reference: normalizedRefs.join(", ") || "N/A",
      });

      const existingReport = await prisma.questionReport.findFirst({
        where: {
          entityType: "SHORT_ANSWER",
          entityId: currentSaId,
          reportType: "MISSING_IMAGE",
        },
      });

      if (!existingReport) {
        await prisma.questionReport.create({
          data: {
            entityType: "SHORT_ANSWER",
            entityId: currentSaId,
            reportType: "MISSING_IMAGE",
            description: q.attachmentDescription || "চিত্র / ডায়াগ্রাম সংযোজন প্রয়োজন",
            status: "PENDING",
          },
        });
      }
    }
  }

  const totalInChapter = await prisma.shortAnswer.count({
    where: { chapterId: targetChapter.id },
  });

  console.log(`\n✅ ShortAnswer Seed Finished: ${insertedCount} newly inserted, ${updatedCount} updated.`);
  console.log(`📊 Total ShortAnswers now in chapter "${targetChapter.nameBn}": ${totalInChapter}\n`);

  if (auditItems.length > 0) {
    const reportDir = resolve(WORKSPACE_ROOT, "scratch/reports");
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }
    const reportPath = resolve(reportDir, "RESOURCE_AUDIT_REPORT.md");

    let reportMarkdown = `\n### Audit for ShortAnswers in Chapter: ${targetChapter.nameBn} (${new Date().toLocaleDateString()})\n\n`;
    reportMarkdown += `| ShortAnswer ID | Question Clue | Missing Asset Type | Description | Reference |\n`;
    reportMarkdown += `| :--- | :--- | :--- | :--- | :--- |\n`;
    auditItems.forEach((item) => {
      reportMarkdown += `| \`${item.id}\` | ${item.question.slice(0, 45)}... | **${item.type}** | ${item.description} | ${item.reference} |\n`;
    });

    appendFileSync(reportPath, reportMarkdown, "utf-8");
    console.log(`📋 Resource Audit Report updated at: ${reportPath}`);
  }
}

async function main() {
  const filePath = process.argv[2] || "scratch/raw-data/test-sq.json";
  await seedShortAnswers(filePath);
}

main()
  .catch((err) => {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

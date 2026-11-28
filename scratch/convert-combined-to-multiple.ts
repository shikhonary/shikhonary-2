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

const CHAPTER_ID = "cmwxhyjh50007w0tobadq3sz3"; // মুদ্রা, ব্যাংক ও ব্যাংকিং

function splitEmbeddedStatements(questionText: string): {
  cleanedQuestion: string;
  extractedStatements: string[];
} {
  const lines = questionText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const stmtLines: string[] = [];
  const qLines: string[] = [];

  for (const line of lines) {
    const match = line.match(/^(?:i{1,3}|[১-৩1-3])[.)]\s*(.+)$/i);
    if (match) {
      stmtLines.push(match[1].trim());
    } else {
      qLines.push(line);
    }
  }

  return {
    cleanedQuestion: qLines.join("\n").trim(),
    extractedStatements: stmtLines,
  };
}

async function main() {
  const apply = process.argv.includes("--apply");

  const chapter = await prisma.academicChapter.findUnique({
    where: { id: CHAPTER_ID },
    include: { subject: true },
  });

  if (!chapter) {
    throw new Error(`Chapter not found: ${CHAPTER_ID}`);
  }

  console.log(`Subject: ${chapter.subject.nameBn} (${chapter.subjectId})`);
  console.log(`Chapter: ${chapter.nameBn} (${chapter.id})`);
  console.log(`Mode: ${apply ? "APPLY" : "DRY-RUN"}\n`);

  const combinedMcqs = await prisma.mcq.findMany({
    where: {
      chapterId: CHAPTER_ID,
      type: "COMBINED",
    },
    include: {
      attachments: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${combinedMcqs.length} COMBINED MCQs to convert to MULTIPLE.\n`);

  let updatedCount = 0;
  let deletedPassageCount = 0;
  let extractedStatementsCount = 0;

  for (const m of combinedMcqs) {
    let nextQuestion = (m.question || "").trim();
    let nextStatements = [...m.statements];
    const passageIdsToDelete: string[] = [];

    // 1. If question is empty and there's a PASSAGE attachment, move its content to question and delete PASSAGE
    const passageAtts = m.attachments.filter((a) => a.type === "PASSAGE" && a.content?.trim());
    if (!nextQuestion && passageAtts.length > 0) {
      nextQuestion = passageAtts.map((a) => a.content!.trim()).join("\n");
      for (const a of passageAtts) {
        passageIdsToDelete.push(a.id);
      }
    }

    // 2. If statements array is empty, check if question has embedded i./ii./iii. lines
    if (nextStatements.length === 0 && nextQuestion) {
      const { cleanedQuestion, extractedStatements } = splitEmbeddedStatements(nextQuestion);
      if (extractedStatements.length > 0) {
        nextQuestion = cleanedQuestion;
        nextStatements = extractedStatements;
        extractedStatementsCount++;
      }
    }

    console.log(
      `[${m.id}] type: COMBINED -> MULTIPLE | Q: "${nextQuestion.slice(0, 60)}" | stmts: ${nextStatements.length} | deletePassages: ${passageIdsToDelete.length}`
    );

    if (apply) {
      await prisma.$transaction(async (tx) => {
        if (passageIdsToDelete.length > 0) {
          await tx.questionAttachment.deleteMany({
            where: { id: { in: passageIdsToDelete } },
          });
        }
        await tx.mcq.update({
          where: { id: m.id },
          data: {
            type: "MULTIPLE",
            question: nextQuestion,
            statements: nextStatements,
          },
        });
      });
    }

    updatedCount++;
    deletedPassageCount += passageIdsToDelete.length;
  }

  console.log("\n======================================================");
  console.log(`${apply ? "✅ Applied" : "🔍 Dry-run"} summary:`);
  console.log(`- MCQs converted COMBINED -> MULTIPLE: ${updatedCount}`);
  console.log(`- Redundant PASSAGE attachments deleted: ${deletedPassageCount}`);
  console.log(`- MCQs with embedded statements extracted: ${extractedStatementsCount}`);
  console.log("======================================================");

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

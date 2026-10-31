import { resolve, join } from "node:path";
import { readFileSync, existsSync, appendFileSync, mkdirSync, statSync, readdirSync } from "node:fs";
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

interface RawMcqItem {
  type?: "SINGLE" | "MULTIPLE" | "COMBINED";
  question: string;
  options: string[];
  answer: string;
  explanation?: string | null;
  reference?: string[];
  statements?: string[];
  context?: string | null;
  isMath?: boolean;
  hasAttachment?: boolean;
  attachmentType?: string;
  attachmentDescription?: string;
  source?: string | null;
}

interface RawPayload {
  chapterTitle?: string;
  subjectName?: string;
  className?: string;
  source?: string;
  session?: string;
  questions?: RawMcqItem[];
  mcqs?: RawMcqItem[];
}

const BENGALI_OPTION_MAP: Record<string, number> = {
  "ক": 0, "খ": 1, "গ": 2, "ঘ": 3,
  "A": 0, "B": 1, "C": 2, "D": 3,
  "a": 0, "b": 1, "c": 2, "d": 3,
  "১": 0, "২": 1, "৩": 2, "৪": 3,
  "1": 0, "2": 1, "3": 2, "4": 3,
};

export function normalizeReferences(rawList: string[]): string[] {
  const result: string[] = [];

  for (const raw of rawList) {
    if (!raw || typeof raw !== "string") continue;

    // 1. Split by semicolon ';'
    const semiParts = raw.split(";").map(s => s.trim()).filter(Boolean);

    for (const part of semiParts) {
      // 2. Multi-year expansion (e.g. "নি. প. ২০২৫, ২০২৪" -> ["নি. প. ২০২৫", "নি. প. ২০২৪"])
      const multiYearMatch = part.match(/^([\u0980-\u09FF\w\.\s]+?)\s+([০-৯\d]{2,4}(?:\s*,\s*[০-৯\d]{2,4})+)$/);

      if (multiYearMatch) {
        const prefix = multiYearMatch[1]!.trim();
        const yearsStr = multiYearMatch[2]!;
        const years = yearsStr.split(",").map(y => y.trim()).filter(Boolean);

        for (const yr of years) {
          result.push(`${prefix} ${yr}`);
        }
      } else {
        result.push(part);
      }
    }
  }

  return [...new Set(result)];
}

export function extractContextAndRefs(rawContext: string | null | undefined): {
  cleanedContext: string | null;
  extractedRefs: string[];
} {
  if (!rawContext || typeof rawContext !== "string") {
    return { cleanedContext: null, extractedRefs: [] };
  }

  // 1. Strip question header at beginning (e.g. 'নিচের উদ্দীপকটি পড়ে ৯১ ও ৯২ নম্বর প্রশ্নের উত্তর দাও:')
  let text = rawContext
    .replace(/^(?:নিচের\s+)?(?:উদ্দীপকটি|অনুচ্ছেদটি|তথ্যটি|অংশটুকু|কবিতাংশটি|নাট্যাংশটি|দৃশ্যপটটি)\s+(?:পড়ে|পড়ে|লক্ষ\s*কর[েো]|দেখে)[\s\S]*?প্রশ্নের\s*উত্তর\s*দাও[ঃ:।-]*\s*/i, "")
    .trim();

  const extractedRefs: string[] = [];

  // 2. Extract trailing bracketed reference (e.g. '[য. বো. ১৬]' or '[কু. বো. ১৭; চ. বো. ১৯]')
  const endBracketMatch = text.match(/\[([^\]]+)\]\s*$/);
  if (endBracketMatch) {
    const rawRefInside = endBracketMatch[1]!.trim();
    if (rawRefInside) {
      extractedRefs.push(rawRefInside);
    }
    // Remove the bracketed reference from context text so the passage is pure
    text = text.replace(/\[([^\]]+)\]\s*$/, "").trim();
  }

  return {
    cleanedContext: text || null,
    extractedRefs,
  };
}

export function extractQuestionAndRefs(rawQuestion: string): {
  cleanQuestion: string;
  extractedRefs: string[];
} {
  let text = rawQuestion.replace(/^[০-৯\d]+[.)।|\-\s]+/g, "").trim();
  const extractedRefs: string[] = [];

  // If question ends with bracketed reference, e.g. "বাংলা গদ্যের জনক কে? [ঢা. বো. ২০]"
  const endBracketMatch = text.match(/\[([^\]]+)\]\s*$/);
  if (endBracketMatch) {
    const rawRefInside = endBracketMatch[1]!.trim();
    if (rawRefInside) {
      extractedRefs.push(rawRefInside);
    }
    text = text.replace(/\[([^\]]+)\]\s*$/, "").trim();
  }

  return {
    cleanQuestion: text,
    extractedRefs,
  };
}

async function seedSingleFile(filePath: string, forceClean: boolean = false) {
  const fileContent = readFileSync(filePath, "utf-8");
  const data: RawPayload = JSON.parse(fileContent);

  const rawQuestions = data.questions || data.mcqs || [];
  if (rawQuestions.length === 0) {
    console.log(`[Skip] No questions found in ${filePath}`);
    return;
  }

  const chapterTitle = (data.chapterTitle || "").trim();
  if (!chapterTitle) {
    console.warn(`[Skip] Missing "chapterTitle" in ${filePath}`);
    return;
  }

  // Find matching chapter in the database
  const matchedChapter = await prisma.academicChapter.findFirst({
    where: {
      OR: [
        { nameBn: { contains: chapterTitle } },
        { nameEn: { contains: chapterTitle, mode: "insensitive" } }
      ]
    },
    include: {
      subject: true
    }
  });

  if (!matchedChapter) {
    console.error(`[Error] Chapter "${chapterTitle}" not found in database! (File: ${filePath})`);
    return;
  }

  console.log(`\n======================================================`);
  console.log(`FILE:              ${filePath}`);
  console.log(`TARGET SUBJECT:    ${matchedChapter.subject.nameBn} (${matchedChapter.subjectId})`);
  console.log(`TARGET CHAPTER:    ${matchedChapter.nameBn} [Pos ${matchedChapter.position}] (${matchedChapter.id})`);
  console.log(`QUESTIONS IN FILE: ${rawQuestions.length}`);
  console.log(`======================================================`);

  // ONLY clean if explicitly requested via --force-clean
  if (forceClean) {
    const deleteResult = await prisma.mcq.deleteMany({
      where: { chapterId: matchedChapter.id }
    });
    console.log(`[Force Clean] Deleted ${deleteResult.count} previous question(s) for this chapter.\n`);
  }

  // Find default MCQ QuestionType
  const mcqType = await prisma.questionType.findFirst({
    where: { OR: [{ nameEn: "MCQ" }, { nameBn: "বহুনির্বাচনি" }] }
  });

  const sessionYear = data.session || new Date().getFullYear().toString();
  const sourceName = data.source || DEFAULT_SOURCE;
  let insertedCount = 0;
  let updatedCount = 0;
  const auditItems: any[] = [];

  for (let idx = 0; idx < rawQuestions.length; idx++) {
    const q = rawQuestions[idx]!;

    const { cleanQuestion, extractedRefs: qExtractedRefs } = extractQuestionAndRefs(q.question);
    const { cleanedContext, extractedRefs: ctxExtractedRefs } = extractContextAndRefs(q.context);

    const cleanOptions = (q.options || []).map((opt) => 
      opt.replace(/^[ক-ঘa-d\d]+[.)।|\-\s]+/g, "").trim()
    );

    let rawAnswerTrimmed = (q.answer || "").trim();
    const baseKey = rawAnswerTrimmed.replace(/[.)।\-\s]+$/, "");
    const strippedAnswer = rawAnswerTrimmed.replace(/^[ক-ঘa-d\d]+[.)।|\-\s]+/g, "").trim();

    let cleanAnswer = rawAnswerTrimmed;
    if (baseKey in BENGALI_OPTION_MAP) {
      const optionIndex = BENGALI_OPTION_MAP[baseKey]!;
      if (cleanOptions[optionIndex]) {
        cleanAnswer = cleanOptions[optionIndex]!;
      }
    } else {
      const matchIdx = cleanOptions.findIndex(
        (opt) => opt === strippedAnswer || opt === rawAnswerTrimmed
      );
      if (matchIdx !== -1) {
        cleanAnswer = cleanOptions[matchIdx]!;
      } else {
        cleanAnswer = strippedAnswer;
      }
    }

    const cleanStatements = (q.statements || []).map((stmt) => 
      stmt.replace(/^(?:[iI]{1,3}|iv|IV|[১-৪\d]+|[a-dA-D])[.)।|\-\s]+/g, "").trim()
    );

    // Combine any references in `q.reference` with ones extracted from bracketed context and question
    const combinedRefs = [
      ...(q.reference || []),
      ...qExtractedRefs,
      ...ctxExtractedRefs,
    ];
    const normalizedRefs = normalizeReferences(combinedRefs);
    const questionType = q.type || (cleanStatements.length > 0 ? "MULTIPLE" : cleanedContext ? "COMBINED" : "SINGLE");
    const isMathDetected = Boolean(q.isMath || /[\$\\\{\}\^]|(?:\\frac|\\sqrt|\\times)/.test(cleanQuestion));
    const finalSource = q.source || sourceName;
    const finalSession = q.session || sessionYear;

    // Check if this exact question already exists in this chapter (Deduplication)
    const existing = await prisma.mcq.findFirst({
      where: {
        chapterId: matchedChapter.id,
        question: cleanQuestion
      }
    });

    let currentMcqId: string;

    if (existing) {
      // Update existing record (refreshes fields without wiping previous questions)
      const updated = await prisma.mcq.update({
        where: { id: existing.id },
        data: {
          answer: cleanAnswer,
          options: cleanOptions,
          statements: cleanStatements,
          type: questionType,
          isMath: isMathDetected,
          reference: normalizedRefs,
          explanation: q.explanation || null,
          source: finalSource,
          session: finalSession,
          isActive: true,
        }
      });
      currentMcqId = updated.id;
      updatedCount++;
    } else {
      // Insert new question (Safe append: preserves all existing chapter MCQs)
      const created = await prisma.mcq.create({
        data: {
          question: cleanQuestion,
          answer: cleanAnswer,
          options: cleanOptions,
          statements: cleanStatements,
          type: questionType,
          isMath: isMathDetected,
          reference: normalizedRefs,
          explanation: q.explanation || null,
          source: finalSource,
          session: finalSession,
          subjectId: matchedChapter.subjectId,
          chapterId: matchedChapter.id,
          questionTypeId: mcqType?.id || null,
          isActive: true,
        }
      });
      currentMcqId = created.id;
      insertedCount++;
    }

    if (q.hasAttachment || cleanedContext) {
      const existingAttachment = await prisma.questionAttachment.findFirst({
        where: { mcqId: currentMcqId }
      });

      const attachmentType = q.attachmentType || (cleanedContext ? "PASSAGE" : "DIAGRAM");
      const caption = q.attachmentDescription || (cleanedContext ? "উদ্দীপক" : "চিত্র সংযুক্ত করুন");
      const content = cleanedContext || null;

      if (!existingAttachment) {
        await prisma.questionAttachment.create({
          data: {
            mcqId: currentMcqId,
            type: attachmentType,
            caption: caption,
            content: content
          }
        });
      } else {
        await prisma.questionAttachment.update({
          where: { id: existingAttachment.id },
          data: {
            type: attachmentType,
            caption: caption,
            content: content
          }
        });
      }

      if (q.hasAttachment && !cleanedContext) {
        auditItems.push({
          id: currentMcqId,
          question: cleanQuestion,
          type: attachmentType,
          description: q.attachmentDescription || "Visual media required",
          reference: normalizedRefs.join(", ") || "N/A"
        });
      }
    }
  }

  const totalInChapter = await prisma.mcq.count({
    where: { chapterId: matchedChapter.id }
  });

  console.log(`✅ Seed Finished: ${insertedCount} newly inserted, ${updatedCount} updated.`);
  console.log(`📊 Total MCQs now in chapter "${matchedChapter.nameBn}": ${totalInChapter}\n`);

  if (auditItems.length > 0) {
    const reportDir = resolve(WORKSPACE_ROOT, "scratch/reports");
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }
    const reportPath = resolve(reportDir, "RESOURCE_AUDIT_REPORT.md");

    let reportMarkdown = `\n### Audit for Chapter: ${matchedChapter.nameBn} (${new Date().toLocaleDateString()})\n\n`;
    reportMarkdown += `| MCQ ID | Question Clue | Missing Asset Type | Description | Reference |\n`;
    reportMarkdown += `| :--- | :--- | :--- | :--- | :--- |\n`;
    auditItems.forEach((item) => {
      reportMarkdown += `| \`${item.id}\` | ${item.question.slice(0, 45)}... | **${item.type}** | ${item.description} | ${item.reference} |\n`;
    });

    appendFileSync(reportPath, reportMarkdown, "utf-8");
    console.log(`📋 Resource Audit Report updated at: ${reportPath}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const forceClean = args.includes("--force-clean");
  const pathArg = args.find((a) => !a.startsWith("--")) || "scratch/raw-data";
  const targetPath = resolve(WORKSPACE_ROOT, pathArg);

  if (!existsSync(targetPath)) {
    throw new Error(`Target path does not exist: ${targetPath}`);
  }

  const stat = statSync(targetPath);
  if (stat.isFile()) {
    await seedSingleFile(targetPath, forceClean);
  } else if (stat.isDirectory()) {
    const files = readdirSync(targetPath)
      .filter((f) => f.endsWith(".json"))
      .map((f) => join(targetPath, f));

    if (files.length === 0) {
      console.log(`No .json files found in directory: ${targetPath}`);
      return;
    }

    console.log(`Found ${files.length} JSON file(s) in ${targetPath}. Processing batch...`);
    for (const f of files) {
      await seedSingleFile(f, forceClean);
    }
  }
}

main()
  .catch((err) => {
    console.error("\n❌ Seeding Error:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

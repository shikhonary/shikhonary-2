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

function isQuestionNoReference(ref: string): boolean {
  const trimmed = ref.trim();
  if (trimmed.startsWith("অনন্য প্রশ্ন")) return true;
  if (trimmed.startsWith("প্রশ্ন নং") || trimmed.startsWith("প্রশ্ন নম্বর") || trimmed.startsWith("প্রশ্ন")) return true;
  if (/^\[?cite:\s*[^\]]+\]?/i.test(trimmed)) return true;
  if (/^cite:\s*[^\]]+/i.test(trimmed)) return true;
  return /^(?:প্রশ্ন\s*(?:নং|নম্বর)?\s*[-:–.]?\s*[০-৯0-9]+|q(?:uestion)?\s*(?:no\.?)?\s*[-:–.]?\s*\d+)$/i.test(trimmed);
}

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

    // 1. Split by semicolon ';' or comma before 'নি.প.'
    const semiParts = text.split(/[;；|]+|,\s*(?=নি[.\s]*প)/).map(s => s.trim()).filter(Boolean);

    for (const part of semiParts) {
      if (!part || isQuestionNoReference(part)) {
        continue;
      }

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

  let text = rawContext.trim();
  text = text.replace(/\[cite:\s*[^\]]+\]/gi, "").trim();

  // 1. Strip question header at beginning (e.g. 'নিচের উদ্দীপকটি পড়ে ৯১ ও ৯২ নম্বর প্রশ্নের উত্তর দাও:')
  text = text
    .replace(/^(?:নিচের\s+)?(?:উদ্দীপকটি|অনুচ্ছেদটি|তথ্যটি|অংশটুকু|কবিতাংশটি|নাট্যাংশটি|দৃশ্যপটটি)\s+(?:পড়ে|পড়ে|লক্ষ\s*কর[েো]|দেখে)[\s\S]*?প্রশ্নের\s*উত্তর\s*দাও[ঃ:।-]*\s*/i, "")
    .trim();

  const extractedRefs: string[] = [];

  // 2. Extract bracketed references from context text (e.g. '[য. বো. ১৬]' or '[কু. বো. ১৭; চ. বো. ১৯]')
  const bracketMatches = text.match(/\[([^\]]+)\]/g);
  if (bracketMatches) {
    for (const bm of bracketMatches) {
      const rawRefInside = bm.replace(/^\[/, "").replace(/\]$/, "").trim();
      if (rawRefInside && !isQuestionNoReference(rawRefInside)) {
        extractedRefs.push(rawRefInside);
      }
    }
    // Remove the brackets from text, preserving trailing punctuation
    text = text.replace(/\s*\[([^\]]+)\]\s*([?।|.]?)/g, "$2").trim();
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
  text = text.replace(/\[cite:\s*[^\]]+\]/gi, "").trim();

  const extractedRefs: string[] = [];

  // Extract bracketed references (e.g. "‘অভাগীর স্বর্গ’ গল্পের গতিশীল চরিত্র কোনটি? [য. বো. ২৪]")
  const bracketMatches = text.match(/\[([^\]]+)\]/g);
  if (bracketMatches) {
    for (const bm of bracketMatches) {
      const rawRefInside = bm.replace(/^\[/, "").replace(/\]$/, "").trim();
      if (rawRefInside && !isQuestionNoReference(rawRefInside)) {
        extractedRefs.push(rawRefInside);
      }
    }
    // Remove bracket from question text, keeping any trailing question mark or punctuation
    text = text.replace(/\s*\[([^\]]+)\]\s*([?।|.]?)/g, "$2").trim();
  }

  return {
    cleanQuestion: text,
    extractedRefs,
  };
}

export function extractExplanationAndRefs(rawExplanation: string | null | undefined): {
  cleanExplanation: string | null;
  extractedRefs: string[];
} {
  if (!rawExplanation || typeof rawExplanation !== "string") {
    return { cleanExplanation: null, extractedRefs: [] };
  }

  let text = rawExplanation.trim();
  text = text.replace(/\[cite:\s*[^\]]+\]/gi, "").trim();

  const extractedRefs: string[] = [];

  const bracketMatches = text.match(/\[([^\]]+)\]/g);
  if (bracketMatches) {
    for (const bm of bracketMatches) {
      const rawRefInside = bm.replace(/^\[/, "").replace(/\]$/, "").trim();
      if (rawRefInside && !isQuestionNoReference(rawRefInside)) {
        extractedRefs.push(rawRefInside);
      }
    }
    text = text.replace(/\s*\[([^\]]+)\]\s*([?।|.]?)/g, "$2").trim();
  }

  return {
    cleanExplanation: text || null,
    extractedRefs,
  };
}

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

async function seedSingleFile(filePath: string, forceClean: boolean = false) {
  const fileContent = readFileSync(filePath, "utf-8");
  let data: RawPayload;
  try {
    data = JSON.parse(fileContent);
  } catch (err: any) {
    console.warn(`[Skip] Invalid JSON in ${filePath} (skipping): ${err.message}`);
    return;
  }

  const rawQuestions = data.questions || data.mcqs || [];
  if (rawQuestions.length === 0) {
    console.log(`[Skip] No questions found in ${filePath}`);
    return;
  }

  // Verify this is an MCQ file (questions must have options and a question stem)
  const isMcq = rawQuestions.some((q) => Array.isArray(q.options) && typeof q.question === "string");
  if (!isMcq) {
    console.log(`[Skip] ${filePath} does not appear to be an MCQ file (skipping).`);
    return;
  }

  const chapterTitle = (data.chapterTitle || "").trim();
  if (!chapterTitle) {
    console.warn(`[Skip] Missing "chapterTitle" in ${filePath}`);
    return;
  }

  // Strip prefixes like "প্রথম অধ্যায়:", "১ম অধ্যায় -", "Chapter 1:"
  const strippedTitle = chapterTitle
    .replace(/^(?:[০-৯\d]+|প্রথম|দ্বিতীয়|দ্বিতীয়|তৃতীয়|তৃতীয়|চতুর্থ|পঞ্চম|ষষ্ঠ|সপ্তম|অষ্টম|নবম|দশম|একাদশ|দ্বাদশ)\s*(?:অধ্যায়|অধ্যায়|অধ্যায়ঃ|অধ্যায়ঃ|chapter)\s*[:：\-–.]\s*/i, "")
    .trim();

  // Find matching chapter in the database (Exact match first, then fallback to partial/contains)
  const titleCandidates = [chapterTitle, strippedTitle].filter(Boolean);
  const variants = [...new Set(titleCandidates.flatMap(getBengaliVariants))];
  const searchConditions = variants.flatMap((v) => [
    { nameBn: v },
    { nameEn: { equals: v, mode: "insensitive" as const } },
  ]);

  const subjectIdArg = (data as any).subjectId;
  const classNameArg = (data as any).className;
  const subjectNameArg = (data as any).subjectName;

  const subjectCondition: any = {};
  if (subjectIdArg) {
    subjectCondition.subjectId = subjectIdArg;
  } else {
    const subjectFilter: any = {};
    if (subjectNameArg) {
      subjectFilter.nameBn = { contains: subjectNameArg };
    }
    if (classNameArg) {
      subjectFilter.classSubjects = {
        some: {
          academicClass: {
            OR: [
              { nameEn: { equals: classNameArg, mode: "insensitive" } },
              { nameBn: { equals: classNameArg, mode: "insensitive" } },
            ],
          },
        },
      };
    }
    if (Object.keys(subjectFilter).length > 0) {
      subjectCondition.subject = subjectFilter;
    }
  }

  let matchedChapter = await prisma.academicChapter.findFirst({
    where: {
      ...subjectCondition,
      OR: searchConditions,
      isActive: true,
    },
    include: {
      subject: true,
    },
  });

  if (!matchedChapter && subjectIdArg) {
    // If not found with subject condition, try without it
    matchedChapter = await prisma.academicChapter.findFirst({
      where: {
        OR: searchConditions,
        isActive: true,
      },
      include: {
        subject: true,
      },
    });
  }

  if (!matchedChapter) {
    const partialConditions = variants.flatMap((v) => [
      { nameBn: { contains: v, mode: "insensitive" as const } },
      { nameEn: { contains: v, mode: "insensitive" as const } },
    ]);
    matchedChapter = await prisma.academicChapter.findFirst({
      where: {
        ...subjectCondition,
        OR: partialConditions,
        isActive: true,
      },
      include: {
        subject: true,
      },
      orderBy: {
        position: "asc",
      },
    });
  }

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
    const { cleanExplanation, extractedRefs: expExtractedRefs } = extractExplanationAndRefs(q.explanation);

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

    // Combine any references in `q.reference` with ones extracted from bracketed context, question, and explanation
    const combinedRefs = [
      ...(q.reference || []),
      ...qExtractedRefs,
      ...ctxExtractedRefs,
      ...expExtractedRefs,
    ];
    const normalizedRefs = normalizeReferences(combinedRefs);
    const questionType = (cleanedContext || q.hasAttachment)
      ? "COMBINED"
      : (q.type || (cleanStatements.length > 0 ? "MULTIPLE" : "SINGLE"));
    const isMathDetected = Boolean(
      q.isMath ||
      /[\$\\\{\}\^]|(?:\\frac|\\sqrt|\\times)/.test(cleanQuestion) ||
      (cleanExplanation && /[\$]/.test(cleanExplanation)) ||
      cleanOptions.some((opt) => /[\$]/.test(opt))
    );
    const finalSource = q.source || sourceName;
    const finalSession = q.session || sessionYear;

    // Check if matching question already exists in this chapter (Deduplication)
    const existingCandidates = await prisma.mcq.findMany({
      where: {
        chapterId: matchedChapter.id,
        question: cleanQuestion,
      },
      include: {
        attachments: true,
      },
    });

    const existing = existingCandidates.find((c) => {
      // If context is present (COMBINED question), ensure stimulus content matches
      if (cleanedContext) {
        const passage = c.attachments.find((a) => a.type === "PASSAGE");
        if (passage?.content?.trim() !== cleanedContext.trim()) {
          return false;
        }
      }
      if (cleanStatements.length > 0 || c.statements.length > 0) {
        return JSON.stringify(c.statements) === JSON.stringify(cleanStatements);
      }
      return JSON.stringify(c.options) === JSON.stringify(cleanOptions);
    });

    let currentMcqId: string;

    if (existing) {
      // Update existing record (refreshes fields without wiping previous questions)
      const mergedRefs = normalizeReferences([
        ...(existing.reference || []),
        ...combinedRefs,
      ]);
      const updated = await prisma.mcq.update({
        where: { id: existing.id },
        data: {
          answer: cleanAnswer,
          options: cleanOptions,
          statements: cleanStatements,
          type: questionType,
          isMath: isMathDetected,
          reference: mergedRefs,
          explanation: cleanExplanation,
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
          explanation: cleanExplanation,
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
      const rawCaption = q.attachmentDescription?.trim();
      const caption = rawCaption && rawCaption !== "উদ্দীপক" ? rawCaption : (cleanedContext ? null : "চিত্র সংযুক্ত করুন");
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

        // Ensure a QuestionReport is logged in DB so Admin "রিপোর্ট স্ট্যাটাস" filter tags it
        const existingReport = await prisma.questionReport.findFirst({
          where: {
            entityType: "MCQ",
            entityId: currentMcqId,
            reportType: "MISSING_IMAGE",
          },
        });

        if (!existingReport) {
          await prisma.questionReport.create({
            data: {
              entityType: "MCQ",
              entityId: currentMcqId,
              reportType: "MISSING_IMAGE",
              description: q.attachmentDescription || "চিত্র / ডায়াগ্রাম সংযোজন প্রয়োজন",
              status: "PENDING",
            },
          });
        }
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

if (process.argv[1]?.replace(/\\/g, "/").includes("seed-mcq-json")) {
  main()
    .catch((err) => {
      console.error("\n❌ Seeding Error:", err.message);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

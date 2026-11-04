import { resolve } from "node:path";
import { readFileSync, readdirSync, existsSync, mkdirSync, appendFileSync, statSync } from "node:fs";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.js";

// Load root .env and packages/db/.env
const WORKSPACE_ROOT = resolve(import.meta.dirname, "..");
config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });
config();

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("\x1b[31m✖ MAIN_DATABASE_URL or DATABASE_URL is not set.\x1b[0m");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEFAULT_SOURCE = "সহায়ক সংকলন";
const DEFAULT_SESSION = "2026";

interface RawCsQuestion {
  context?: string | null;
  questionA: string;
  questionB: string;
  reference?: string[];
  difficulty?: string;
  isMath?: boolean;
  hasAttachment?: boolean;
  attachmentType?: string | null;
  attachmentDescription?: string | null;
}

interface RawCsFile {
  chapterTitle: string;
  subjectName?: string;
  source?: string;
  session?: string;
  questions: RawCsQuestion[];
}

function cleanSubQuestion(qText: string | null | undefined, prefixLetter: string): string {
  if (!qText) return "";
  let text = qText.trim();
  // Strip Gemini Web citation artifacts
  text = text.replace(/\[cite:\s*[^\]]+\]/gi, "").trim();
  text = text.replace(/\[?\bcite:\s*\d+\b\]?/gi, "").trim();

  // Strip leading prefixes like "ক)", "ক.", "(ক)", "খ)", "খ.", "(খ)"
  const prefixRegex = new RegExp(`^\\(?[${prefixLetter}][.)।|\\-\\s]+`, "i");
  text = text.replace(prefixRegex, "").trim();

  // Strip trailing learning outcome / marks indicators like '◄ শিখনফল-৯  ৩' or '◄ শিখনফল-৪  ৭'
  text = text.replace(/◄\s*শিখনফল[-\s]*[০-৯0-9]+\s*[০-৯0-9]*\s*$/gi, "").trim();
  text = text.replace(/\s*[◄<\-–]\s*শিখনফল[^\n]+$/gi, "").trim();

  // Strip trailing marks like '৩', '৭', '(৩)', '(৭)' at end of question
  text = text.replace(/\s*\(?[০-৯0-9]+\)?\s*$/g, "").trim();

  // Strip bracketed references e.g. [ঢা. বো. ২০২৪]
  text = text.replace(/\s*\[([^\]]+)\]\s*([?।|.]?)/g, "$2").trim();

  return text;
}

function cleanContext(contextText: string | null | undefined): string | null {
  if (!contextText || !contextText.trim()) return null;
  let text = contextText.trim();
  text = text.replace(/\[cite:\s*[^\]]+\]/gi, "").trim();
  text = text.replace(/\[?\bcite:\s*\d+\b\]?/gi, "").trim();

  // Strip introductory exam headers
  text = text.replace(/^[-\s]*নিচের\s+উদ্দীপকটি\s+প[ড়ড]়?ে\s+[০-৯0-9\s,ওএবংথেকেto-]+(?:নং|নম্বর)?\s+প্রশ্নের?\s+উত্তর\s+দাও\s*[:ঃ]?\s*/gi, "").trim();
  text = text.replace(/^[-\s]*উদ্দীপকটি\s+প[ড়ড]়?ে\s+[০-৯0-9\s,ওএবংথেকেto-]+(?:নং|নম্বর)?\s+প্রশ্নের?\s+উত্তর\s+দাও\s*[:ঃ]?\s*/gi, "").trim();

  return text;
}

function isQuestionNoReference(ref: string): boolean {
  const trimmed = ref.trim();
  if (trimmed.startsWith("অনন্য প্রশ্ন")) return true;
  if (trimmed.startsWith("প্রশ্ন নং") || trimmed.startsWith("প্রশ্ন নম্বর") || trimmed.startsWith("প্রশ্ন")) return true;
  if (/^\[?cite:/i.test(trimmed)) return true;
  return /^(?:প্রশ্ন\s*(?:নং|নম্বর)?\s*[-:–.]?\s*[০-৯0-9]+|q(?:uestion)?\s*(?:no\.?)?\s*[-:–.]?\s*\d+)$/i.test(trimmed);
}

function normalizeReferences(rawRefs?: string[]): string[] {
  if (!rawRefs || !Array.isArray(rawRefs)) return [];

  const splitItems = rawRefs.flatMap((item) =>
    typeof item === "string" ? item.split(/[;；|]+|,\s*(?=নি[.\s]*প)/).map((s) => s.trim()) : []
  ).filter(Boolean);

  const normalized = new Set<string>();

  for (const rawItem of splitItems) {
    let item = rawItem
      .replace(/\[cite:\s*[^\]]+\]/gi, "")
      .replace(/\[?\bcite:\s*\d+\b\]?/gi, "")
      .replace(/\s*\|\s*প্রশ্ন\s*(?:নং|নম্বর)?\s*[-:–.]?\s*[০-৯0-9]+/gi, "")
      .replace(/,\s*প্রশ্ন\s*(?:নং|নম্বর)?\s*[-:–.]?\s*[০-৯0-9]+/gi, "")
      .trim();

    if (!item || isQuestionNoReference(item)) {
      continue;
    }

    const multiYearMatch = item.match(/^(.+?)\s+([০-৯]{4}(?:\s*,\s*[০-৯]{4})+)$/);
    if (multiYearMatch) {
      const prefix = multiYearMatch[1]!.trim();
      const years = multiYearMatch[2]!.split(",").map((y) => y.trim());
      for (const y of years) {
        normalized.add(`${prefix} ${y}`);
      }
    } else {
      normalized.add(item);
    }
  }

  return Array.from(normalized);
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

async function seedSingleCsFile(filePath: string, forceClean = false) {
  console.log(`\n======================================================`);
  console.log(`CS FILE:           ${filePath}`);

  const content = readFileSync(filePath, "utf-8");
  let data: RawCsFile;
  try {
    data = JSON.parse(content);
  } catch (err: any) {
    console.error(`\x1b[31m✖ Invalid JSON format:\x1b[0m ${err.message}`);
    return;
  }

  if (!data.chapterTitle || !Array.isArray(data.questions)) {
    console.error("\x1b[31m✖ JSON missing required 'chapterTitle' or 'questions' array.\x1b[0m");
    return;
  }

  // 1. Resolve Target Chapter
  const variants = getBengaliVariants(data.chapterTitle);
  const searchConditions = variants.flatMap((v) => [
    { nameBn: v },
    { nameEn: { equals: v, mode: "insensitive" as const } },
  ]);

  let matchedChapter = await prisma.academicChapter.findFirst({
    where: {
      OR: searchConditions,
      isActive: true,
    },
    include: {
      subject: true,
    },
  });

  if (!matchedChapter) {
    const partialConditions = variants.flatMap((v) => [
      { nameBn: { contains: v, mode: "insensitive" as const } },
      { nameEn: { contains: v, mode: "insensitive" as const } },
    ]);
    matchedChapter = await prisma.academicChapter.findFirst({
      where: {
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
    console.error(`\x1b[31m✖ No active chapter found matching: "${data.chapterTitle}"\x1b[0m`);
    return;
  }

  console.log(`TARGET SUBJECT:    ${matchedChapter.subject.nameBn} (${matchedChapter.subjectId})`);
  console.log(`TARGET CHAPTER:    ${matchedChapter.nameBn} [Pos ${matchedChapter.position}] (${matchedChapter.id})`);
  console.log(`QUESTIONS IN FILE: ${data.questions.length}`);
  console.log(`======================================================`);

  if (forceClean) {
    const deleted = await prisma.cS.deleteMany({
      where: { chapterId: matchedChapter.id },
    });
    console.log(`\x1b[33m[Force Clean] Deleted ${deleted.count} existing CS record(s).\x1b[0m`);
  }

  // Find CS QuestionType
  const csType = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: "CS" },
        { nameBn: "সহপাঠ অংশ প্রশ্ন" },
        { nameBn: { contains: "সহপাঠ" } },
      ],
    },
  });

  const sessionYear = data.session || DEFAULT_SESSION;
  const sourceName = data.source || DEFAULT_SOURCE;
  let insertedCount = 0;
  let updatedCount = 0;

  for (let idx = 0; idx < data.questions.length; idx++) {
    const q = data.questions[idx]!;

    const cleanA = cleanSubQuestion(q.questionA, "ক");
    const cleanB = cleanSubQuestion(q.questionB, "খ");
    const cleanedContext = cleanContext(q.context);

    if (!cleanA || !cleanB) {
      console.warn(`\x1b[33m[Warning] Question index ${idx} missing questionA or questionB, skipping.\x1b[0m`);
      continue;
    }

    const normalizedRefs = normalizeReferences(q.reference);
    const difficultyLevel = q.difficulty ? q.difficulty.toUpperCase() : "MEDIUM";

    // Deduplication check
    const existingCandidates = await prisma.cS.findMany({
      where: {
        chapterId: matchedChapter.id,
        questionA: cleanA,
        questionB: cleanB,
      },
      include: {
        attachments: true,
      },
    });

    let currentCsId: string;

    if (existingCandidates.length > 0) {
      const existing = existingCandidates[0]!;
      const mergedRefs = normalizeReferences([
        ...(existing.reference || []),
        ...normalizedRefs,
      ]);

      const updated = await prisma.cS.update({
        where: { id: existing.id },
        data: {
          reference: mergedRefs,
          difficulty: difficultyLevel,
          source: sourceName,
          session: sessionYear,
          isActive: true,
        },
      });
      currentCsId = updated.id;
      updatedCount++;
    } else {
      const created = await prisma.cS.create({
        data: {
          questionA: cleanA,
          questionB: cleanB,
          reference: normalizedRefs,
          difficulty: difficultyLevel,
          source: sourceName,
          session: sessionYear,
          subjectId: matchedChapter.subjectId,
          chapterId: matchedChapter.id,
          questionTypeId: csType?.id || null,
          isActive: true,
        },
      });
      currentCsId = created.id;
      insertedCount++;
    }

    // Handle Attachments (Passage or Diagram/Table if present)
    if (cleanedContext || q.hasAttachment) {
      const existingAttachment = await prisma.questionAttachment.findFirst({
        where: { csId: currentCsId },
      });

      const attachmentType = q.attachmentType || (cleanedContext ? "PASSAGE" : "DIAGRAM");
      const rawCaption = q.attachmentDescription?.trim();
      const caption = rawCaption && rawCaption !== "উদ্দীপক" ? rawCaption : null;
      const contentText = cleanedContext || null;

      if (!existingAttachment) {
        await prisma.questionAttachment.create({
          data: {
            csId: currentCsId,
            type: attachmentType,
            caption,
            content: contentText,
          },
        });
      } else {
        await prisma.questionAttachment.update({
          where: { id: existingAttachment.id },
          data: {
            type: attachmentType,
            caption,
            content: contentText,
          },
        });
      }
    }
  }

  console.log(`\x1b[32m✅ CS Seed Finished: ${insertedCount} newly inserted, ${updatedCount} updated.\x1b[0m`);
  const totalInDb = await prisma.cS.count({ where: { chapterId: matchedChapter.id } });
  console.log(`📊 Total CS now in chapter "${matchedChapter.nameBn}": ${totalInDb}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const forceClean = args.includes("--force-clean");
  const targetFiles = args.filter((a) => !a.startsWith("--"));

  if (targetFiles.length > 0) {
    for (const tf of targetFiles) {
      let absPath: string;
      if (existsSync(resolve(process.cwd(), tf))) {
        absPath = resolve(process.cwd(), tf);
      } else if (existsSync(resolve(WORKSPACE_ROOT, tf))) {
        absPath = resolve(WORKSPACE_ROOT, tf);
      } else {
        absPath = resolve(WORKSPACE_ROOT, tf);
      }

      if (existsSync(absPath)) {
        await seedSingleCsFile(absPath, forceClean);
      } else {
        console.error(`\x1b[31mFile not found: ${absPath}\x1b[0m`);
      }
    }
  } else {
    const defaultFile = resolve(WORKSPACE_ROOT, "scratch/raw-data/test-cs.json");
    if (existsSync(defaultFile)) {
      await seedSingleCsFile(defaultFile, forceClean);
    } else {
      console.log(`Usage: pnpm seed:cs <path-to-cs.json>`);
    }
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

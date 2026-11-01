import { resolve } from "node:path";
import { readFileSync, readdirSync, existsSync, mkdirSync, appendFileSync, statSync } from "node:fs";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.js";

// Load root .env
const WORKSPACE_ROOT = resolve(import.meta.dirname, "..");
config({ path: resolve(WORKSPACE_ROOT, ".env") });
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

interface RawCqQuestion {
  context?: string | null;
  questionA: string;
  questionB: string;
  questionC?: string | null;
  questionD?: string | null;
  reference?: string[];
  difficulty?: string;
  isMath?: boolean;
  hasAttachment?: boolean;
  attachmentType?: string | null;
  attachmentDescription?: string | null;
}

interface RawCqFile {
  chapterTitle: string;
  subjectName?: string;
  source?: string;
  session?: string;
  questions: RawCqQuestion[];
}

function cleanSubQuestion(qText: string | null | undefined, prefixLetter: string): string {
  if (!qText) return "";
  let text = qText.trim();
  // Strip Gemini Web citation artifacts like [cite: 10], [cite: 11], [cite: 14]
  text = text.replace(/\[cite:\s*[^\]]+\]/gi, "").trim();
  text = text.replace(/\[?\bcite:\s*\d+\b\]?/gi, "").trim();

  // Strip leading ক., (ক), ক), etc.
  const prefixRegex = new RegExp(`^[(]?[${prefixLetter}][)]?[.:\\-\\s]+`, "i");
  text = text.replace(prefixRegex, "").trim();

  // Strip trailing mark indicators like ' ১', ' ২', ' ৩', ' ৪' or bracketed marks
  text = text.replace(/\s*[(]?([১-৪]|\d)[)]?\s*$/, "").trim();

  // Strip trailing learning outcome indicators like '◄ শিখনফল-১', 'শিখনফল-১, ২'
  text = text.replace(/\s*[◄►]?\s*শিখনফল[-–\s\d,]+$/g, "").trim();

  return text;
}

function cleanContext(rawContext?: string | null): string {
  if (!rawContext) return "";
  let text = rawContext.trim();

  // Strip Gemini Web citation artifacts like [cite: 10], [cite: 11], [cite: 14]
  text = text.replace(/\[cite:\s*[^\]]+\]/gi, "").trim();
  text = text.replace(/\[?\bcite:\s*\d+\b\]?/gi, "").trim();

  // Strip introductory exam headers like 'নিচের উদ্দীপকটি পড়ে ১ ও ২ নম্বর প্রশ্নের উত্তর দাও:'
  text = text.replace(/^[-\s]*নিচের\s+উদ্দীপকটি\s+প[ড়ড]়?ে\s+[০-৯0-9\s,ওএবংথেকেto-]+(?:নং|নম্বর)?\s+প্রশ্নের?\s+উত্তর\s+দাও\s*[:ঃ]?\s*/gi, "").trim();
  text = text.replace(/^[-\s]*উদ্দীপকটি\s+প[ড়ড]়?ে\s+[০-৯0-9\s,ওএবংথেকেto-]+(?:নং|নম্বর)?\s+প্রশ্নের?\s+উত্তর\s+দাও\s*[:ঃ]?\s*/gi, "").trim();

  return text;
}

function isQuestionNoReference(ref: string): boolean {
  const trimmed = ref.trim();
  // Matches "অনন্য প্রশ্ন ...", "প্রশ্ন নং ১", "প্রশ্ন ১", "প্রশ্ন নং-১", "প্রশ্ন: ১", "Question 1", citation tags, etc.
  if (trimmed.startsWith("অনন্য প্রশ্ন")) return true;
  if (trimmed.startsWith("প্রশ্ন নং")) return true;
  if (trimmed.startsWith("প্রশ্ন")) return true;
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
    // Strip citations and trailing '| প্রশ্ন নং ১' or ', প্রশ্ন নং ১' if present inside a single string
    let item = rawItem
      .replace(/\[cite:\s*[^\]]+\]/gi, "")
      .replace(/\[?\bcite:\s*\d+\b\]?/gi, "")
      .replace(/\s*\|\s*প্রশ্ন\s*(?:নং|নম্বর)?\s*[-:–.]?\s*[০-৯0-9]+/gi, "")
      .replace(/,\s*প্রশ্ন\s*(?:নং|নম্বর)?\s*[-:–.]?\s*[০-৯0-9]+/gi, "")
      .trim();

    // Skip question number or citation references
    if (!item || isQuestionNoReference(item)) {
      continue;
    }

    // If e.g. "নি. প. ২০২৫, ২০২৪" -> expand to "নি. প. ২০২৫", "নি. প. ২০২৪"
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

async function seedSingleCqFile(filePath: string, forceClean = false) {
  console.log(`\n======================================================`);
  console.log(`CQ FILE:           ${filePath}`);

  const content = readFileSync(filePath, "utf-8");
  let data: RawCqFile;
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
  const searchTitle = data.chapterTitle.trim();
  const normalizedTitle = searchTitle.replace(/ী/g, "ি").replace(/ূ/g, "ু");

  const matchedChapter = await prisma.academicChapter.findFirst({
    where: {
      OR: [
        { nameBn: { contains: searchTitle, mode: "insensitive" } },
        { nameEn: { contains: searchTitle, mode: "insensitive" } },
        { nameBn: { contains: normalizedTitle, mode: "insensitive" } },
        { nameEn: { contains: normalizedTitle, mode: "insensitive" } },
      ],
      isActive: true,
    },
    include: {
      subject: true,
    },
    orderBy: {
      position: "asc",
    },
  });

  if (!matchedChapter) {
    console.error(`\x1b[31m✖ No active chapter found matching: "${searchTitle}"\x1b[0m`);
    return;
  }

  console.log(`TARGET SUBJECT:    ${matchedChapter.subject.nameBn || matchedChapter.subject.nameEn} (${matchedChapter.subjectId})`);
  console.log(`TARGET CHAPTER:    ${matchedChapter.nameBn} [Pos ${matchedChapter.position}] (${matchedChapter.id})`);
  console.log(`QUESTIONS IN FILE: ${data.questions.length}`);
  console.log(`======================================================`);

  if (forceClean) {
    const deleted = await prisma.cq.deleteMany({
      where: { chapterId: matchedChapter.id },
    });
    console.log(`\x1b[33m⚠ --force-clean active: Deleted ${deleted.count} existing CQs from this chapter.\x1b[0m`);
  }

  // 2. Resolve CQ QuestionType
  let questionTypeId: string | null = null;
  const qt = await prisma.questionType.findFirst({
    where: {
      OR: [
        { label: { contains: "CQ", mode: "insensitive" } },
        { nameEn: { contains: "CQ", mode: "insensitive" } },
        { label: { contains: "Creative", mode: "insensitive" } },
        { nameEn: { contains: "Creative", mode: "insensitive" } },
      ],
      isActive: true,
    },
    select: { id: true },
  });
  if (qt) questionTypeId = qt.id;

  const defaultMarks = { a: 1, b: 2, c: 3, d: 4 };
  const sourceName = data.source || DEFAULT_SOURCE;
  const sessionName = data.session || DEFAULT_SESSION;

  let insertedCount = 0;
  let updatedCount = 0;
  const auditItems: any[] = [];

  for (let idx = 0; idx < data.questions.length; idx++) {
    const q = data.questions[idx]!;

    const questionA = cleanSubQuestion(q.questionA, "ক");
    const questionB = cleanSubQuestion(q.questionB, "খ");
    const questionC = cleanSubQuestion(q.questionC, "গ") || null;
    const questionD = cleanSubQuestion(q.questionD, "ঘ") || null;
    const context = cleanContext(q.context) || null;
    const normalizedRefs = normalizeReferences(q.reference);

    if (!questionA || !questionB) {
      console.warn(`  [${idx + 1}] Skipping question: missing questionA or questionB.`);
      continue;
    }

    // Find candidate CQs matching questionA and questionB
    const existingCandidates = await prisma.cq.findMany({
      where: {
        chapterId: matchedChapter.id,
        questionA: questionA,
        questionB: questionB,
      },
      include: {
        attachments: true,
      },
    });

    const existingCq = existingCandidates.find((c) => {
      // If questionC exists on both, compare questionC
      if (questionC && c.questionC) {
        return c.questionC.trim() === questionC.trim();
      }
      // If context/attachment exists, compare stimulus content
      if (context) {
        const passage = c.attachments.find((a) => a.type === "PASSAGE");
        return passage?.content?.trim() === context.trim();
      }
      return true;
    });

    let currentCqId: string;

    if (existingCq) {
      await prisma.cq.update({
        where: { id: existingCq.id },
        data: {
          questionA,
          questionB,
          questionC,
          questionD,
          context: null, // Keep null on cq table; stimulus is stored in QuestionAttachment
          reference: normalizedRefs,
          difficulty: q.difficulty || "MEDIUM",
          marks: defaultMarks,
          source: sourceName,
          session: sessionName,
          questionTypeId: questionTypeId,
        },
      });
      currentCqId = existingCq.id;
      updatedCount++;
    } else {
      const created = await prisma.cq.create({
        data: {
          subjectId: matchedChapter.subjectId,
          chapterId: matchedChapter.id,
          questionA,
          questionB,
          questionC,
          questionD,
          context: null, // Keep null on cq table; stimulus is stored in QuestionAttachment
          reference: normalizedRefs,
          difficulty: q.difficulty || "MEDIUM",
          marks: defaultMarks,
          source: sourceName,
          session: sessionName,
          questionTypeId: questionTypeId,
          isActive: true,
        },
      });
      currentCqId = created.id;
      insertedCount++;
    }

    // Handle Question Attachments (Passage stimulus or diagram)
    if (context || q.hasAttachment) {
      const existingAttachment = await prisma.questionAttachment.findFirst({
        where: { cqId: currentCqId },
      });

      const attachmentType = q.attachmentType || (context ? "PASSAGE" : "DIAGRAM");
      const rawCaption = q.attachmentDescription?.trim();
      // Rule: Never use 'উদ্দীপক' as caption! Strictly null unless a genuine specific caption (e.g. 'চিত্র ১', 'ছক ১')
      const caption = rawCaption && rawCaption !== "উদ্দীপক" && !rawCaption.includes("উদ্দীপক") ? rawCaption : null;
      let contentText = context || null;
      if (caption && contentText && contentText.trim() === caption.trim()) {
        contentText = null;
      }

      if (!existingAttachment) {
        await prisma.questionAttachment.create({
          data: {
            cqId: currentCqId,
            type: attachmentType,
            caption: caption,
            content: contentText,
          },
        });
      } else {
        await prisma.questionAttachment.update({
          where: { id: existingAttachment.id },
          data: {
            type: attachmentType,
            caption: caption,
            content: contentText,
          },
        });
      }

      // If visual media (diagram, circuit, map) is required, log audit & QuestionReport
      if (q.hasAttachment && !context) {
        auditItems.push({
          id: currentCqId,
          question: questionA,
          type: attachmentType,
          description: q.attachmentDescription || "Visual media required",
          reference: normalizedRefs.join(", ") || "N/A",
        });

        // Ensure database QuestionReport entry exists so Admin surfaces it under reports
        const existingReport = await prisma.questionReport.findFirst({
          where: {
            entityType: "CQ",
            entityId: currentCqId,
            reportType: "MISSING_IMAGE",
          },
        });

        if (!existingReport) {
          await prisma.questionReport.create({
            data: {
              entityType: "CQ",
              entityId: currentCqId,
              reportType: "MISSING_IMAGE",
              description: q.attachmentDescription || "চিত্র / ডায়াগ্রাম সংযোজন প্রয়োজন",
              status: "PENDING",
            },
          });
        }
      }
    }
  }

  const totalInChapter = await prisma.cq.count({
    where: { chapterId: matchedChapter.id },
  });

  console.log(`✅ CQ Seed Finished: ${insertedCount} newly inserted, ${updatedCount} updated.`);
  console.log(`📊 Total CQs now in chapter "${matchedChapter.nameBn}": ${totalInChapter}\n`);

  if (auditItems.length > 0) {
    const reportDir = resolve(WORKSPACE_ROOT, "scratch/reports");
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }
    const reportPath = resolve(reportDir, "CQ_RESOURCE_AUDIT_REPORT.md");

    let reportMarkdown = `\n### CQ Audit for Chapter: ${matchedChapter.nameBn} (${new Date().toLocaleDateString()})\n\n`;
    reportMarkdown += `| CQ ID | Question (ক) Clue | Missing Asset Type | Description | Reference |\n`;
    reportMarkdown += `| :--- | :--- | :--- | :--- | :--- |\n`;
    auditItems.forEach((item) => {
      reportMarkdown += `| \`${item.id}\` | ${item.question.slice(0, 45)}... | **${item.type}** | ${item.description} | ${item.reference} |\n`;
    });

    appendFileSync(reportPath, reportMarkdown, "utf-8");
    console.log(`📋 CQ Resource Audit Report updated at: ${reportPath}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const forceClean = args.includes("--force-clean");
  const rawPathArg = args.find((a) => !a.startsWith("--"));

  let targetPath: string;
  if (rawPathArg) {
    if (existsSync(resolve(process.cwd(), rawPathArg))) {
      targetPath = resolve(process.cwd(), rawPathArg);
    } else if (existsSync(resolve(WORKSPACE_ROOT, rawPathArg))) {
      targetPath = resolve(WORKSPACE_ROOT, rawPathArg);
    } else {
      targetPath = resolve(WORKSPACE_ROOT, rawPathArg);
    }
  } else {
    // If no argument, check scratch/raw-data/test-cq.json first (user's most recent drop location), then scratch/raw-data-cq
    const rawDataTestCq = resolve(WORKSPACE_ROOT, "scratch/raw-data/test-cq.json");
    const rawDataCqDir = resolve(WORKSPACE_ROOT, "scratch/raw-data-cq");

    if (existsSync(rawDataTestCq)) {
      targetPath = rawDataTestCq;
    } else {
      targetPath = rawDataCqDir;
    }
  }

  if (!existsSync(targetPath)) {
    mkdirSync(targetPath, { recursive: true });
    console.log(`Created empty folder: ${targetPath}`);
    console.log("Please place your CQ JSON files in scratch/raw-data-cq/ or scratch/raw-data/test-cq.json and rerun.");
    return;
  }

  if (statSync(targetPath).isFile()) {
    if (targetPath.endsWith(".json")) {
      await seedSingleCqFile(targetPath, forceClean);
    } else {
      console.log(`Target file is not a .json file: ${targetPath}`);
    }
    return;
  }

  const isDirectory = readdirSync(targetPath, { withFileTypes: true });
  const jsonFiles = isDirectory
    .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".json"))
    .map((dirent) => resolve(targetPath, dirent.name));

  if (jsonFiles.length === 0) {
    console.log(`No .json files found in ${targetPath}`);
    return;
  }

  console.log(`Found ${jsonFiles.length} CQ JSON file(s) in ${targetPath}. Processing batch...`);
  for (const file of jsonFiles) {
    await seedSingleCqFile(file, forceClean);
  }
}

main()
  .catch((err) => {
    console.error("\x1b[31m✖ Fatal error during CQ seeding:\x1b[0m", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { resolve } from "node:path";
import { readFileSync, readdirSync, existsSync, mkdirSync, appendFileSync, statSync } from "node:fs";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.ts";

// Load root .env
const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });

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
  table?: {
    headers?: string[];
    rows?: string[][];
  } | null;
  bottomContent?: string | null;
}

interface RawCqFile {
  chapterTitle: string;
  subjectName?: string;
  source?: string;
  session?: string;
  questions?: RawCqQuestion[];
  cqs?: RawCqQuestion[];
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
  // User strict rule: don't consider as ref which starts with প্রশ্ন or প্রশ্ন নং
  if (trimmed.startsWith("অনন্য প্রশ্ন")) return true;
  if (trimmed.startsWith("প্রশ্ন নং")) return true;
  if (trimmed.startsWith("প্রশ্ন")) return true;
  if (/^\[?cite:/i.test(trimmed)) return true;
  return /^(?:প্রশ্ন\s*(?:নং|নম্বর)?\s*[-:–.]?\s*[০-৯0-9]+|q(?:uestion)?\s*(?:no\.?)?\s*[-:–.]?\s*\d+)$/i.test(trimmed);
}

export function normalizeReferences(rawRefs?: string[]): string[] {
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
      .replace(/\s*[-–]\s*প্রশ্ন\s*(?:নং|নম্বর)?\s*[-:–.]?\s*[০-৯0-9]+/gi, "")
      .replace(/\s*[(]?প্রশ্ন\s*(?:নং|নম্বর)?\s*[-:–.]?\s*[০-৯0-9]+[)]?/gi, "")
      .trim();

    // Discard any question-number reference or empty string
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

async function resolveTargetChapter(chapterTitle: string) {
  const trimmed = (chapterTitle || "").trim();

  // Special aliases for Science Class 9/10 Pos 0: উন্নততর জীবনধারা
  if (
    trimmed.includes("খাদ্য") ||
    trimmed.includes("পুষ্টি") ||
    trimmed.includes("উন্নত") ||
    trimmed.includes("জীবনধারা")
  ) {
    const ch = await prisma.academicChapter.findFirst({
      where: {
        id: "cmwd7woyw00002oejaeoce9n6", // Pos 0: উন্নততর জীবনধারা
      },
      include: {
        subject: true,
      },
    });
    if (ch) return ch;
  }

  // Strip prefixes like "প্রথম অধ্যায়:", "১ম অধ্যায়:"
  const strippedTitle = trimmed
    .replace(/^(?:[০-৯\d]+|প্রথম|দ্বিতীয়|দ্বিতীয়|তৃতীয়|তৃতীয়|চতুর্থ|পঞ্চম|ষষ্ঠ|সপ্তম|অষ্টম|নবম|দশম|একাদশ|দ্বাদশ)\s*(?:অধ্যায়|অধ্যায়|অধ্যায়ঃ|অধ্যায়ঃ)\s*[:：\-–.]\s*/i, "")
    .trim();

  const matched = await prisma.academicChapter.findFirst({
    where: {
      OR: [
        { nameBn: { in: [trimmed, strippedTitle] } },
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

  return matched;
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

  const rawQuestions = data.questions || data.cqs || [];
  if (!data.chapterTitle || !Array.isArray(rawQuestions)) {
    console.error("\x1b[31m✖ JSON missing required 'chapterTitle' or 'questions'/'cqs' array.\x1b[0m");
    return;
  }

  // 1. Resolve Target Chapter
  const matchedChapter = await resolveTargetChapter(data.chapterTitle);
  if (!matchedChapter) {
    console.error(`\x1b[31m✖ No active chapter found matching: "${data.chapterTitle}" in Class 9/10 Science!\x1b[0m`);
    return;
  }

  console.log(`TARGET SUBJECT:    ${matchedChapter.subject.nameBn || matchedChapter.subject.nameEn} (${matchedChapter.subjectId})`);
  console.log(`TARGET CHAPTER:    ${matchedChapter.nameBn} [Pos ${matchedChapter.position}] (${matchedChapter.id})`);
  console.log(`QUESTIONS IN FILE: ${rawQuestions.length}`);
  console.log(`======================================================`);

  if (forceClean) {
    const deleted = await prisma.cq.deleteMany({
      where: { chapterId: matchedChapter.id },
    });
    console.log(`\x1b[33m⚠ --force-clean active: Deleted ${deleted.count} existing CQs from this chapter.\x1b[0m`);
  }

  // 2. Resolve CQ QuestionType: 'cmtr5kg3p001kp4tyqtfp30ee' (CQ / সৃজনশীল)
  let questionTypeId = "cmtr5kg3p001kp4tyqtfp30ee";
  const qt = await prisma.questionType.findFirst({
    where: {
      OR: [
        { id: "cmtr5kg3p001kp4tyqtfp30ee" },
        { nameEn: "CQ" },
        { nameBn: "সৃজনশীল" },
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

  for (let idx = 0; idx < rawQuestions.length; idx++) {
    const q = rawQuestions[idx]!;

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
      if (questionC && c.questionC) {
        return c.questionC.trim() === questionC.trim();
      }
      if (context) {
        const passage = c.attachments.find((a) => a.type === "PASSAGE" || a.type === "TABLE");
        return passage?.content?.trim() === context.trim();
      }
      return true;
    });

    let currentCqId: string;

    if (existingCq) {
      const mergedRefs = normalizeReferences([
        ...(existingCq.reference || []),
        ...(q.reference || []),
      ]);
      await prisma.cq.update({
        where: { id: existingCq.id },
        data: {
          questionA,
          questionB,
          questionC,
          questionD,
          context: null, // Keep null on cq table; stimulus is stored in QuestionAttachment
          reference: mergedRefs,
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

    // Handle Question Attachments (Passage stimulus, Table, or Diagram)
    const hasTable = Boolean(q.table && (q.table.headers?.length || q.table.rows?.length));
    if (context || q.hasAttachment || hasTable) {
      const existingAttachment = await prisma.questionAttachment.findFirst({
        where: { cqId: currentCqId },
      });

      const attachmentType = hasTable
        ? "TABLE"
        : q.attachmentType || (context ? "PASSAGE" : "DIAGRAM");

      const rawCaption = q.attachmentDescription?.trim();
      // Rule: Never use 'উদ্দীপক' as caption! Strictly null unless a genuine specific caption (e.g. 'চিত্র ১', 'ছক ১')
      const caption = rawCaption && rawCaption !== "উদ্দীপক" && !rawCaption.includes("উদ্দীপক") ? rawCaption : null;
      let contentText = context || null;
      if (caption && contentText && contentText.trim() === caption.trim()) {
        contentText = null;
      }

      const tableData = hasTable ? q.table : null;
      const bottomContent = q.bottomContent || null;

      if (!existingAttachment) {
        await prisma.questionAttachment.create({
          data: {
            cqId: currentCqId,
            type: attachmentType,
            caption: caption,
            content: contentText,
            table: tableData,
            bottomContent: bottomContent,
            tableBorder: hasTable ? true : null,
          },
        });
      } else {
        await prisma.questionAttachment.update({
          where: { id: existingAttachment.id },
          data: {
            type: attachmentType,
            caption: caption,
            content: contentText,
            table: tableData,
            bottomContent: bottomContent,
            tableBorder: hasTable ? true : null,
          },
        });
      }

      // If visual media (diagram, circuit, map) is required, log audit & QuestionReport
      if (q.hasAttachment && !context && !hasTable) {
        auditItems.push({
          id: currentCqId,
          question: questionA,
          type: attachmentType,
          description: q.attachmentDescription || "Visual media required",
          reference: normalizedRefs.join(", ") || "N/A",
        });

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
    return;
  }

  if (statSync(targetPath).isFile()) {
    if (targetPath.endsWith(".json")) {
      await seedSingleCqFile(targetPath, forceClean);
    }
    return;
  }

  const isDirectory = readdirSync(targetPath, { withFileTypes: true });
  const jsonFiles = isDirectory
    .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".json"))
    .map((dirent) => resolve(targetPath, dirent.name));

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

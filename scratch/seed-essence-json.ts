import { resolve } from "node:path";
import { readFileSync, existsSync } from "node:fs";
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
const DEFAULT_SUBJECT_ID = "cmw3l9kci0002i0ejt0rebiwv"; // বাংলা ২য় পত্র (নবম-দশম শ্রেণি)

interface RawEssenceItem {
  title: string;
  type?: "PROSE" | "POEM" | string;
  summary?: string | null;
  essence?: string | null;
  reference?: string[];
  difficulty?: string;
  source?: string;
  session?: string;
  popularityCount?: number;
  isEnglish?: boolean;
  isMath?: boolean;
}

interface RawEssenceFile {
  chapterTitle?: string | null;
  subjectId?: string;
  subjectName?: string;
  source?: string;
  session?: string;
  essences?: RawEssenceItem[];
  summaries?: RawEssenceItem[];
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

function cleanTitleText(text: string): string {
  if (!text) return "";
  let clean = text.trim();
  clean = clean.replace(/\[cite:\s*[^\]]+\]/gi, "").trim();
  clean = clean.replace(/\[?\bcite:\s*\d+\b\]?/gi, "").trim();
  // Strip leading numbering like "১.", "২.", "1."
  clean = clean.replace(/^[০-৯0-9]+[.)।|\-\s]+/g, "").trim();
  return clean;
}

async function main() {
  const args = process.argv.slice(2);
  const targetFileArg = args.find((a) => !a.startsWith("--"));

  const candidatePaths = [
    targetFileArg ? resolve(process.cwd(), targetFileArg) : null,
    targetFileArg ? resolve(WORKSPACE_ROOT, targetFileArg) : null,
    resolve(process.cwd(), "scratch/raw-data/test-essence.json"),
    resolve(WORKSPACE_ROOT, "scratch/raw-data/test-essence.json"),
    resolve(process.cwd(), "scratch/raw-data/test-summary.json"),
    resolve(WORKSPACE_ROOT, "scratch/raw-data/test-summary.json"),
  ].filter(Boolean) as string[];

  let filePath: string | null = null;
  for (const p of candidatePaths) {
    if (existsSync(p)) {
      filePath = p;
      break;
    }
  }

  if (!filePath) {
    console.error("\x1b[31m✖ Could not find test-essence.json file.\x1b[0m");
    process.exit(1);
  }

  console.log(`\n======================================================`);
  console.log(`FILE:              ${filePath}`);

  const rawContent = readFileSync(filePath, "utf-8");
  let parsedJson: any;
  try {
    parsedJson = JSON.parse(rawContent);
  } catch (err: any) {
    console.error(`\x1b[31m✖ JSON Parse Error:\x1b[0m ${err.message}`);
    process.exit(1);
  }

  const rawEssences: RawEssenceItem[] = Array.isArray(parsedJson)
    ? parsedJson
    : Array.isArray(parsedJson.essences)
    ? parsedJson.essences
    : Array.isArray(parsedJson.summaries)
    ? parsedJson.summaries
    : [];

  if (rawEssences.length === 0) {
    console.error("\x1b[31m✖ No essences found in JSON file.\x1b[0m");
    process.exit(1);
  }

  // 1. Resolve Target Subject
  const targetSubjectId = parsedJson.subjectId || DEFAULT_SUBJECT_ID;
  const targetSubject = await prisma.academicSubject.findUnique({
    where: { id: targetSubjectId },
    include: {
      classSubjects: {
        include: { academicClass: true },
      },
    },
  });

  if (!targetSubject) {
    console.error(`\x1b[31m✖ AcademicSubject with ID "${targetSubjectId}" not found.\x1b[0m`);
    process.exit(1);
  }

  const classNames = targetSubject.classSubjects.map((cs) => cs.academicClass.nameBn).join(", ");
  console.log(`TARGET SUBJECT:    ${targetSubject.nameBn} (${targetSubject.id}) [Class: ${classNames}]`);
  console.log(`TARGET MODEL:      Essence (table: essence)`);
  console.log(`CHAPTER MODE:      WITHOUT CHAPTER`);
  console.log(`ITEMS IN FILE:     ${rawEssences.length}`);
  console.log(`======================================================\n`);

  // 2. Resolve QuestionType for Essence
  let essenceQuestionType = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Essence", mode: "insensitive" } },
        { label: { equals: "Essence", mode: "insensitive" } },
        { nameBn: { equals: "সারমর্ম", mode: "insensitive" } },
        { label: { equals: "সারমর্ম", mode: "insensitive" } },
        { nameBn: { equals: "সারসংক্ষেপ", mode: "insensitive" } },
        { label: { equals: "সারসংক্ষেপ", mode: "insensitive" } },
        { nameBn: { equals: "মূলভাব", mode: "insensitive" } },
        { label: { equals: "মূলভাব", mode: "insensitive" } },
      ],
    },
  });

  if (!essenceQuestionType) {
    console.error("\x1b[31m✖ QuestionType for 'Essence' not found in database.\x1b[0m");
    process.exit(1);
  }

  // 3. Process Each Essence
  let insertedCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < rawEssences.length; i++) {
    const rawE = rawEssences[i]!;
    const cleanedTitle = cleanTitleText(rawE.title);
    if (!cleanedTitle) {
      console.warn(`[Item ${i + 1}] Skipping empty title.`);
      continue;
    }

    const normalizedRefs = normalizeReferences(rawE.reference);
    const difficulty = (rawE.difficulty || "MEDIUM").toUpperCase();
    const source = rawE.source || parsedJson.source || DEFAULT_SOURCE;
    const session = rawE.session || parsedJson.session || DEFAULT_SESSION;
    const popularityCount = rawE.popularityCount ?? 0;

    // Check if essence with matching title already exists for this subject
    const existing = await prisma.essence.findFirst({
      where: {
        subjectId: targetSubject.id,
        title: cleanedTitle,
      },
    });

    if (existing) {
      // Merge references
      const mergedRefs = Array.from(new Set([...existing.reference, ...normalizedRefs]));
      const refsChanged =
        mergedRefs.length !== existing.reference.length ||
        mergedRefs.some((r, idx) => r !== existing.reference[idx]);

      if (refsChanged) {
        await prisma.essence.update({
          where: { id: existing.id },
          data: {
            reference: mergedRefs,
            source: existing.source || source,
            session: existing.session || session,
          },
        });
      }
      updatedCount++;
    } else {
      // Insert new Essence
      await prisma.essence.create({
        data: {
          title: cleanedTitle,
          reference: normalizedRefs,
          source,
          session,
          difficulty,
          popularityCount,
          subjectId: targetSubject.id,
          questionTypeId: essenceQuestionType.id,
          isActive: true,
          isGlobal: true,
        },
      });
      insertedCount++;
    }
  }

  const totalInDb = await prisma.essence.count({
    where: { subjectId: targetSubject.id },
  });

  console.log(`✅ Seed Finished: ${insertedCount} newly inserted, ${updatedCount} updated/merged.`);
  console.log(`📊 Total Essences now in subject "${targetSubject.nameBn}": ${totalInDb}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

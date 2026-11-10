import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.js";

const WORKSPACE_ROOT = resolve(import.meta.dirname, "..");
config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });
config();

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("✖ MAIN_DATABASE_URL or DATABASE_URL is not set.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEFAULT_SUBJECT_ID = "cmw3l9kci0002i0ejt0rebiwv"; // বাংলা ২য় পত্র (নবম-দশম শ্রেণি)

async function main() {
  const subjectId = process.argv[2] || DEFAULT_SUBJECT_ID;

  const subject = await prisma.academicSubject.findUnique({
    where: { id: subjectId },
    include: {
      classSubjects: {
        include: { academicClass: true },
      },
    },
  });

  if (!subject) {
    console.error(`✖ Subject ${subjectId} not found.`);
    process.exit(1);
  }

  const paragraphs = await prisma.paragraph.findMany({
    where: { subjectId: subject.id },
    include: {
      questionType: true,
      academicChapter: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`\n======================================================`);
  console.log(`SUBJECT:           ${subject.nameBn} (${subject.id})`);
  console.log(`CLASS:             ${subject.classSubjects.map((cs) => cs.academicClass.nameBn).join(", ")}`);
  console.log(`TOTAL PARAGRAPHS:  ${paragraphs.length}`);
  console.log(`======================================================`);

  const diffCounts: Record<string, number> = {};
  let withChapterCount = 0;
  let withoutChapterCount = 0;
  let totalReferences = 0;
  let withReferencesCount = 0;

  for (const p of paragraphs) {
    diffCounts[p.difficulty] = (diffCounts[p.difficulty] || 0) + 1;
    if (p.academicChapterId) {
      withChapterCount++;
    } else {
      withoutChapterCount++;
    }
    if (p.reference && p.reference.length > 0) {
      withReferencesCount++;
      totalReferences += p.reference.length;
    }
  }

  console.log(`Difficulty Breakdown:`, diffCounts);
  console.log(`Without Chapter:     ${withoutChapterCount} (Strictly null)`);
  console.log(`With Chapter:        ${withChapterCount}`);
  console.log(`Paragraphs with Refs:${withReferencesCount} / ${paragraphs.length}`);
  console.log(`Total References:    ${totalReferences}`);

  console.log(`\nSamples:`);
  paragraphs.slice(0, 5).forEach((p, idx) => {
    console.log(
      `${idx + 1}. [${p.difficulty}] ${p.name.substring(0, 55)}${p.name.length > 55 ? "..." : ""} | Refs: [${p.reference.slice(0, 3).join(", ")}${p.reference.length > 3 ? ` +${p.reference.length - 3} more` : ""}] | Chapter: ${p.academicChapter?.nameBn || "None"}`
    );
  });
  console.log(`======================================================\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

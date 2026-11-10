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

const DEFAULT_SUBJECT_ID = "cmw3l9kci0002i0ejt0rebiwv"; // বাংলা ২য় পত্র (নবম-দশম শ্রেণি)

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

  const essences = await prisma.essence.findMany({
    where: { subjectId: subject.id },
    include: {
      questionType: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`\n======================================================`);
  console.log(`SUBJECT:           ${subject.nameBn} (${subject.id})`);
  console.log(`CLASS:             ${subject.classSubjects.map((cs) => cs.academicClass.nameBn).join(", ")}`);
  console.log(`TOTAL ESSENCES:    ${essences.length}`);
  console.log(`======================================================`);

  const diffCounts: Record<string, number> = {};
  const qtCounts: Record<string, number> = {};
  let totalReferences = 0;
  let withReferencesCount = 0;

  for (const e of essences) {
    diffCounts[e.difficulty] = (diffCounts[e.difficulty] || 0) + 1;
    const qtName = e.questionType?.nameBn || e.questionType?.nameEn || e.questionTypeId;
    qtCounts[qtName] = (qtCounts[qtName] || 0) + 1;

    if (e.reference && e.reference.length > 0) {
      withReferencesCount++;
      totalReferences += e.reference.length;
    }
  }

  console.log(`QuestionType Breakdown:`, qtCounts);
  console.log(`Difficulty Breakdown:  `, diffCounts);
  console.log(`Essences with Refs:    ${withReferencesCount} / ${essences.length}`);
  console.log(`Total References:      ${totalReferences}`);

  console.log(`\nSamples:`);
  essences.slice(0, 5).forEach((e, idx) => {
    const firstLine = e.title.split("\n")[0] || e.title;
    const qtLabel = e.questionType?.nameBn || e.questionType?.nameEn || "N/A";
    console.log(
      `${idx + 1}. [${qtLabel} | ${e.difficulty}] ${firstLine.substring(0, 55)}${firstLine.length > 55 ? "..." : ""} | Refs: [${e.reference.slice(0, 3).join(", ")}${e.reference.length > 3 ? ` +${e.reference.length - 3} more` : ""}]`
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

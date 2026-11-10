import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.js";

const WORKSPACE_ROOT = resolve(import.meta.dirname, "..");
config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });
config();

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const allSummaries = await prisma.summary.findMany({
    select: { id: true, title: true, subjectId: true, subject: { select: { nameBn: true } } },
  });
  console.log("\n--- SUMMARIES ---");
  allSummaries.forEach((s, idx) => console.log(`${idx + 1}. [Subject: ${s.subject?.nameBn} (${s.subjectId})] ${s.title.split("\n")[0]}`));

  const allEssences = await prisma.essence.findMany({
    select: { id: true, title: true, subjectId: true, subject: { select: { nameBn: true, classSubjects: { include: { academicClass: true } } } } },
  });

  console.log("\n--- ESSENCES (" + allEssences.length + ") ---");
  allEssences.forEach((e, idx) => {
    const className = e.subject?.classSubjects?.map((cs: any) => cs.academicClass.nameBn).join(", ");
    console.log(`${idx + 1}. [Subject: ${e.subject?.nameBn} (${e.subjectId}) | Class: ${className}] ${e.title.split("\n")[0]}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

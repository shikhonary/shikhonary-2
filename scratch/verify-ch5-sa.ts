import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.js";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "packages/db/.env") });

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: connectionString! });
const prisma = new PrismaClient({ adapter });

async function verify() {
  const chapterId = "cmwd7wp5u00042oej58hmz47t";
  const records = await prisma.shortAnswer.findMany({
    where: { chapterId },
    include: {
      subject: true,
      chapter: true,
      questionType: true,
    },
  });

  console.log(`=== ShortAnswer Verification for: ${records[0]?.chapter.nameBn} ===`);
  console.log(`Total ShortAnswer records: ${records.length}`);

  let mathCount = 0;
  const sources: Record<string, number> = {};
  const difficulties: Record<string, number> = {};

  for (const r of records) {
    if (r.isMath) mathCount++;
    sources[r.source || "null"] = (sources[r.source || "null"] || 0) + 1;
    difficulties[r.difficulty] = (difficulties[r.difficulty] || 0) + 1;
  }

  console.log("Sources breakdown:", sources);
  console.log("Difficulties breakdown:", difficulties);
  console.log(`Questions with isMath === true: ${mathCount}`);
  console.log("Sample record:", {
    id: records[0]?.id,
    question: records[0]?.question,
    reference: records[0]?.reference,
    source: records[0]?.source,
    session: records[0]?.session,
    difficulty: records[0]?.difficulty,
  });
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

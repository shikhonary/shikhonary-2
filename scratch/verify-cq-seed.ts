import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.js";

const WORKSPACE_ROOT = resolve(import.meta.dirname, "..");
config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });
config();

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: connectionString! });
const prisma = new PrismaClient({ adapter });

async function verify(chapterId: string) {
  const chapter = await prisma.academicChapter.findUnique({
    where: { id: chapterId },
    include: { subject: true },
  });

  if (!chapter) {
    console.error(`Chapter "${chapterId}" not found!`);
    process.exit(1);
  }

  const cqs = await prisma.cq.findMany({
    where: { chapterId: chapter.id },
    include: { attachments: true },
    orderBy: { createdAt: "asc" },
  });

  let invalidRefs = 0;
  let totalAttachments = 0;

  for (const c of cqs) {
    totalAttachments += c.attachments.length;
    for (const r of c.reference) {
      if (r.startsWith("প্রশ্ন নং") || r.startsWith("অনন্য প্রশ্ন") || /cite:/i.test(r)) {
        invalidRefs++;
      }
    }
  }

  console.log(`\nVerified ${cqs.length} CQs in Chapter "${chapter.nameBn}" (${chapter.id}):`);
  console.log(`Subject: ${chapter.subject.nameBn} (${chapter.subjectId})`);
  console.log(`Total Attachments (Passages / Images): ${totalAttachments}`);
  console.log(`Invalid References: ${invalidRefs}`);

  console.log("\nSamples:");
  const samples = [cqs[0], cqs[1], cqs[cqs.length - 1]].filter(Boolean);
  for (const s of samples) {
    console.log(`- Q(ক): ${s.questionA} | Q(খ): ${s.questionB} | Refs: ${JSON.stringify(s.reference)} | Attachments: ${s.attachments.length}`);
  }
}

const targetChapter = process.argv[2] || "cmwlwu88g0005k4tofimidxfl";
verify(targetChapter)
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

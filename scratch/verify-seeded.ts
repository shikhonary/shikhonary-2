import { resolve } from "node:path";
import { config } from "dotenv";

const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.ts";

const adapter = new PrismaPg({ connectionString: process.env.MAIN_DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function verify() {
  const count = await prisma.mcq.count({
    where: { chapterId: "cmvwfqnp30000y0ejd96mhik5" }
  });
  console.log(`Total MCQs in Chapter "প্রত্যুপকার": ${count}`);

  const types = await prisma.mcq.groupBy({
    by: ["type"],
    where: { chapterId: "cmvwfqnp30000y0ejd96mhik5" },
    _count: { id: true }
  });
  console.log("MCQ Types Breakdown:", types);

  const sampleCombined = await prisma.mcq.findMany({
    where: {
      chapterId: "cmvwfqnp30000y0ejd96mhik5",
      question: { contains: "উদ্দীপকে তরুর মনোভাব" }
    },
    include: { attachments: true }
  });
  console.log("COMBINED Verification:", JSON.stringify(sampleCombined.map(q => ({
    question: q.question,
    reference: q.reference,
    attachmentType: q.attachments[0]?.type,
    caption: q.attachments[0]?.caption,
    content: q.attachments[0]?.content
  })), null, 2));
}

verify().finally(() => prisma.$disconnect());

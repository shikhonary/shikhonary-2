import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.ts";

const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: connectionString! });
const prisma = new PrismaClient({ adapter });

async function checkMultipleAttachments() {
  const headerRegex = /(?:^|[\r\n]+)\s*((?:দৃশ্যকল্প|চিত্র|দৃশ্যপট|উদ্দীপক)\s*[-–:：]?\s*[১-৯\d]+)\s*[:：\-–.]?\s*/gi;

  const attachments = await prisma.questionAttachment.findMany({
    where: {
      cqId: { not: null },
      content: { not: null },
    },
    include: {
      cq: {
        include: {
          attachments: true,
          subject: true,
          chapter: true,
        },
      },
    },
  });

  const hits = attachments.filter((a) => {
    const matches = [...(a.content || "").matchAll(headerRegex)];
    return matches.length >= 2;
  });

  console.log(`Total hits: ${hits.length}`);

  const withMultipleAttachments = hits.filter((h) => h.cq && h.cq.attachments.length > 1);
  console.log(`Hits where CQ has >1 total attachments: ${withMultipleAttachments.length}`);

  for (const h of withMultipleAttachments) {
    console.log(`CQ ID: ${h.cqId} (${h.cq?.subject?.nameBn} - ${h.cq?.chapter?.nameBn})`);
    console.log("  Attachments in this CQ:");
    h.cq?.attachments.forEach((a, idx) => {
      console.log(`    [${idx}] Type: ${a.type} | Caption: "${a.caption}" | Content len: ${a.content?.length || 0} | Table: ${Boolean(a.table)}`);
    });
  }
}

checkMultipleAttachments()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

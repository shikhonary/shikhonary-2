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

async function checkGeo() {
  const attachments = await prisma.questionAttachment.findMany({
    where: {
      cqId: { not: null },
      cq: {
        subject: {
          OR: [
            { id: "cmwrmhge900000gto9rooxt4v" },
            { nameBn: { contains: "ভূগোল" } },
          ],
        },
      },
    },
    include: {
      cq: {
        include: { chapter: true, subject: true },
      },
    },
  });

  console.log("Geography CQ attachments count:", attachments.length);
  const regex = /(দৃশ্যকল্প|দৃশ্যপট|চিত্র|ছক|উদ্দীপক)[\s:–-]*[১1২2]/i;
  const hits = attachments.filter((a) => a.content && regex.test(a.content));
  console.log("Hits with keywords in content:", hits.length);
  hits.forEach((h, i) => {
    console.log(`\n--- Hit ${i + 1} [${h.cq?.chapter?.nameBn}] ID: ${h.id} CQ: ${h.cqId} Type: ${h.type} ---`);
    console.log(h.content);
  });
}

checkGeo()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

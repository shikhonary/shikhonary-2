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
  console.error("Database connection string missing!");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: connectionString! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const targetArg = process.argv[2]; // optional chapterId or chapterTitle

  console.log("======================================================");
  console.log("REMOVING CAPTION TEXT FOR TABLE ATTACHMENTS");
  console.log("======================================================");

  // Find all TABLE attachments, optionally filtering by chapter
  const whereClause: any = {
    type: "TABLE",
  };

  if (targetArg) {
    whereClause.mcq = {
      OR: [
        { chapterId: targetArg },
        { chapter: { nameBn: { contains: targetArg } } },
        { chapter: { nameEn: { contains: targetArg } } },
      ],
    };
  }

  const attachments = await prisma.questionAttachment.findMany({
    where: whereClause,
    include: {
      mcq: {
        include: {
          chapter: true,
          subject: true,
        },
      },
    },
  });

  console.log(`Found ${attachments.length} TABLE attachment(s).`);

  if (attachments.length === 0) {
    console.log("No TABLE attachments found.");
    await prisma.$disconnect();
    process.exit(0);
  }

  // Group by chapter
  const byChapter: Record<string, { chapterName: string; total: number; withCaption: number; sampleCaptions: string[] }> = {};
  for (const att of attachments) {
    const chId = att.mcq?.chapterId || "unknown";
    const chName = att.mcq?.chapter?.nameBn || "Unknown Chapter";
    if (!byChapter[chId]) {
      byChapter[chId] = { chapterName: chName, total: 0, withCaption: 0, sampleCaptions: [] };
    }
    byChapter[chId].total++;
    if (att.caption) {
      byChapter[chId].withCaption++;
      if (byChapter[chId].sampleCaptions.length < 3) {
        byChapter[chId].sampleCaptions.push(att.caption);
      }
    }
  }

  console.log("\nBreakdown by Chapter:");
  for (const [chId, info] of Object.entries(byChapter)) {
    console.log(`- Chapter "${info.chapterName}" (${chId}):`);
    console.log(`  Total TABLE attachments: ${info.total}`);
    console.log(`  With caption text: ${info.withCaption}`);
    if (info.sampleCaptions.length > 0) {
      console.log(`  Sample captions: ${JSON.stringify(info.sampleCaptions)}`);
    }
  }

  // Update attachments: set caption = null
  const idsToUpdate = attachments.filter((a) => a.caption !== null).map((a) => a.id);
  console.log(`\nUpdating ${idsToUpdate.length} attachment(s) to remove caption...`);

  if (idsToUpdate.length > 0) {
    const updateResult = await prisma.questionAttachment.updateMany({
      where: {
        id: { in: idsToUpdate },
      },
      data: {
        caption: null,
      },
    });

    console.log(`✅ Successfully updated ${updateResult.count} attachment(s). Set caption = null.`);
  } else {
    console.log("No captions needed removal (all are already null).");
  }

  await prisma.$disconnect();
  process.exit(0);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

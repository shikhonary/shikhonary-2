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
if (!connectionString) {
  console.error("Database connection string missing!");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("================================================================================");
  console.log("REMOVING TABLE CAPTIONS FOR: Geography and Environment (ভূগোল ও পরিবেশ)");
  console.log("================================================================================\n");

  // 1. Resolve Target Subject
  const targetSubject = await prisma.academicSubject.findFirst({
    where: {
      OR: [
        { id: "cmwrmhge900000gto9rooxt4v" },
        { nameEn: { contains: "Geography and Environment", mode: "insensitive" } },
        { nameBn: { contains: "ভূগোল ও পরিবেশ" } },
      ],
    },
    select: {
      id: true,
      nameBn: true,
      nameEn: true,
    },
  });

  if (!targetSubject) {
    console.error("❌ Geography and Environment subject not found in database!");
    process.exit(1);
  }

  console.log(`Target Subject: ${targetSubject.nameBn} / ${targetSubject.nameEn} (ID: ${targetSubject.id})\n`);

  // 2. Query all TABLE attachments linked to MCQ, CQ, or ShortAnswer for this subject
  const attachments = await prisma.questionAttachment.findMany({
    where: {
      OR: [
        { type: "TABLE" },
        { type: "table" },
        { table: { not: null } },
      ],
      AND: {
        OR: [
          { mcq: { subjectId: targetSubject.id } },
          { cq: { subjectId: targetSubject.id } },
          { shortAnswer: { subjectId: targetSubject.id } },
        ],
      },
    },
    include: {
      mcq: {
        select: {
          id: true,
          question: true,
          chapter: { select: { id: true, nameBn: true, position: true } },
        },
      },
      cq: {
        select: {
          id: true,
          questionA: true,
          chapter: { select: { id: true, nameBn: true, position: true } },
        },
      },
      shortAnswer: {
        select: {
          id: true,
          question: true,
          chapter: { select: { id: true, nameBn: true, position: true } },
        },
      },
    },
  });

  console.log(`Found total ${attachments.length} TABLE attachment(s) in "${targetSubject.nameBn}".`);

  if (attachments.length === 0) {
    console.log("No TABLE attachments found for this subject.");
    return;
  }

  // 3. Categorize and inspect
  let mcqCount = 0;
  let cqCount = 0;
  let saCount = 0;
  let withCaptionCount = 0;

  const chapterStats: Record<string, {
    name: string;
    position: number;
    mcqTables: number;
    cqTables: number;
    saTables: number;
    withCaption: number;
    captionsFound: string[];
  }> = {};

  const idsToUpdate: string[] = [];

  for (const att of attachments) {
    let qType = "UNKNOWN";
    let chapter = { id: "unknown", nameBn: "অজানা অধ্যায়", position: -1 };
    let questionText = "";

    if (att.mcq) {
      qType = "MCQ";
      mcqCount++;
      chapter = att.mcq.chapter || chapter;
      questionText = att.mcq.question;
    } else if (att.cq) {
      qType = "CQ";
      cqCount++;
      chapter = att.cq.chapter || chapter;
      questionText = att.cq.questionA;
    } else if (att.shortAnswer) {
      qType = "ShortAnswer";
      saCount++;
      chapter = att.shortAnswer.chapter || chapter;
      questionText = att.shortAnswer.question;
    }

    if (!chapterStats[chapter.id]) {
      chapterStats[chapter.id] = {
        name: chapter.nameBn,
        position: chapter.position,
        mcqTables: 0,
        cqTables: 0,
        saTables: 0,
        withCaption: 0,
        captionsFound: [],
      };
    }

    if (qType === "MCQ") chapterStats[chapter.id].mcqTables++;
    if (qType === "CQ") chapterStats[chapter.id].cqTables++;
    if (qType === "ShortAnswer") chapterStats[chapter.id].saTables++;

    if (att.caption !== null && att.caption !== undefined && att.caption.trim() !== "") {
      withCaptionCount++;
      chapterStats[chapter.id].withCaption++;
      chapterStats[chapter.id].captionsFound.push(att.caption);
      idsToUpdate.push(att.id);
      console.log(`  - [${qType}] Attachment ID: ${att.id} | Caption: "${att.caption}" | Q: ${questionText.slice(0, 40)}...`);
    }
  }

  console.log("\n--------------------------------------------------------------------------------");
  console.log("SUMMARY BY QUESTION TYPE:");
  console.log(`- MCQ Table Attachments:         ${mcqCount}`);
  console.log(`- CQ Table Attachments:          ${cqCount}`);
  console.log(`- ShortAnswer Table Attachments: ${saCount}`);
  console.log(`- Total Table Attachments:       ${attachments.length}`);
  console.log(`- Attachments with Caption:      ${withCaptionCount}`);
  console.log("--------------------------------------------------------------------------------\n");

  console.log("CHAPTER BREAKDOWN:");
  const sortedChapters = Object.values(chapterStats).sort((a, b) => a.position - b.position);
  for (const ch of sortedChapters) {
    console.log(
      `  [Pos ${ch.position}] ${ch.name}: Total=${ch.mcqTables + ch.cqTables + ch.saTables} (MCQ: ${ch.mcqTables}, CQ: ${ch.cqTables}, SA: ${ch.saTables}) | With Caption: ${ch.withCaption}`
    );
    if (ch.captionsFound.length > 0) {
      console.log(`    Found captions: ${JSON.stringify(ch.captionsFound)}`);
    }
  }

  // 4. Update attachments with non-null caption to null
  if (idsToUpdate.length > 0) {
    console.log(`\nUpdating ${idsToUpdate.length} attachment(s) to set caption = null...`);
    const updateResult = await prisma.questionAttachment.updateMany({
      where: {
        id: { in: idsToUpdate },
      },
      data: {
        caption: null,
      },
    });

    console.log(`✅ Successfully updated ${updateResult.count} attachment(s). All captions are now null!`);
  } else {
    console.log(`\n✅ All ${attachments.length} TABLE attachment(s) for this subject already have caption = null. No update needed!`);
  }

  // 5. Verification step
  const lingeringWithCaption = await prisma.questionAttachment.count({
    where: {
      id: { in: attachments.map((a) => a.id) },
      caption: { not: null },
    },
  });

  console.log(`\nVerification: Lingering non-null captions in this subject = ${lingeringWithCaption}`);
}

main()
  .catch((e) => {
    console.error("Error running script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

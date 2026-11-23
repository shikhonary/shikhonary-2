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

export interface SplitScenarioPart {
  caption: string;
  content: string;
}

export function splitCqContext(content: string): SplitScenarioPart[] | null {
  if (!content) return null;
  const trimmed = content.trim();

  // Match headers like দৃশ্যকল্প-১, চিত্র-১, দৃশ্যপট-১, উদ্দীপক-১
  const headerRegex = /(?:^|[\r\n]+)\s*((?:দৃশ্যকল্প|চিত্র|দৃশ্যপট|উদ্দীপক)\s*[-–:：]?\s*[১-৯\d]+)\s*[:：\-–.]?\s*/gi;
  const matches = [...trimmed.matchAll(headerRegex)];

  if (matches.length < 2) {
    return null;
  }

  const parts: SplitScenarioPart[] = [];

  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i]!;
    const rawCaption = currentMatch[1]!.trim();

    // Standardize caption: "দৃশ্যকল্প-১", "চিত্র-১", etc.
    const normalizedCaption = rawCaption
      .replace(/\s*[-–:：]\s*/g, "-")
      .replace(/\s+/g, "-");

    const startIndex = currentMatch.index! + currentMatch[0].length;
    const endIndex = i + 1 < matches.length ? matches[i + 1]!.index! : trimmed.length;

    let partContent = trimmed.slice(startIndex, endIndex).trim();
    // Clean any leading punctuation or spaces left over
    partContent = partContent.replace(/^[:：\-–.\s]+/, "").trim();

    parts.push({
      caption: normalizedCaption,
      content: partContent,
    });
  }

  return parts;
}

async function main() {
  const isApply = process.argv.includes("--apply");
  const isAllSubjects = process.argv.includes("--all");

  console.log("================================================================================");
  console.log("SPLIT CQ CONTEXT SCENARIOS (দৃশ্যকল্প-১, দৃশ্যকল্প-২ / চিত্র-১, চিত্র-২)");
  console.log(`MODE: ${isApply ? "APPLY (WRITING TO DATABASE)" : "DRY RUN (PASS --apply TO SAVE)"}`);
  console.log("================================================================================\n");

  const whereClause: any = {
    cqId: { not: null },
    content: { not: null },
  };

  if (!isAllSubjects) {
    // Default to Geography and Environment
    whereClause.cq = {
      subject: {
        OR: [
          { id: "cmwrmhge900000gto9rooxt4v" },
          { nameBn: { contains: "ভূগোল ও পরিবেশ" } },
          { nameEn: { contains: "Geography and Environment", mode: "insensitive" } },
        ],
      },
    };
  }

  const attachments = await prisma.questionAttachment.findMany({
    where: whereClause,
    include: {
      cq: {
        include: {
          subject: true,
          chapter: true,
          attachments: true,
        },
      },
    },
  });

  console.log(`Scanning ${attachments.length} CQ attachment(s)...`);

  const candidates: { att: any; parts: SplitScenarioPart[] }[] = [];

  for (const att of attachments) {
    const parts = splitCqContext(att.content!);
    if (parts && parts.length >= 2) {
      candidates.push({ att, parts });
    }
  }

  console.log(`Found ${candidates.length} CQ attachment(s) eligible for splitting.\n`);

  if (candidates.length === 0) {
    console.log("No matching CQ attachments found.");
    return;
  }

  // Summary by chapter
  const chapterBreakdown: Record<string, { name: string; count: number; twoParts: number; threeParts: number }> = {};
  for (const c of candidates) {
    const chName = c.att.cq?.chapter?.nameBn || "Unknown Chapter";
    if (!chapterBreakdown[chName]) {
      chapterBreakdown[chName] = { name: chName, count: 0, twoParts: 0, threeParts: 0 };
    }
    chapterBreakdown[chName].count++;
    if (c.parts.length === 2) chapterBreakdown[chName].twoParts++;
    else chapterBreakdown[chName].threeParts++;
  }

  console.log("Breakdown by Chapter:");
  for (const [name, info] of Object.entries(chapterBreakdown)) {
    console.log(`  - ${name}: ${info.count} CQs (2 parts: ${info.twoParts}, 3+ parts: ${info.threeParts})`);
  }

  console.log("\nSamples of split transformation:");
  candidates.slice(0, 3).forEach((c, idx) => {
    console.log(`\n--- Sample ${idx + 1} (${c.att.cq?.chapter?.nameBn}) [Attachment ID: ${c.att.id}] ---`);
    console.log(`Original Content snippet: ${c.att.content?.slice(0, 80)}...`);
    c.parts.forEach((p, pIdx) => {
      console.log(`  Attachment [${pIdx}]: Caption="${p.caption}" | Content="${p.content.slice(0, 80)}..."`);
    });
  });

  if (!isApply) {
    console.log("\n⚠️  DRY RUN COMPLETED. No changes made. Run with --apply to commit to database.");
    return;
  }

  console.log(`\nApplying splits for ${candidates.length} CQ(s)...`);

  let updatedCount = 0;
  let createdCount = 0;

  for (const c of candidates) {
    const { att, parts } = c;

    // 1. Update the original attachment to be part 0 (position: 0)
    await prisma.questionAttachment.update({
      where: { id: att.id },
      data: {
        caption: parts[0]!.caption,
        content: parts[0]!.content,
        position: 0,
      },
    });
    updatedCount++;

    // 2. Create new attachments for parts 1, 2, ...
    for (let pIdx = 1; pIdx < parts.length; pIdx++) {
      await prisma.questionAttachment.create({
        data: {
          cqId: att.cqId,
          type: att.type || "PASSAGE",
          caption: parts[pIdx]!.caption,
          content: parts[pIdx]!.content,
          position: pIdx,
          table: null,
          bottomContent: null,
          tableBorder: null,
        },
      });
      createdCount++;
    }
  }

  console.log(`\n✅ Finished applying splits!`);
  console.log(`- Updated original attachments: ${updatedCount}`);
  console.log(`- Newly created scenario attachments: ${createdCount}`);
  console.log(`- Total attachments now representing these scenarios: ${updatedCount + createdCount}`);
}

main()
  .catch((e) => {
    console.error("Execution error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { resolve } from "node:path";
import { config } from "dotenv";

const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.ts";

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Database connection string missing!");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const CHAPTERS_INPUT = [
  {
    nameBn: "ব্যবসায় পরিচিতি",
    nameEn: "Introduction to Business"
  },
  {
    nameBn: "ব্যবসায় উদ্যোগ ও উদ্যোক্তা",
    nameEn: "Business Entrepreneurship and Entrepreneur"
  },
  {
    nameBn: "আত্মকর্মসংস্থান",
    nameEn: "Self-Employment"
  },
  {
    nameBn: "মালিকানার ভিত্তিতে ব্যবসায়",
    nameEn: "Business Based on Ownership"
  },
  {
    nameBn: "ব্যবসায়ের আইনগত দিক",
    nameEn: "Legal Aspects of Business"
  },
  {
    nameBn: "ব্যবসায় পরিকল্পনা",
    nameEn: "Business Plan"
  },
  {
    nameBn: "বাংলাদেশের শিল্প",
    nameEn: "Industries of Bangladesh"
  },
  {
    nameBn: "ব্যবসায় প্রতিষ্ঠানের ব্যবস্থাপনা",
    nameEn: "Management of Business Organization"
  },
  {
    nameBn: "বিপণন",
    nameEn: "Marketing"
  },
  {
    nameBn: "ব্যবসায় উদ্যোগ উন্নয়নে সহায়ক সেবা",
    nameEn: "Supportive Services in Developing Business Entrepreneurship"
  },
  {
    nameBn: "ব্যবসায় নৈতিকতা ও সামাজিক দায়িত্ব",
    nameEn: "Business Ethics and Social Responsibility"
  },
  {
    nameBn: "সফল উদ্যোক্তাদের জীবনী থেকে শিক্ষণীয়",
    nameEn: "Lessons from the Lives of Successful Entrepreneurs"
  }
];

async function main() {
  console.log("Searching for Business Enterprise subject in DB...");

  // Search by various name patterns
  const subjects = await prisma.academicSubject.findMany({
    where: {
      OR: [
        { nameEn: { contains: "Business", mode: "insensitive" } },
        { nameEn: { contains: "Enterprise", mode: "insensitive" } },
        { nameEn: { contains: "Entrepreneur", mode: "insensitive" } },
        { nameBn: { contains: "ব্যবসায়" } },
        { nameBn: { contains: "উদ্যোগ" } },
      ],
    },
    include: {
      classSubjects: {
        include: { academicClass: true },
      },
      chapters: {
        orderBy: { position: "asc" },
      },
    },
  });

  console.log(`Found ${subjects.length} subject(s) matching criteria:`);
  for (const s of subjects) {
    const classNames = s.classSubjects
      .map((cs) => `${cs.academicClass.nameBn} (${cs.academicClass.nameEn})`)
      .join(", ");
    console.log(`- ID: ${s.id} | ${s.nameBn} / ${s.nameEn} | Classes: [${classNames}] | Existing chapters: ${s.chapters.length}`);
  }

  // Filter for Class 9/10
  const targetSubject = subjects.find((s) =>
    s.classSubjects.some((cs) => ["Nine", "Ten", "৯ম", "১০ম", "নবম", "দশম"].some(cls => cs.academicClass.nameEn?.includes(cls) || cs.academicClass.nameBn?.includes(cls)))
  ) || subjects[0];

  if (!targetSubject) {
    throw new Error("No Business Enterprise subject found in DB!");
  }

  console.log(`\n🎯 Selected Target Subject: "${targetSubject.nameBn}" / "${targetSubject.nameEn}" (${targetSubject.id})`);

  // Find active academic year
  let academicYear = await prisma.academicYear.findFirst({
    where: { isActive: true },
  });
  if (!academicYear) {
    academicYear = await prisma.academicYear.findFirst();
  }
  const academicYearId = academicYear?.id || null;
  console.log(`Using Academic Year: ${academicYear?.year || "Default"} (${academicYearId})\n`);

  const results = [];

  for (let index = 0; index < CHAPTERS_INPUT.length; index++) {
    const item = CHAPTERS_INPUT[index];

    // Check if chapter already exists by nameBn or position for this subject
    const existing = await prisma.academicChapter.findFirst({
      where: {
        subjectId: targetSubject.id,
        OR: [
          { nameBn: item.nameBn },
          { nameEn: item.nameEn },
          { position: index },
        ],
      },
    });

    if (existing) {
      const updated = await prisma.academicChapter.update({
        where: { id: existing.id },
        data: {
          nameBn: item.nameBn,
          nameEn: item.nameEn,
          position: index,
          isActive: true,
          academicYearId: academicYearId || existing.academicYearId,
        },
      });
      console.log(`[Update] Pos ${index}: "${updated.nameBn}" | "${updated.nameEn}" (${updated.id})`);
      results.push(updated);
    } else {
      const created = await prisma.academicChapter.create({
        data: {
          nameBn: item.nameBn,
          nameEn: item.nameEn,
          position: index,
          subjectId: targetSubject.id,
          academicYearId: academicYearId,
          isActive: true,
        },
      });
      console.log(`[Create] Pos ${index}: "${created.nameBn}" | "${created.nameEn}" (${created.id})`);
      results.push(created);
    }
  }

  console.log(`\n======================================================`);
  console.log(`✅ Business Enterprise Chapter Seeding Complete!`);
  console.log(`Total Chapters Seeded: ${results.length}`);
  console.log(`======================================================\n`);

  const finalChapters = await prisma.academicChapter.findMany({
    where: { subjectId: targetSubject.id },
    orderBy: { position: "asc" },
  });

  console.log("Current Chapters in Database for " + targetSubject.nameBn + ":");
  for (const ch of finalChapters) {
    console.log(`- Pos ${ch.position}: ${ch.nameBn} | ${ch.nameEn} (ID: ${ch.id})`);
  }
}

main()
  .catch((err) => {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

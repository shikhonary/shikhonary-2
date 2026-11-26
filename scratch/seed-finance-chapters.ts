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
    nameBn: "অর্থায়ন ও ব্যবসায় অর্থায়ন",
    nameEn: "Finance and Business Finance",
  },
  {
    nameBn: "অর্থায়নের উৎস",
    nameEn: "Sources of Finance",
  },
  {
    nameBn: "শেয়ার, বন্ড ও ডিবেঞ্চার",
    nameEn: "Share, Bond and Debenture",
  },
  {
    nameBn: "অর্থের সময়মূল্য",
    nameEn: "Time Value of Money",
  },
  {
    nameBn: "ঝুঁকি ও অনিশ্চয়তা",
    nameEn: "Risk and Uncertainty",
  },
  {
    nameBn: "মূলধনি আয়-ব্যয় প্রাক্কলন",
    nameEn: "Capital Budgeting",
  },
  {
    nameBn: "মূলধন ব্যয়",
    nameEn: "Cost of Capital",
  },
  {
    nameBn: "মুদ্রা, ব্যাংক ও ব্যাংকিং",
    nameEn: "Currency, Bank and Banking",
  },
  {
    nameBn: "ব্যাংকিং ব্যবসায় ও তার ধরন",
    nameEn: "Banking Business and Its Types",
  },
  {
    nameBn: "বাণিজ্যিক ব্যাংক",
    nameEn: "Commercial Bank",
  },
  {
    nameBn: "ব্যাংকের আমানত",
    nameEn: "Bank Deposit",
  },
  {
    nameBn: "ব্যাংক ও গ্রাহক",
    nameEn: "Bank and Customer",
  },
  {
    nameBn: "কেন্দ্রীয় ব্যাংক",
    nameEn: "Central Bank",
  },
];

async function main() {
  console.log("Searching for Finance and Banking subject in DB...");

  const subjects = await prisma.academicSubject.findMany({
    where: {
      OR: [
        { nameEn: { contains: "Finance", mode: "insensitive" } },
        { nameEn: { contains: "Banking", mode: "insensitive" } },
        { nameBn: { contains: "ফিন্যান্স" } },
        { nameBn: { contains: "ব্যাংকিং" } },
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
    s.classSubjects.some((cs) =>
      ["Nine", "Ten", "৯ম", "১০ম", "নবম", "দশম"].some(
        (cls) => cs.academicClass.nameEn?.includes(cls) || cs.academicClass.nameBn?.includes(cls)
      )
    )
  ) || subjects[0];

  if (!targetSubject) {
    throw new Error("No Finance and Banking subject found in DB!");
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
    const item = CHAPTERS_INPUT[index]!;

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
  console.log(`✅ Finance and Banking Chapter Seeding Complete!`);
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

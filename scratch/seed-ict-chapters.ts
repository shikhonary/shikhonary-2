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
    nameBn: "তথ্য ও যোগাযোগ প্রযুক্তি ও আমাদের বাংলাদেশ",
    nameEn: "Information and Communication Technology and Our Bangladesh",
  },
  {
    nameBn: "কম্পিউটার রক্ষণাবেক্ষণ ও সাইবার নিরাপত্তা",
    nameEn: "Computer Maintenance and Cyber Security",
  },
  {
    nameBn: "ইন্টারনেট ও ওয়েব পরিচিতি",
    nameEn: "Introduction to Internet and Web",
  },
  {
    nameBn: "আমার লেখালেখি ও হিসাব",
    nameEn: "My Writing and Accounting",
  },
  {
    nameBn: "মাল্টিমিডিয়া ও গ্রাফিক্স",
    nameEn: "Multimedia and Graphics",
  },
  {
    nameBn: "প্রোগ্রামিংয়ের মাধ্যমে সমস্যার সমাধান",
    nameEn: "Problem Solving through Programming",
  },
];

async function seedIctChapters() {
  console.log("Searching for Class 9-10 ICT Subject in DB...");

  const subject = await prisma.academicSubject.findFirst({
    where: {
      nameBn: "তথ্য ও যোগাযোগ প্রযুক্তি",
      classSubjects: {
        some: {
          academicClass: {
            nameEn: { in: ["Nine", "Ten"] },
          },
        },
      },
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

  if (!subject) {
    throw new Error("Class 9-10 Information and Communication Technology subject not found in DB!");
  }

  console.log(`\nFound Target Subject: "${subject.nameBn}" / "${subject.nameEn}" (${subject.id})`);
  console.log(
    `Associated Classes: ${subject.classSubjects
      .map((cs) => `${cs.academicClass.nameBn} (${cs.academicClass.nameEn})`)
      .join(", ")}`
  );
  console.log(`Existing chapters count: ${subject.chapters.length}`);

  // Find active academic year
  let academicYear = await prisma.academicYear.findFirst({
    where: { isActive: true },
  });
  if (!academicYear) {
    academicYear = await prisma.academicYear.findFirst();
  }
  const academicYearId = academicYear?.id || null;
  console.log(`Using Academic Year: ${academicYear?.year || "Default"} (${academicYearId})`);

  const results = [];

  for (let index = 0; index < CHAPTERS_INPUT.length; index++) {
    const item = CHAPTERS_INPUT[index];

    // Check if chapter already exists by nameBn or position for this subject
    const existing = await prisma.academicChapter.findFirst({
      where: {
        subjectId: subject.id,
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
      console.log(`[Update] Pos ${index}: "${updated.nameBn}" (${updated.id})`);
      results.push(updated);
    } else {
      const created = await prisma.academicChapter.create({
        data: {
          nameBn: item.nameBn,
          nameEn: item.nameEn,
          position: index,
          subjectId: subject.id,
          academicYearId: academicYearId,
          isActive: true,
        },
      });
      console.log(`[Create] Pos ${index}: "${created.nameBn}" (${created.id})`);
      results.push(created);
    }
  }

  console.log(`\n======================================================`);
  console.log(`✅ Chapter Seeding Complete!`);
  console.log(`Total Chapters Seeded: ${results.length}`);
  console.log(`======================================================\n`);

  const finalChapters = await prisma.academicChapter.findMany({
    where: { subjectId: subject.id },
    orderBy: { position: "asc" },
  });

  console.log("Current Chapters in Database:");
  for (const ch of finalChapters) {
    console.log(`- Pos ${ch.position}: ${ch.nameBn} | ${ch.nameEn} (ID: ${ch.id})`);
  }
}

seedIctChapters()
  .catch((err) => {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

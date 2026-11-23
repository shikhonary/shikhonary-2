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
    "nameBn": "ভূগোল ও পরিবেশ",
    "nameEn": "Geography and Environment"
  },
  {
    "nameBn": "মহাবিশ্ব ও আমাদের পৃথিবী",
    "nameEn": "The Universe and Our Earth"
  },
  {
    "nameBn": "মানচিত্র পঠন ও ব্যবহার",
    "nameEn": "Map Reading and Uses"
  },
  {
    "nameBn": "পৃথিবীর অভ্যন্তরীণ ও বাহ্যিক গঠন",
    "nameEn": "Internal and External Structure of the Earth"
  },
  {
    "nameBn": "বায়ুমণ্ডল",
    "nameEn": "Atmosphere"
  },
  {
    "nameBn": "বারিমণ্ডল",
    "nameEn": "Hydrosphere"
  },
  {
    "nameBn": "জনসংখ্যা",
    "nameEn": "Population"
  },
  {
    "nameBn": "মানববসতি",
    "nameEn": "Human Settlements"
  },
  {
    "nameBn": "সম্পদ ও অর্থনৈতিক কার্যাবলি",
    "nameEn": "Resources and Economic Activities"
  },
  {
    "nameBn": "বাংলাদেশের ভৌগোলিক বিবরণ",
    "nameEn": "Geographical Description of Bangladesh"
  },
  {
    "nameBn": "বাংলাদেশের সম্পদ ও শিল্প",
    "nameEn": "Resources and Industries of Bangladesh"
  },
  {
    "nameBn": "বাংলাদেশের যোগাযোগ ব্যবস্থা ও বাণিজ্য",
    "nameEn": "Communication System and Trade of Bangladesh"
  },
  {
    "nameBn": "বাংলাদেশের উন্নয়ন কর্মকাণ্ড ও পরিবেশের ভারসাম্য",
    "nameEn": "Development Activities of Bangladesh and Environmental Balance"
  },
  {
    "nameBn": "বাংলাদেশের প্রাকৃতিক দুর্যোগ",
    "nameEn": "Natural Disasters of Bangladesh"
  },
  {
    "nameBn": "টেকসই উন্নয়ন অভীষ্ট (এসডিজি)",
    "nameEn": "Sustainable Development Goals (SDG)"
  }
];

async function main() {
  console.log("Searching for Geography and Environment subject in DB...");

  // Search by name patterns
  const subjects = await prisma.academicSubject.findMany({
    where: {
      OR: [
        { nameEn: { contains: "Geography", mode: "insensitive" } },
        { nameBn: { contains: "ভূগোল" } },
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
    throw new Error("No Geography and Environment subject found in DB!");
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
  console.log(`✅ Geography and Environment Chapter Seeding Complete!`);
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

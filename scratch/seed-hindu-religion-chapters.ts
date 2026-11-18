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

const SUBJECT_ID = "cmwlwqwgs00006ktoljgru49h";
const ACADEMIC_YEAR_ID = "cmtr3jj2g0000p4tyvwaxsntl";

const CHAPTERS_DATA = [
  {
    nameBn: "স্রষ্টা, সৃষ্টি ও তাঁর উপাসনা",
    nameEn: "Creator, Creation and His Worship",
  },
  {
    nameBn: "হিন্দুধর্মের উদ্ভব ও ক্রমবিকাশ",
    nameEn: "Origin and Evolution of Hinduism",
  },
  {
    nameBn: "হিন্দুধর্মের বৈশিষ্ট্য",
    nameEn: "Characteristics of Hinduism",
  },
  {
    nameBn: "হিন্দুধর্মীয় আচার- অনুষ্ঠান",
    nameEn: "Hindu Religious Rituals and Ceremonies",
  },
  {
    nameBn: "হিন্দুধর্মে সংস্কার",
    nameEn: "Sacraments (Samskaras) in Hinduism",
  },
  {
    nameBn: "দেব-দেবী ও পূজা",
    nameEn: "Deities and Worship",
  },
  {
    nameBn: "যোগসাধনা",
    nameEn: "Yoga Practice",
  },
  {
    nameBn: "ধর্মগ্রন্থে নৈতিক শিক্ষা",
    "nameEn": "Moral Teachings in Religious Scriptures",
  },
  {
    nameBn: "ধর্মীয় উপাখ্যান ও নৈতিক শিক্ষা",
    nameEn: "Religious Stories and Moral Teachings",
  },
  {
    nameBn: "ধর্মপথ ও আদর্শ জীবন",
    nameEn: "Path of Dharma and Ideal Life",
  },
  {
    nameBn: "অবতার ও আদর্শ জীবনচরিত",
    nameEn: "Incarnations and Ideal Biographies",
  },
  {
    nameBn: "পরিশিষ্ট: সংস্কৃত মন্ত্র উচ্চারণ বিধি",
    nameEn: "Appendix: Rules for Pronunciation of Sanskrit Mantras",
  },
];

async function seedChapters() {
  console.log(`Starting chapter seed for Subject ID: ${SUBJECT_ID}...`);

  const subject = await prisma.academicSubject.findUnique({
    where: { id: SUBJECT_ID },
    include: {
      classSubjects: {
        include: { academicClass: true },
      },
    },
  });

  if (!subject) {
    throw new Error(`Subject with ID ${SUBJECT_ID} not found.`);
  }

  console.log(`Found Subject: "${subject.nameBn}" (${subject.nameEn})`);
  console.log(
    `Associated Classes: ${subject.classSubjects
      .map((cs) => `${cs.academicClass.nameBn} (${cs.academicClass.nameEn})`)
      .join(", ")}`
  );

  const results = [];

  for (let index = 0; index < CHAPTERS_DATA.length; index++) {
    const item = CHAPTERS_DATA[index];
    
    // Check if chapter already exists by nameBn or position for this subject
    const existing = await prisma.academicChapter.findFirst({
      where: {
        subjectId: SUBJECT_ID,
        OR: [
          { nameBn: item.nameBn },
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
          academicYearId: ACADEMIC_YEAR_ID,
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
          subjectId: SUBJECT_ID,
          academicYearId: ACADEMIC_YEAR_ID,
          isActive: true,
        },
      });
      console.log(`[Create] Pos ${index}: "${created.nameBn}" (${created.id})`);
      results.push(created);
    }
  }

  console.log(`\nSuccessfully seeded ${results.length} chapters for "${subject.nameBn}".`);
}

seedChapters()
  .catch((err) => {
    console.error("Error seeding chapters:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

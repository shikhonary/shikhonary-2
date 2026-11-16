import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.js";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "packages/db/.env") });

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Database connection string missing!");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const chaptersData = [
  {
    nameBn: "পূর্ব বাংলার আন্দোলন ও জাতীয়তাবাদের উত্থান (১৯৪৭-১৯৭০)",
    nameEng: "The Movement of East Bengal and the Rise of Nationalism (1947-1970)"
  },
  {
    nameBn: "বাংলাদেশের স্বাধীনতা",
    nameEng: "Independence of Bangladesh"
  },
  {
    nameBn: "সৌরজগৎ ও ভূমণ্ডল",
    nameEng: "The Solar System and the Earth"
  },
  {
    nameBn: "বাংলাদেশের ভূপ্রকৃতি ও জলবায়ু",
    nameEng: "Physical Geography and Climate of Bangladesh"
  },
  {
    nameBn: "বাংলাদেশের নদ-নদী ও প্রাকৃতিক সম্পদ",
    nameEng: "Rivers and Natural Resources of Bangladesh"
  },
  {
    nameBn: "রাষ্ট্র, নাগরিকতা ও আইন",
    nameEng: "State, Citizenship and Law"
  },
  {
    nameBn: "বাংলাদেশ সরকারের বিভিন্ন অঙ্গ ও প্রশাসন ব্যবস্থা",
    nameEng: "Different Organs of Bangladesh Government and Administrative System"
  },
  {
    nameBn: "বাংলাদেশের গণতন্ত্র ও নির্বাচন ব্যবস্থা",
    nameEng: "Democracy and Election System of Bangladesh"
  },
  {
    nameBn: "জাতিসংঘ ও বাংলাদেশ",
    nameEng: "The United Nations and Bangladesh"
  },
  {
    nameBn: "জাতীয় সম্পদ ও অর্থনৈতিক ব্যবস্থা",
    nameEng: "National Resources and Economic System"
  },
  {
    nameBn: "অর্থনৈতিক নির্দেশকসমূহ ও বাংলাদেশের অর্থনীতির প্রকৃতি",
    nameEng: "Economic Indicators and Nature of Bangladesh Economy"
  },
  {
    nameBn: "বাংলাদেশ সরকারের অর্থ ও ব্যাংক ব্যবস্থা",
    nameEng: "Finance and Banking System of Bangladesh Government"
  },
  {
    nameBn: "বাংলাদেশের পরিবার কাঠামো ও সামাজিকীকরণ",
    nameEng: "Family Structure and Socialization in Bangladesh"
  },
  {
    nameBn: "বাংলাদেশের সামাজিক পরিবর্তন",
    nameEng: "Social Change in Bangladesh"
  },
  {
    nameBn: "বাংলাদেশের সামাজিক সমস্যা ও প্রতিকার",
    nameEng: "Social Problems of Bangladesh and Their Remedies"
  }
];

async function seed() {
  console.log("🚀 Starting BGS chapter seeding for Class 9 and 10...\n");

  // 1. Target Subject: Bangladesh & Global Studies for Class 9/10
  const targetSubject = await prisma.academicSubject.findFirst({
    where: {
      id: "cmwhp8esd000k90ej2lltgpcq"
    },
    include: {
      classSubjects: {
        include: {
          academicClass: true
        }
      }
    }
  });

  if (!targetSubject) {
    throw new Error("Could not find Bangladesh and Global Studies subject for Class 9/10 (cmwhp8esd000k90ej2lltgpcq)!");
  }

  console.log(`Target Subject: "${targetSubject.nameBn}" / "${targetSubject.nameEn}" [ID: ${targetSubject.id}]`);
  console.log(`Linked Classes: ${targetSubject.classSubjects.map((cs) => `${cs.academicClass.nameEn} (${cs.academicClass.nameBn})`).join(", ")}`);
  console.log(`Academic Year ID: ${targetSubject.academicYearId}\n`);

  // 2. Seed chapters using index as position (0-based)
  console.log("Seeding chapters with index as position (0-based):");
  const seededChapters = [];

  for (let index = 0; index < chaptersData.length; index++) {
    const item = chaptersData[index]!;
    const nameBn = item.nameBn.trim();
    const nameEn = item.nameEng.trim();

    const chapter = await prisma.academicChapter.upsert({
      where: {
        subjectId_position: {
          subjectId: targetSubject.id,
          position: index,
        },
      },
      update: {
        nameBn,
        nameEn,
        academicYearId: targetSubject.academicYearId,
        isActive: true,
      },
      create: {
        subjectId: targetSubject.id,
        position: index,
        nameBn,
        nameEn,
        academicYearId: targetSubject.academicYearId,
        isActive: true,
      },
    });

    console.log(`  [Pos: ${String(index).padStart(2, " ")}] ${chapter.nameBn} | ${chapter.nameEn} (ID: ${chapter.id})`);
    seededChapters.push(chapter);
  }

  console.log(`\n✔ Successfully seeded ${seededChapters.length} chapters for "${targetSubject.nameBn}" (${targetSubject.nameEn})!`);
}

seed()
  .catch((err) => {
    console.error("✖ Seeding error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

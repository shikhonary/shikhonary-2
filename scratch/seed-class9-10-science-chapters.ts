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
    "nameBn": "উন্নততর জীবনধারা",
    "nameEn": "Advanced Lifestyle"
  },
  {
    "nameBn": "জীবনের জন্য পানি",
    "nameEn": "Water for Life"
  },
  {
    "nameBn": "হৃদযন্ত্রের যত কথা এবং অন্যান্য",
    "nameEn": "All About the Heart and Others"
  },
  {
    "nameBn": "নবজীবনের সূচনা",
    "nameEn": "Start of a New Life"
  },
  {
    "nameBn": "দেখতে হলে আলো চাই",
    "nameEn": "Light is Needed to See"
  },
  {
    "nameBn": "পলিমার",
    "nameEn": "Polymer"
  },
  {
    "nameBn": "অম্ল, ক্ষারক ও লবণের ব্যবহার",
    "nameEn": "Uses of Acids, Bases and Salts"
  },
  {
    "nameBn": "আমাদের সম্পদ",
    "nameEn": "Our Resources"
  },
  {
    "nameBn": "দুর্যোগের সাথে বসবাস",
    "nameEn": "Living with Disasters"
  },
  {
    "nameBn": "এসো বলকে জানি",
    "nameEn": "Let's Know Force"
  },
  {
    "nameBn": "প্রাত্যহিক জীবনে তড়িৎ",
    "nameEn": "Electricity in Daily Life"
  }
];

async function seed() {
  console.log("Starting Science chapter seeding for Class 9 and 10...\n");

  // 1. Get current academic year
  const academicYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true, isActive: true },
  });
  if (!academicYear) {
    throw new Error("No current active AcademicYear found.");
  }
  console.log(`Current Academic Year: ${academicYear.nameEn} (${academicYear.id})`);

  // 2. Get Class 9 and Class 10
  const classNine = await prisma.academicClass.findFirst({
    where: { OR: [{ nameEn: "Nine" }, { nameBn: "নবম" }] },
  });
  const classTen = await prisma.academicClass.findFirst({
    where: { OR: [{ nameEn: "Ten" }, { nameBn: "দশম" }] },
  });

  if (!classNine || !classTen) {
    throw new Error(`Classes not found. Nine: ${classNine?.id}, Ten: ${classTen?.id}`);
  }
  console.log(`Class Nine: ${classNine.nameEn} (${classNine.id}), Class Ten: ${classTen.nameEn} (${classTen.id})`);

  // 3. Find or create Science subject
  let scienceSubject = await prisma.academicSubject.findFirst({
    where: {
      OR: [
        { nameEn: "Science", academicYearId: academicYear.id },
        { nameBn: "বিজ্ঞান", academicYearId: academicYear.id },
      ],
      classSubjects: {
        some: {
          classId: { in: [classNine.id, classTen.id] },
        },
      },
    },
    include: {
      classSubjects: true,
    },
  });

  if (!scienceSubject) {
    console.log("Science subject not found for Class 9/10. Creating it...");
    scienceSubject = await prisma.academicSubject.create({
      data: {
        nameBn: "বিজ্ঞান",
        nameEn: "Science",
        group: "General",
        academicYearId: academicYear.id,
        isActive: true,
        classSubjects: {
          create: [
            { classId: classNine.id, position: 2 },
            { classId: classTen.id, position: 2 },
          ],
        },
      },
      include: {
        classSubjects: true,
      },
    });
    console.log(`Created Science subject: ${scienceSubject.id}`);
  } else {
    console.log(`Found existing Science subject: "${scienceSubject.nameBn}" / "${scienceSubject.nameEn}" (${scienceSubject.id})`);
    
    // Ensure both classes are linked
    const linkedClassIds = new Set(scienceSubject.classSubjects.map((cs) => cs.classId));
    for (const cls of [classNine, classTen]) {
      if (!linkedClassIds.has(cls.id)) {
        console.log(`Linking subject to class ${cls.nameEn}...`);
        await prisma.academicClassSubject.create({
          data: {
            classId: cls.id,
            subjectId: scienceSubject.id,
            position: 2,
          },
        });
      }
    }
  }

  // 4. Seed chapters using index as position
  console.log("\nSeeding chapters with index as position (0-based):");
  const seededChapters = [];

  for (let index = 0; index < chaptersData.length; index++) {
    const item = chaptersData[index];
    const chapter = await prisma.academicChapter.upsert({
      where: {
        subjectId_position: {
          subjectId: scienceSubject.id,
          position: index,
        },
      },
      update: {
        nameBn: item.nameBn.trim(),
        nameEn: item.nameEn.trim(),
        academicYearId: academicYear.id,
        isActive: true,
      },
      create: {
        subjectId: scienceSubject.id,
        position: index,
        nameBn: item.nameBn.trim(),
        nameEn: item.nameEn.trim(),
        academicYearId: academicYear.id,
        isActive: true,
      },
    });

    console.log(`[Index/Pos: ${index}] "${chapter.nameBn}" / "${chapter.nameEn}" (ID: ${chapter.id})`);
    seededChapters.push(chapter);
  }

  console.log(`\nSuccessfully seeded ${seededChapters.length} chapters for Science subject!`);
}

seed()
  .catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

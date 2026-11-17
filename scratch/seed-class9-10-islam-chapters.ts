import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.ts";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "packages/db/.env") });

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Database connection string missing!");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const rawData = [
  {
    nameBn: "প্রথম অধ্যায় : আকাইদ",
    nameEn: "Chapter One: Aqaid"
  },
  {
    nameBn: "দ্বিতীয় অধ্যায় : ইসলামি শরিয়তের উৎস",
    nameEn: "Chapter Two: Sources of Islamic Shariah"
  },
  {
    nameBn: "তৃতীয় অধ্যায় : ইবাদত",
    nameEn: "Chapter Three: Ibadah"
  },
  {
    nameBn: "চতুর্থ অধ্যায় : আখলাক",
    nameEn: "Chapter Four: Akhlaq"
  },
  {
    nameBn: "পঞ্চম অধ্যায় : আদর্শ জীবনচরিত",
    nameEn: "Chapter Five: Ideal Biographies"
  }
];

function cleanTitleBn(title: string): string {
  return title
    .replace(/^(?:[০-৯\d]+|প্রথম|দ্বিতীয়|দ্বিতীয়|তৃতীয়|তৃতীয়|চতুর্থ|পঞ্চম|ষষ্ঠ|সপ্তম|অষ্টম|নবম|দশম|একাদশ|দ্বাদশ|\d+ম|\d+য়|\d+র্থ|\d+ষ্ঠ|\d+তম)\s*(?:অধ্যায়|অধ্যায়|অধ্যায়ঃ|অধ্যায়ঃ)\s*[:：\-–.]\s*/i, "")
    .trim();
}

function cleanTitleEn(title: string): string {
  return title
    .replace(/^Chapter\s+(?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|\d+)\s*[:：\-–.]\s*/i, "")
    .trim();
}

async function seed() {
  console.log("🚀 Starting Islam & Moral Education chapter seeding for Class 9 and 10...\n");

  // 1. Target Subject: Islam and Moral Education for Class 9/10
  const targetSubject = await prisma.academicSubject.findFirst({
    where: {
      id: "cmwkmnqz40000qotob85ecmnp"
    },
    include: {
      classSubjects: {
        include: {
          academicClass: true
        }
      },
      chapters: {
        orderBy: { position: "asc" }
      }
    }
  });

  if (!targetSubject) {
    throw new Error("Could not find Islam and Moral Education subject for Class 9/10 (cmwkmnqz40000qotob85ecmnp)!");
  }

  console.log(`Target Subject: "${targetSubject.nameBn}" / "${targetSubject.nameEn}" [ID: ${targetSubject.id}]`);
  console.log(`Linked Classes: ${targetSubject.classSubjects.map((cs) => `${cs.academicClass.nameEn} (${cs.academicClass.nameBn})`).join(", ")}`);
  console.log(`Academic Year ID: ${targetSubject.academicYearId}`);
  console.log(`Existing Chapters in Subject: ${targetSubject.chapters.length}\n`);

  const seededChapters = [];

  for (let index = 0; index < rawData.length; index++) {
    const item = rawData[index]!;
    const nameBn = cleanTitleBn(item.nameBn);
    const nameEn = cleanTitleEn(item.nameEn);

    console.log(`Processing [Position: ${index}]:`);
    console.log(`  Raw BN: "${item.nameBn}" -> Cleaned BN: "${nameBn}"`);
    console.log(`  Raw EN: "${item.nameEn}" -> Cleaned EN: "${nameEn}"`);

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

    seededChapters.push(chapter);
    console.log(`  ✔ Chapter ID: ${chapter.id}\n`);
  }

  console.log(`\n🎉 Successfully seeded ${seededChapters.length} chapters for "${targetSubject.nameBn}" (${targetSubject.nameEn})!`);
}

seed()
  .catch((err) => {
    console.error("✖ Seeding error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

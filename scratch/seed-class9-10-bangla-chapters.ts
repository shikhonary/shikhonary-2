import { resolve } from "node:path";
import { config } from "dotenv";
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "packages/db/.env") });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.ts";

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Database connection string missing!");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const rawData = [
  {
    category: "গদ্য (Prose)",
    chapters: [
      { bengali_name: "প্রত্যুপকার", english_name: "Reciprocation (Protyupokar)" },
      { bengali_name: "ফুলের বিবাহ", english_name: "The Marriage of Flowers (Phuler Bibaho)" },
      { bengali_name: "সুভা", english_name: "Shubha" },
      { bengali_name: "লাইব্রেরি", english_name: "Library" },
      { bengali_name: "বই পড়া", english_name: "Reading Books (Boi Pora)" },
      { bengali_name: "অভাগীর স্বর্গ", english_name: "The Heaven of Abhagi (Obhagir Sworgo)" },
      { bengali_name: "নিরীহ বাঙালি", english_name: "The Harmless Bengali (Niriho Bangali)" },
      { bengali_name: "পল্লিসাহিত্য", english_name: "Folk Literature (Polli Sahitto)" },
      { bengali_name: "উদ্যম ও পরিশ্রম", english_name: "Initiative and Hard Work (Uddom O Porishrom)" },
      { bengali_name: "জীবনে শিল্পের স্থান", english_name: "The Place of Art in Life (Jibone Shilpor Sthan)" },
      { bengali_name: "আম-আঁটির ভেঁপু", english_name: "The Mango-Kernel Whistle (Aam-Antir Bhepu)" },
      { bengali_name: "মানুষ মুহম্মদ (স.)", english_name: "Prophet Muhammad (pbuh) as a Man (Manush Muhammad)" },
      { bengali_name: "উপেক্ষিত শক্তির উদ্বোধন", english_name: "The Awakening of the Ignored Power (Upekshito Shaktir Udbodhon)" },
      { bengali_name: "নিমগাছ", english_name: "The Neem Tree (Nimgaach)" },
      { bengali_name: "শিক্ষা ও মনুষ্যত্ব", english_name: "Education and Humanity (Shikkha O Monushottho)" },
      { bengali_name: "প্রবাস বন্ধু", english_name: "Friend in Exile (Probas Bondhu)" },
      { bengali_name: "মমতাদি", english_name: "Mamatadi" },
      { bengali_name: "বনমানুষ", english_name: "The Wild Man (Bonmanush)" },
      { bengali_name: "একাত্তরের দিনগুলি", english_name: "Days of '71 (Ekattorer Dinguli)" },
      { bengali_name: "স্বাধীনতা আমার স্বাধীনতা", english_name: "Freedom, My Freedom (Shadhinota Amar Shadhinota)" },
      { bengali_name: "একুশের গল্প", english_name: "Story of the Twenty-First (Ekusher Golpo)" },
      { bengali_name: "আমাদের সংস্কৃতি", english_name: "Our Culture (Amader Shongskriti)" },
      { bengali_name: "সাহিত্যের রূপ ও রীতি", english_name: "Forms and Styles of Literature (Sahitter Roop O Riti)" },
      { bengali_name: "বাঙলা শব্দ", english_name: "Bengali Words (Bangla Shobdo)" },
      { bengali_name: "আমাদের নতুন গৌরবগাথা", english_name: "Our New Tale of Glory (Amader Notun Gourobgatha)" }
    ]
  },
  {
    category: "কবিতা (Poetry)",
    chapters: [
      { bengali_name: "বন্দনা", english_name: "Adoration (Bondona)" },
      { bengali_name: "হাম্দ্", english_name: "Praise to God (Hamd)" },
      { bengali_name: "বঙ্গবাণী", english_name: "Bengali Language (Bongobani)" },
      { bengali_name: "কপোতাক্ষ নদ", english_name: "The Kopotakkho River (Kopotakkho Nod)" },
      { bengali_name: "জীবন-সঙ্গীত", english_name: "Song of Life (Jibon-Songgit)" },
      { bengali_name: "প্রাণ", english_name: "Life (Proan)" },
      { bengali_name: "জুতা-আবিষ্কার", english_name: "The Invention of Shoes (Juta-Abishkar)" },
      { bengali_name: "অন্ধবধূ", english_name: "The Blind Bride (Ondho Bodhu)" },
      { bengali_name: "ঝরনার গান", english_name: "Song of the Waterfall (Jhornar Gan)" },
      { bengali_name: "ছায়াবাজি", english_name: "Shadow Play (Chhayabaji)" },
      { bengali_name: "জীবন বিনিময়", english_name: "Exchange of Life (Jibon Binimoy)" },
      { bengali_name: "মানুষ", english_name: "Human Being (Manush)" },
      { bengali_name: "উমর ফারুক", english_name: "Umar Farooq" },
      { bengali_name: "সেইদিন এই মাঠ", english_name: "That Day, This Field (Seidin Ei Math)" },
      { bengali_name: "যাব আমি তোমার দেশে", english_name: "I Will Go to Your Country (Jabo Ami Tomar Deshe)" },
      { bengali_name: "একটি কাফি", english_name: "A Kafi (Ekti Kafi)" },
      { bengali_name: "আমার দেশ", english_name: "My Country (Amar Desh)" },
      { bengali_name: "আমি কোনো আগন্তুক নই", english_name: "I Am No Stranger (Ami Kono Agontuk Noi)" },
      { bengali_name: "বৃষ্টি", english_name: "Rain (Brishti)" },
      { bengali_name: "মে-দিনের কবিতা", english_name: "Poem of May Day (May-Diner Kobita)" },
      { bengali_name: "আশা", english_name: "Hope (Asha)" },
      { bengali_name: "পোস্টার", english_name: "Poster" },
      { bengali_name: "রানার", english_name: "The Runner" },
      { bengali_name: "তোমাকে পাওয়ার জন্যে, হে স্বাধীনতা", english_name: "To Gain You, O Freedom (Tomake Paowar Jonne, He Shadhinota)" },
      { bengali_name: "অবাক সূর্যোদয়", english_name: "Astonishing Sunrise (Obak Suryoday)" },
      { bengali_name: "বোশেখ", english_name: "Boishakh" },
      { bengali_name: "চুনিয়া আমার আর্কেডিয়া", english_name: "Chunia Is My Arcadia (Chunia Amar Arcadia)" },
      { bengali_name: "মিছিল", english_name: "Procession (Michhil)" }
    ]
  }
];

async function seed() {
  const subjectId = "cmvwfj8h30002twejxun6c8eg"; // বাংলা ১ম পত্র (Class Nine, Ten)
  const subject = await prisma.academicSubject.findUnique({
    where: { id: subjectId }
  });

  if (!subject) {
    throw new Error(`Subject with ID ${subjectId} not found.`);
  }

  console.log(`Target Subject: "${subject.nameBn}" / "${subject.nameEn}" (${subject.id})`);

  let position = 1;
  const createdChapters: any[] = [];

  for (const cat of rawData) {
    console.log(`\n--- Seeding Category: ${cat.category} ---`);
    for (const ch of cat.chapters) {
      const chapter = await prisma.academicChapter.upsert({
        where: {
          subjectId_position: {
            subjectId,
            position
          }
        },
        update: {
          nameBn: ch.bengali_name.trim(),
          nameEn: ch.english_name.trim(),
          isActive: true,
          academicYearId: subject.academicYearId
        },
        create: {
          subjectId,
          nameBn: ch.bengali_name.trim(),
          nameEn: ch.english_name.trim(),
          position,
          isActive: true,
          academicYearId: subject.academicYearId
        }
      });

      console.log(`[Pos ${String(position).padStart(2, " ")}] [${cat.category.split(" ")[0]}] ${chapter.nameBn} (${chapter.nameEn}) -> ID: ${chapter.id}`);
      createdChapters.push(chapter);
      position++;
    }
  }

  console.log(`\nSuccessfully seeded ${createdChapters.length} chapters for Class 9/10 "${subject.nameBn}"!`);
}

seed()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

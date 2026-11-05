import { resolve } from "node:path"
import { config } from "dotenv"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/main/client"

config({ path: resolve(process.cwd(), ".env") })
config({ path: resolve(process.cwd(), "packages/db/.env") })
config()

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error("ERROR: MAIN_DATABASE_URL or DATABASE_URL is not set.")
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export const CHAPTERS_DATA: { nameBn: string; nameEn: string }[] = [
  {
    nameBn: "ভাষা ও বাংলা ভাষা",
    nameEn: "Language and Bangla Language",
  },
  {
    nameBn: "বাংলা ব্যাকরণ",
    nameEn: "Bangla Grammar",
  },
  {
    nameBn: "বাংলা ভাষার রীতি ও বিভাজন",
    nameEn: "Forms and Classification of Bangla Language",
  },
  {
    nameBn: "বাগযন্ত্র",
    nameEn: "Vocal Organs (Speech Organs)",
  },
  {
    nameBn: "ধ্বনি ও বর্ণ",
    nameEn: "Sound and Letter",
  },
  {
    nameBn: "স্বরধ্বনি",
    nameEn: "Vowel Sound",
  },
  {
    nameBn: "ব্যঞ্জনধ্বনি",
    nameEn: "Consonant Sound",
  },
  {
    nameBn: "বর্ণের উচ্চারণ",
    nameEn: "Pronunciation of Letters",
  },
  {
    nameBn: "শব্দ ও পদের গঠন",
    nameEn: "Formation of Words and Parts of Speech",
  },
  {
    nameBn: "উপসর্গ দিয়ে শব্দ গঠন",
    nameEn: "Word Formation using Prefixes",
  },
  {
    nameBn: "প্রত্যয় দিয়ে শব্দ গঠন",
    nameEn: "Word Formation using Suffixes",
  },
  {
    nameBn: "সমাস প্রক্রিয়ায় শব্দ গঠন",
    nameEn: "Word Formation through Compounding (Samas)",
  },
  {
    nameBn: "সন্ধি",
    nameEn: "Euphonic Combination (Sandhi)",
  },
  {
    nameBn: "শব্দদ্বিত্ব",
    nameEn: "Reduplication of Words",
  },
  {
    nameBn: "নরবাচক ও নারীবাচক শব্দ",
    nameEn: "Masculine and Feminine Words",
  },
  {
    nameBn: "সংখ্যাবাচক শব্দ",
    nameEn: "Numeral Words",
  },
  {
    nameBn: "শব্দের শ্রেণিবিভাগ",
    nameEn: "Classification of Words",
  },
  {
    nameBn: "বিশেষ্য",
    nameEn: "Noun",
  },
  {
    nameBn: "সর্বনাম",
    nameEn: "Pronoun",
  },
  {
    nameBn: "বিশেষণ",
    nameEn: "Adjective",
  },
  {
    nameBn: "ক্রিয়া",
    nameEn: "Verb",
  },
  {
    nameBn: "ক্রিয়াবিশেষণ",
    nameEn: "Adverb",
  },
  {
    nameBn: "অনুসর্গ",
    nameEn: "Postposition",
  },
  {
    nameBn: "যোজক",
    nameEn: "Conjunction (Connector)",
  },
  {
    nameBn: "আবেগ",
    nameEn: "Interjection",
  },
  {
    nameBn: "নির্দেশক",
    nameEn: "Determiner",
  },
  {
    nameBn: "বচন",
    nameEn: "Grammatical Number",
  },
  {
    nameBn: "বিভক্তি",
    nameEn: "Inflection / Case Ending",
  },
  {
    nameBn: "ক্রিয়াবিভক্তি",
    nameEn: "Verbal Inflection",
  },
  {
    nameBn: "ক্রিয়ার কাল",
    nameEn: "Tense of Verb",
  },
  {
    nameBn: "বাক্যের অংশ ও শ্রেণিবিভাগ",
    nameEn: "Components and Classification of Sentences",
  },
  {
    nameBn: "বাক্যের বর্গ",
    nameEn: "Phrases in Sentence",
  },
  {
    nameBn: "উদ্দেশ্য ও বিধেয়",
    nameEn: "Subject and Predicate",
  },
  {
    nameBn: "সরল, জটিল ও যৌগিক বাক্য",
    nameEn: "Simple, Complex, and Compound Sentences",
  },
  {
    nameBn: "কারক",
    nameEn: "Case (Karak)",
  },
  {
    nameBn: "বাচ্য",
    nameEn: "Voice",
  },
  {
    nameBn: "উক্তি",
    nameEn: "Narration / Speech",
  },
  {
    nameBn: "যতিচিহ্ন",
    nameEn: "Punctuation Marks",
  },
  {
    nameBn: "বাগর্থ",
    nameEn: "Semantics",
  },
  {
    nameBn: "বাগধারা",
    nameEn: "Idioms and Phrases",
  },
  {
    nameBn: "প্রতিশব্দ",
    nameEn: "Synonyms",
  },
  {
    nameBn: "বিপরীত শব্দ",
    nameEn: "Antonyms",
  },
  {
    nameBn: "শব্দজোড়",
    nameEn: "Word Pairs",
  },
]

async function seed() {
  console.log("\x1b[36m🚀 Starting seeding chapters for Class 9/10 Bengali 2nd Paper...\x1b[0m")

  // 1. Locate Classes Nine and Ten
  const classes = await prisma.academicClass.findMany({
    where: {
      OR: [
        { nameEn: { in: ["Nine", "Ten"], mode: "insensitive" } },
        { nameBn: { in: ["নবম", "দশম"] } },
      ],
    },
    include: {
      classSubjects: {
        include: {
          academicSubject: true,
        },
      },
    },
  })

  console.log(`\x1b[32m✔ Found ${classes.length} classes: ${classes.map((c) => `${c.nameEn} (${c.nameBn})`).join(", ")}\x1b[0m`)

  // 2. Locate Bengali 2nd Paper subject
  let subject = await prisma.academicSubject.findFirst({
    where: {
      id: "cmw3l9kci0002i0ejt0rebiwv",
    },
  })

  if (!subject) {
    subject = await prisma.academicSubject.findFirst({
      where: {
        OR: [
          { nameEn: { contains: "Bengali 2nd", mode: "insensitive" } },
          { nameEn: { contains: "Bangla 2nd", mode: "insensitive" } },
          { nameBn: { contains: "বাংলা ২য়" } },
          { nameBn: { contains: "বাংলা ২য়" } },
        ],
        classSubjects: {
          some: {
            academicClass: {
              nameEn: { in: ["Nine", "Ten"] },
            },
          },
        },
      },
    })
  }

  if (!subject) {
    throw new Error("Could not find 'Bengali 2nd Paper' subject for Class Nine/Ten.")
  }

  console.log(`\x1b[32m✔ Target Subject:\x1b[0m ${subject.nameEn} / ${subject.nameBn} [ID: ${subject.id}]`)

  // 3. Upsert chapters
  const seededChapters: any[] = []

  for (let i = 0; i < CHAPTERS_DATA.length; i++) {
    const item = CHAPTERS_DATA[i]!
    const position = i + 1

    const chapter = await prisma.academicChapter.upsert({
      where: {
        subjectId_position: {
          subjectId: subject.id,
          position,
        },
      },
      update: {
        nameBn: item.nameBn.trim(),
        nameEn: item.nameEn.trim(),
        isActive: true,
        academicYearId: subject.academicYearId,
      },
      create: {
        subjectId: subject.id,
        nameBn: item.nameBn.trim(),
        nameEn: item.nameEn.trim(),
        position,
        isActive: true,
        academicYearId: subject.academicYearId,
      },
    })

    console.log(
      `  [${String(position).padStart(2, " ")}/${CHAPTERS_DATA.length}] ${chapter.nameBn} (${chapter.nameEn}) -> ID: ${chapter.id}`
    )
    seededChapters.push(chapter)
  }

  console.log(
    `\n\x1b[32m✔ Successfully seeded ${seededChapters.length} chapters for Class 9/10 "${subject.nameBn}" (${subject.nameEn})!\x1b[0m\n`
  )
}

seed()
  .catch((err) => {
    console.error("\x1b[31m✖ Seeding failed:\x1b[0m", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

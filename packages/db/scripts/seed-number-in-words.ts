import { config } from "dotenv"
import { resolve } from "node:path"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/main/client"

config({ path: resolve(import.meta.dirname, "../../../.env") })
config({ path: resolve(import.meta.dirname, "../.env") })
config()

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error("\x1b[31m✖ MAIN_DATABASE_URL or DATABASE_URL is not set in environment.\x1b[0m")
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// 1 to 100 Bengali Number In Words Dataset
const BENGALI_NUMBERS_1_TO_100: { num: string; inWords: string; difficulty: "EASY" | "MEDIUM" | "HARD" }[] = [
  { num: "১", inWords: "এক", difficulty: "EASY" },
  { num: "২", inWords: "দুই", difficulty: "EASY" },
  { num: "৩", inWords: "তিন", difficulty: "EASY" },
  { num: "৪", inWords: "চার", difficulty: "EASY" },
  { num: "৫", inWords: "পাঁচ", difficulty: "EASY" },
  { num: "৬", inWords: "ছয়", difficulty: "EASY" },
  { num: "৭", inWords: "সাত", difficulty: "EASY" },
  { num: "৮", inWords: "আট", difficulty: "EASY" },
  { num: "৯", inWords: "নয়", difficulty: "EASY" },
  { num: "১০", inWords: "দশ", difficulty: "EASY" },
  { num: "১১", inWords: "এগারো", difficulty: "EASY" },
  { num: "১২", inWords: "বারো", difficulty: "EASY" },
  { num: "১৩", inWords: "তেরো", difficulty: "EASY" },
  { num: "১৪", inWords: "চৌদ্দ", difficulty: "EASY" },
  { num: "১৫", inWords: "পনেরো", difficulty: "EASY" },
  { num: "১৬", inWords: "ষোলো", difficulty: "EASY" },
  { num: "১৭", inWords: "সতেরো", difficulty: "EASY" },
  { num: "১৮", inWords: "আঠারো", difficulty: "EASY" },
  { num: "১৯", inWords: "উনিশ", difficulty: "EASY" },
  { num: "২০", inWords: "বিশ", difficulty: "EASY" },
  { num: "২১", inWords: "একুশ", difficulty: "MEDIUM" },
  { num: "২২", inWords: "বাইশ", difficulty: "MEDIUM" },
  { num: "২৩", inWords: "তেইশ", difficulty: "MEDIUM" },
  { num: "২৪", inWords: "চব্বিশ", difficulty: "MEDIUM" },
  { num: "২৫", inWords: "পঁচিশ", difficulty: "MEDIUM" },
  { num: "২৬", inWords: "ছাব্বিশ", difficulty: "MEDIUM" },
  { num: "২৭", inWords: "সাতাশ", difficulty: "MEDIUM" },
  { num: "২৮", inWords: "আঠাশ", difficulty: "MEDIUM" },
  { num: "২৯", inWords: "উনত্রিশ", difficulty: "MEDIUM" },
  { num: "৩০", inWords: "ত্রিশ", difficulty: "MEDIUM" },
  { num: "৩১", inWords: "একত্রিশ", difficulty: "MEDIUM" },
  { num: "৩২", inWords: "বত্রিশ", difficulty: "MEDIUM" },
  { num: "৩৩", inWords: "তেত্রিশ", difficulty: "MEDIUM" },
  { num: "৩৪", inWords: "চৌত্রিশ", difficulty: "MEDIUM" },
  { num: "৩৫", inWords: "পঁয়ত্রিশ", difficulty: "MEDIUM" },
  { num: "৩৬", inWords: "ছত্রিশ", difficulty: "MEDIUM" },
  { num: "৩৭", inWords: "সাঁইত্রিশ", difficulty: "MEDIUM" },
  { num: "৩৮", inWords: "আটত্রিশ", difficulty: "MEDIUM" },
  { num: "৩৯", inWords: "উনচল্লিশ", difficulty: "MEDIUM" },
  { num: "৪০", inWords: "চল্লিশ", difficulty: "MEDIUM" },
  { num: "৪১", inWords: "একচল্লিশ", difficulty: "MEDIUM" },
  { num: "৪২", inWords: "বিয়াল্লিশ", difficulty: "MEDIUM" },
  { num: "৪৩", inWords: "তেতাল্লিশ", difficulty: "MEDIUM" },
  { num: "৪৪", inWords: "চুয়াল্লিশ", difficulty: "MEDIUM" },
  { num: "৪৫", inWords: "পঁয়তাল্লিশ", difficulty: "MEDIUM" },
  { num: "৪৬", inWords: "ছেচল্লিশ", difficulty: "MEDIUM" },
  { num: "৪৭", inWords: "সাতচল্লিশ", difficulty: "MEDIUM" },
  { num: "৪৮", inWords: "আটচল্লিশ", difficulty: "MEDIUM" },
  { num: "৪৯", inWords: "উনপঞ্চাশ", difficulty: "MEDIUM" },
  { num: "৫০", inWords: "পঞ্চাশ", difficulty: "MEDIUM" },
  { num: "৫১", inWords: "একান্ন", difficulty: "MEDIUM" },
  { num: "৫২", inWords: "বায়ান্ন", difficulty: "MEDIUM" },
  { num: "৫৩", inWords: "তিপ্পান্ন", difficulty: "MEDIUM" },
  { num: "৫৪", inWords: "চুয়ান্ন", difficulty: "MEDIUM" },
  { num: "৫৫", inWords: "পঞ্চান্ন", difficulty: "MEDIUM" },
  { num: "৫৬", inWords: "ছাপ্পান্ন", difficulty: "MEDIUM" },
  { num: "৫৭", inWords: "সাতান্ন", difficulty: "MEDIUM" },
  { num: "৫৮", inWords: "আটান্ন", difficulty: "MEDIUM" },
  { num: "৫৯", inWords: "উনষাট", difficulty: "MEDIUM" },
  { num: "৬০", inWords: "ষাট", difficulty: "MEDIUM" },
  { num: "৬১", inWords: "একষট্টি", difficulty: "HARD" },
  { num: "৬২", inWords: "বাষট্টি", difficulty: "HARD" },
  { num: "৬৩", inWords: "তেষট্টি", difficulty: "HARD" },
  { num: "৬৪", inWords: "চৌষট্টি", difficulty: "HARD" },
  { num: "৬৫", inWords: "পঁয়ষট্টি", difficulty: "HARD" },
  { num: "৬৬", inWords: "ছেষট্টি", difficulty: "HARD" },
  { num: "৬৭", inWords: "সাতষট্টি", difficulty: "HARD" },
  { num: "৬৮", inWords: "আটষট্টি", difficulty: "HARD" },
  { num: "৬৯", inWords: "উনসত্তর", difficulty: "HARD" },
  { num: "৭০", inWords: "সত্তর", difficulty: "HARD" },
  { num: "৭১", inWords: "একাত্তর", difficulty: "HARD" },
  { num: "৭২", inWords: "বাহাত্তর", difficulty: "HARD" },
  { num: "৭৩", inWords: "তেহাত্তর", difficulty: "HARD" },
  { num: "৭৪", inWords: "চুহাত্তর", difficulty: "HARD" },
  { num: "৭৫", inWords: "পঁচাত্তর", difficulty: "HARD" },
  { num: "৭৬", inWords: "ছিয়াত্তর", difficulty: "HARD" },
  { num: "৭৭", inWords: "সাতাত্তর", difficulty: "HARD" },
  { num: "৭৮", inWords: "আটাত্তর", difficulty: "HARD" },
  { num: "৭৯", inWords: "উনআশি", difficulty: "HARD" },
  { num: "৮০", inWords: "আশি", difficulty: "HARD" },
  { num: "৮১", inWords: "একাশি", difficulty: "HARD" },
  { num: "৮২", inWords: "বিরাশি", difficulty: "HARD" },
  { num: "৮৩", inWords: "তিরাশি", difficulty: "HARD" },
  { num: "৮৪", inWords: "চুরাশি", difficulty: "HARD" },
  { num: "৮৫", inWords: "পঁচাশি", difficulty: "HARD" },
  { num: "৮৬", inWords: "ছিয়াশি", difficulty: "HARD" },
  { num: "৮৭", inWords: "সাতাশি", difficulty: "HARD" },
  { num: "৮৮", inWords: "আটাশি", difficulty: "HARD" },
  { num: "৮৯", inWords: "উননব্বই", difficulty: "HARD" },
  { num: "৯০", inWords: "নব্বই", difficulty: "HARD" },
  { num: "৯১", inWords: "একানব্বই", difficulty: "HARD" },
  { num: "৯২", inWords: "বায়ানব্বই", difficulty: "HARD" },
  { num: "৯৩", inWords: "তিরানব্বই", difficulty: "HARD" },
  { num: "৯৪", inWords: "চুরানব্বই", difficulty: "HARD" },
  { num: "৯৫", inWords: "পঁচানব্বই", difficulty: "HARD" },
  { num: "৯৬", inWords: "ছিয়ানব্বই", difficulty: "HARD" },
  { num: "৯৭", inWords: "সাতানব্বই", difficulty: "HARD" },
  { num: "৯৮", inWords: "আটানব্বই", difficulty: "HARD" },
  { num: "৯৯", inWords: "নিরানব্বই", difficulty: "HARD" },
  { num: "১০০", inWords: "একশত", difficulty: "HARD" },
]

// 1 to 100 English Number In Words Dataset
const ENGLISH_NUMBERS_1_TO_100: { num: string; inWords: string; difficulty: "EASY" | "MEDIUM" | "HARD" }[] = [
  { num: "1", inWords: "One", difficulty: "EASY" },
  { num: "2", inWords: "Two", difficulty: "EASY" },
  { num: "3", inWords: "Three", difficulty: "EASY" },
  { num: "4", inWords: "Four", difficulty: "EASY" },
  { num: "5", inWords: "Five", difficulty: "EASY" },
  { num: "6", inWords: "Six", difficulty: "EASY" },
  { num: "7", inWords: "Seven", difficulty: "EASY" },
  { num: "8", inWords: "Eight", difficulty: "EASY" },
  { num: "9", inWords: "Nine", difficulty: "EASY" },
  { num: "10", inWords: "Ten", difficulty: "EASY" },
  { num: "11", inWords: "Eleven", difficulty: "EASY" },
  { num: "12", inWords: "Twelve", difficulty: "EASY" },
  { num: "13", inWords: "Thirteen", difficulty: "EASY" },
  { num: "14", inWords: "Fourteen", difficulty: "EASY" },
  { num: "15", inWords: "Fifteen", difficulty: "EASY" },
  { num: "16", inWords: "Sixteen", difficulty: "EASY" },
  { num: "17", inWords: "Seventeen", difficulty: "EASY" },
  { num: "18", inWords: "Eighteen", difficulty: "EASY" },
  { num: "19", inWords: "Nineteen", difficulty: "EASY" },
  { num: "20", inWords: "Twenty", difficulty: "EASY" },
  { num: "21", inWords: "Twenty-one", difficulty: "MEDIUM" },
  { num: "22", inWords: "Twenty-two", difficulty: "MEDIUM" },
  { num: "23", inWords: "Twenty-three", difficulty: "MEDIUM" },
  { num: "24", inWords: "Twenty-four", difficulty: "MEDIUM" },
  { num: "25", inWords: "Twenty-five", difficulty: "MEDIUM" },
  { num: "26", inWords: "Twenty-six", difficulty: "MEDIUM" },
  { num: "27", inWords: "Twenty-seven", difficulty: "MEDIUM" },
  { num: "28", inWords: "Twenty-eight", difficulty: "MEDIUM" },
  { num: "29", inWords: "Twenty-nine", difficulty: "MEDIUM" },
  { num: "30", inWords: "Thirty", difficulty: "MEDIUM" },
  { num: "31", inWords: "Thirty-one", difficulty: "MEDIUM" },
  { num: "32", inWords: "Thirty-two", difficulty: "MEDIUM" },
  { num: "33", inWords: "Thirty-three", difficulty: "MEDIUM" },
  { num: "34", inWords: "Thirty-four", difficulty: "MEDIUM" },
  { num: "35", inWords: "Thirty-five", difficulty: "MEDIUM" },
  { num: "36", inWords: "Thirty-six", difficulty: "MEDIUM" },
  { num: "37", inWords: "Thirty-seven", difficulty: "MEDIUM" },
  { num: "38", inWords: "Thirty-eight", difficulty: "MEDIUM" },
  { num: "39", inWords: "Thirty-nine", difficulty: "MEDIUM" },
  { num: "40", inWords: "Forty", difficulty: "MEDIUM" },
  { num: "41", inWords: "Forty-one", difficulty: "MEDIUM" },
  { num: "42", inWords: "Forty-two", difficulty: "MEDIUM" },
  { num: "43", inWords: "Forty-three", difficulty: "MEDIUM" },
  { num: "44", inWords: "Forty-four", difficulty: "MEDIUM" },
  { num: "45", inWords: "Forty-five", difficulty: "MEDIUM" },
  { num: "46", inWords: "Forty-six", difficulty: "MEDIUM" },
  { num: "47", inWords: "Forty-seven", difficulty: "MEDIUM" },
  { num: "48", inWords: "Forty-eight", difficulty: "MEDIUM" },
  { num: "49", inWords: "Forty-nine", difficulty: "MEDIUM" },
  { num: "50", inWords: "Fifty", difficulty: "MEDIUM" },
  { num: "51", inWords: "Fifty-one", difficulty: "MEDIUM" },
  { num: "52", inWords: "Fifty-two", difficulty: "MEDIUM" },
  { num: "53", inWords: "Fifty-three", difficulty: "MEDIUM" },
  { num: "54", inWords: "Fifty-four", difficulty: "MEDIUM" },
  { num: "55", inWords: "Fifty-five", difficulty: "MEDIUM" },
  { num: "56", inWords: "Fifty-six", difficulty: "MEDIUM" },
  { num: "57", inWords: "Fifty-seven", difficulty: "MEDIUM" },
  { num: "58", inWords: "Fifty-eight", difficulty: "MEDIUM" },
  { num: "59", inWords: "Fifty-nine", difficulty: "MEDIUM" },
  { num: "60", inWords: "Sixty", difficulty: "MEDIUM" },
  { num: "61", inWords: "Sixty-one", difficulty: "HARD" },
  { num: "62", inWords: "Sixty-two", difficulty: "HARD" },
  { num: "63", inWords: "Sixty-three", difficulty: "HARD" },
  { num: "64", inWords: "Sixty-four", difficulty: "HARD" },
  { num: "65", inWords: "Sixty-five", difficulty: "HARD" },
  { num: "66", inWords: "Sixty-six", difficulty: "HARD" },
  { num: "67", inWords: "Sixty-seven", difficulty: "HARD" },
  { num: "68", inWords: "Sixty-eight", difficulty: "HARD" },
  { num: "69", inWords: "Sixty-nine", difficulty: "HARD" },
  { num: "70", inWords: "Seventy", difficulty: "HARD" },
  { num: "71", inWords: "Seventy-one", difficulty: "HARD" },
  { num: "72", inWords: "Seventy-two", difficulty: "HARD" },
  { num: "73", inWords: "Seventy-three", difficulty: "HARD" },
  { num: "74", inWords: "Seventy-four", difficulty: "HARD" },
  { num: "75", inWords: "Seventy-five", difficulty: "HARD" },
  { num: "76", inWords: "Seventy-six", difficulty: "HARD" },
  { num: "77", inWords: "Seventy-seven", difficulty: "HARD" },
  { num: "78", inWords: "Seventy-eight", difficulty: "HARD" },
  { num: "79", inWords: "Seventy-nine", difficulty: "HARD" },
  { num: "80", inWords: "Eighty", difficulty: "HARD" },
  { num: "81", inWords: "Eighty-one", difficulty: "HARD" },
  { num: "82", inWords: "Eighty-two", difficulty: "HARD" },
  { num: "83", inWords: "Eighty-three", difficulty: "HARD" },
  { num: "84", inWords: "Eighty-four", difficulty: "HARD" },
  { num: "85", inWords: "Eighty-five", difficulty: "HARD" },
  { num: "86", inWords: "Eighty-six", difficulty: "HARD" },
  { num: "87", inWords: "Eighty-seven", difficulty: "HARD" },
  { num: "88", inWords: "Eighty-eight", difficulty: "HARD" },
  { num: "89", inWords: "Eighty-nine", difficulty: "HARD" },
  { num: "90", inWords: "Ninety", difficulty: "HARD" },
  { num: "91", inWords: "Ninety-one", difficulty: "HARD" },
  { num: "92", inWords: "Ninety-two", difficulty: "HARD" },
  { num: "93", inWords: "Ninety-three", difficulty: "HARD" },
  { num: "94", inWords: "Ninety-four", difficulty: "HARD" },
  { num: "95", inWords: "Ninety-five", difficulty: "HARD" },
  { num: "96", inWords: "Ninety-six", difficulty: "HARD" },
  { num: "97", inWords: "Ninety-seven", difficulty: "HARD" },
  { num: "98", inWords: "Ninety-eight", difficulty: "HARD" },
  { num: "99", inWords: "Ninety-nine", difficulty: "HARD" },
  { num: "100", inWords: "One Hundred", difficulty: "HARD" },
]

async function resolveQuestionType() {
  let qt = await prisma.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Number in Words", mode: "insensitive" } },
        { nameEn: { equals: "Numbers in Words", mode: "insensitive" } },
        { label: { equals: "Number in Words", mode: "insensitive" } },
        { label: { equals: "Numbers in Words", mode: "insensitive" } },
        { nameEn: { equals: "NUMBER_IN_WORDS", mode: "insensitive" } },
        { nameBn: { equals: "কথায় লেখ", mode: "insensitive" } },
        { nameBn: { equals: "কথায় লেখা", mode: "insensitive" } },
      ],
    },
  })

  if (!qt) {
    qt = await prisma.questionType.create({
      data: {
        nameEn: "Number in Words",
        nameBn: "কথায় লেখ",
        label: "Number in Words",
        mark: 5,
        position: 20,
        descriptionEn: "Number in Words",
        descriptionBn: "সংখ্যা কথায় লেখা",
        isActive: true,
      },
    })
  } else {
    qt = await prisma.questionType.update({
      where: { id: qt.id },
      data: {
        position: 20,
        isActive: true,
      },
    })
  }

  return qt
}

async function main() {
  console.log("\x1b[36m=====================================================\x1b[0m")
  console.log("\x1b[36m Seeding Number in Words (1 to 100) \x1b[0m")
  console.log("\x1b[36m=====================================================\x1b[0m\n")

  // 1. Resolve QuestionType
  const qt = await resolveQuestionType()
  console.log(`\x1b[32m✔ QuestionType:\x1b[0m ${qt.nameBn} (${qt.nameEn}) [ID: ${qt.id}]`)

  // 2. Resolve Class 3
  const academicClass = await prisma.academicClass.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Three", mode: "insensitive" } },
        { nameBn: { contains: "তৃতীয়" } },
        { nameEn: { contains: "3" } },
      ],
    },
    include: {
      classSubjects: {
        include: {
          academicSubject: {
            include: {
              chapters: {
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
    },
  })

  let englishSubject: any = null
  if (academicClass) {
    console.log(`\x1b[32m✔ Found Class:\x1b[0m ${academicClass.nameEn} (${academicClass.nameBn}) [ID: ${academicClass.id}]`)
    const classSubject = academicClass.classSubjects.find((cs) => {
      const sNameBn = cs.academicSubject.nameBn || ""
      const sNameEn = (cs.academicSubject.nameEn || "").toLowerCase()
      return sNameBn.includes("ইংরেজি") || sNameBn.includes("ইংরেজী") || sNameEn.includes("english")
    })
    if (classSubject) {
      englishSubject = classSubject.academicSubject
    }
  }

  if (!englishSubject) {
    englishSubject = await prisma.academicSubject.findFirst({
      where: {
        OR: [
          { nameEn: { contains: "English", mode: "insensitive" } },
          { nameBn: { contains: "ইংরেজি" } },
          { nameBn: { contains: "ইংরেজী" } },
        ],
      },
      include: {
        chapters: {
          orderBy: { position: "asc" },
        },
      },
    })
  }

  if (!englishSubject) {
    throw new Error("Could not find English Subject in database for Class 3.")
  }

  console.log(`\x1b[32m✔ Subject:\x1b[0m ${englishSubject.nameBn || englishSubject.nameEn} [ID: ${englishSubject.id}]`)

  // Ensure SubjectQuestionType is linked
  const existingSqt = await prisma.subjectQuestionType.findFirst({
    where: {
      subjectId: englishSubject.id,
      questionTypeId: qt.id,
    },
  })
  if (!existingSqt) {
    await prisma.subjectQuestionType.create({
      data: {
        subjectId: englishSubject.id,
        questionTypeId: qt.id,
        mark: 5,
        totalQuestions: 10,
        requiredCount: 5,
      },
    })
    console.log(`\x1b[32m✔ Linked SubjectQuestionType to ${englishSubject.nameBn || englishSubject.nameEn}\x1b[0m`)
  }

  // 3. Resolve or create Chapter "Numbers in Words / কথায় লেখ"
  let targetChapter = englishSubject.chapters.find((ch: any) =>
    ch.nameEn?.toLowerCase().includes("number") ||
    ch.nameBn?.includes("কথায়") ||
    ch.nameBn?.includes("সংখ্যা")
  )

  if (!targetChapter) {
    targetChapter = await prisma.academicChapter.create({
      data: {
        nameEn: "Numbers in Words (1-100)",
        nameBn: "কথায় লেখ (১-১০০)",
        subjectId: englishSubject.id,
        position: (englishSubject.chapters.length || 0) + 1,
      },
    })
    console.log(`\x1b[32m✔ Created Chapter:\x1b[0m ${targetChapter.nameBn} (${targetChapter.nameEn}) [ID: ${targetChapter.id}]`)
  } else {
    console.log(`\x1b[32m✔ Target Chapter:\x1b[0m ${targetChapter.nameBn} (${targetChapter.nameEn}) [ID: ${targetChapter.id}]`)
  }

  // 4. Seed 1-100 Bengali numbers
  console.log("\n\x1b[33m⏳ Seeding 100 Bengali Numbers (১ থেকে ১০০)...\x1b[0m")
  let bnInserted = 0
  let bnUpdated = 0

  for (const item of BENGALI_NUMBERS_1_TO_100) {
    const existing = await prisma.numberInWords.findFirst({
      where: {
        subjectId: englishSubject.id,
        number: item.num,
        deletedAt: null,
      },
    })

    if (existing) {
      await prisma.numberInWords.update({
        where: { id: existing.id },
        data: {
          inWords: item.inWords,
          difficulty: item.difficulty,
          academicChapterId: targetChapter.id,
          questionTypeId: qt.id,
          reference: ["Textbook", "English For Today", "Board Exam"],
          source: "পাঠ্যবই",
          session: "2026",
          isActive: true,
        },
      })
      bnUpdated++
    } else {
      await prisma.numberInWords.create({
        data: {
          number: item.num,
          inWords: item.inWords,
          difficulty: item.difficulty,
          academicChapterId: targetChapter.id,
          subjectId: englishSubject.id,
          questionTypeId: qt.id,
          reference: ["Textbook", "English For Today", "Board Exam"],
          source: "পাঠ্যবই",
          session: "2026",
          isActive: true,
        },
      })
      bnInserted++
    }
  }

  console.log(`\x1b[32m✔ Bengali Numbers: ${bnInserted} created, ${bnUpdated} updated.\x1b[0m`)

  // 5. Seed 1-100 English numbers
  console.log("\n\x1b[33m⏳ Seeding 100 English Numbers (1 to 100)...\x1b[0m")
  let enInserted = 0
  let enUpdated = 0

  for (const item of ENGLISH_NUMBERS_1_TO_100) {
    const existing = await prisma.numberInWords.findFirst({
      where: {
        subjectId: englishSubject.id,
        number: item.num,
        deletedAt: null,
      },
    })

    if (existing) {
      await prisma.numberInWords.update({
        where: { id: existing.id },
        data: {
          inWords: item.inWords,
          difficulty: item.difficulty,
          academicChapterId: targetChapter.id,
          questionTypeId: qt.id,
          reference: ["Textbook", "English For Today"],
          source: "পাঠ্যবই",
          session: "2026",
          isActive: true,
        },
      })
      enUpdated++
    } else {
      await prisma.numberInWords.create({
        data: {
          number: item.num,
          inWords: item.inWords,
          difficulty: item.difficulty,
          academicChapterId: targetChapter.id,
          subjectId: englishSubject.id,
          questionTypeId: qt.id,
          reference: ["Textbook", "English For Today"],
          source: "পাঠ্যবই",
          session: "2026",
          isActive: true,
        },
      })
      enInserted++
    }
  }

  console.log(`\x1b[32m✔ English Numbers: ${enInserted} created, ${enUpdated} updated.\x1b[0m`)

  const total = await prisma.numberInWords.count({
    where: { subjectId: englishSubject.id, deletedAt: null },
  })

  console.log(`\n\x1b[32m🎉 Success! Total Number In Words in DB for Class 3 English: ${total}\x1b[0m\n`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error("\x1b[31m✖ Error during seeding:\x1b[0m", e)
    await prisma.$disconnect()
    process.exit(1)
  })

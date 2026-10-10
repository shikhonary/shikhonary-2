import "dotenv/config"
import { db } from "../../src/index"

async function main() {
  console.log("Seeding Credit Packs...")

  const packs = [
    {
      name: "mini",
      displayName: "মিনি টপ-আপ",
      description: "জরুরি প্রশ্ন তৈরি ও স্বল্প ব্যবহারের জন্য",
      credits: 200,
      bonusCredits: 0,
      priceBDT: 200,
      isPopular: false,
      isActive: true,
      position: 1,
    },
    {
      name: "standard",
      displayName: "স্ট্যান্ডার্ড টপ-আপ",
      description: "কোচিং ও নিয়মিত প্রশ্ন তৈরির সেরা পছন্দ",
      credits: 500,
      bonusCredits: 50,
      priceBDT: 500,
      isPopular: true,
      isActive: true,
      position: 2,
    },
    {
      name: "super-saver",
      displayName: "সুপার সেভার প্যাক",
      description: "মাসিক পরীক্ষা ও বড় প্রশ্নভাণ্ডার ব্যবহারের জন্য",
      credits: 1000,
      bonusCredits: 200,
      priceBDT: 1000,
      isPopular: false,
      isActive: true,
      position: 3,
    },
    {
      name: "mega",
      displayName: "মেগা প্রাতিষ্ঠানিক প্যাক",
      description: "স্কুল, কলেজ ও বৃহৎ প্রতিষ্ঠানের ভারী ব্যবহারের জন্য",
      credits: 2500,
      bonusCredits: 600,
      priceBDT: 2500,
      isPopular: false,
      isActive: true,
      position: 4,
    },
  ]

  for (const pack of packs) {
    const upserted = await (db as any).creditPack.upsert({
      where: { name: pack.name },
      update: pack,
      create: pack,
    })
    console.log(`Seeded Credit Pack: ${upserted.displayName} (Total: ${upserted.credits + upserted.bonusCredits} credits @ ৳${upserted.priceBDT})`)
  }

  console.log("Successfully seeded all Credit Packs!")
}

main()
  .catch((e) => {
    console.error("Error seeding credit packs:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())

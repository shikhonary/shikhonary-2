export type ReferenceCategory =
  | "BOARD"
  | "CADET"
  | "SCHOOL"
  | "TEST_EXAM"
  | "TEXTBOOK"
  | "OTHER"

export interface ReferenceCategoryConfig {
  key: ReferenceCategory
  labelBn: string
  labelEn: string
  icon: string
  order: number
}

export const REFERENCE_CATEGORIES: Record<ReferenceCategory, ReferenceCategoryConfig> = {
  BOARD: {
    key: "BOARD",
    labelBn: "বোর্ড প্রশ্ন",
    labelEn: "Board Exams",
    icon: "🏛️",
    order: 1,
  },
  CADET: {
    key: "CADET",
    labelBn: "ক্যাডেট কলেজ",
    labelEn: "Cadet Colleges",
    icon: "🎖️",
    order: 2,
  },
  SCHOOL: {
    key: "SCHOOL",
    labelBn: "শীর্ষস্থানীয় বিদ্যালয় ও কলেজ",
    labelEn: "Top Schools & Colleges",
    icon: "🏫",
    order: 3,
  },
  TEST_EXAM: {
    key: "TEST_EXAM",
    labelBn: "নির্বাচনী পরীক্ষা (নি. প.)",
    labelEn: "Test Examinations",
    icon: "📝",
    order: 4,
  },
  TEXTBOOK: {
    key: "TEXTBOOK",
    labelBn: "বোর্ড বই / পাঠ্যবই",
    labelEn: "Textbook / Board Book",
    icon: "📖",
    order: 5,
  },
  OTHER: {
    key: "OTHER",
    labelBn: "অন্যান্য রেফারেন্স",
    labelEn: "Other References",
    icon: "📌",
    order: 6,
  },
}

/**
 * Automatically classifies educational references into logical categories
 * for curriculum tagging, filtering, and grouped selection dropdowns.
 */
export function categorizeReference(ref: string | null | undefined): ReferenceCategory {
  if (!ref || typeof ref !== "string") return "OTHER"
  const trimmed = ref.trim()

  // 1. Board Book / Textbook
  if (/বোর্ড\s*বই|পাঠ্যবই|textbook/i.test(trimmed)) {
    return "TEXTBOOK"
  }

  // 2. Cadet Colleges
  if (/ক্যাডেট\s*কলেজ|cadet\s*college/i.test(trimmed)) {
    return "CADET"
  }

  // 3. Board Exams (e.g. ঢা. বো. ২০, য. বো. ১৬, চ. বো. ২৩, ঢাকা বোর্ড, Board 2024, etc.)
  if (
    /(?:ঢা|রা|কু|য|চ|ব|সি|দি|মা|কা|ম)\.\s*বো\./.test(trimmed) ||
    /বোর্ড\s*(?:পরীক্ষা|[০-৯\d]{2,4})?/i.test(trimmed) ||
    /\b(?:Dhaka|Rajshahi|Comilla|Jessore|Chittagong|Barisal|Sylhet|Dinajpur|Mymensingh|Madrasah|Technical)\s*Board\b/i.test(trimmed) ||
    /\bBoard\s*[\d]{2,4}\b/i.test(trimmed)
  ) {
    return "BOARD"
  }

  // 4. Test Exams & Model Tests (e.g. নি. প. ২০২৫, নির্বাচনী পরীক্ষা, মডেল টেস্ট)
  if (/নি\.\s*প\.|নির্বাচনী|মডেল\s*টেস্ট|টেস্ট\s*পরীক্ষা|প্রাক-নির্বাচনী/i.test(trimmed)) {
    return "TEST_EXAM"
  }

  // 5. Top Schools & Colleges
  if (/স্কুল|বিদ্যালয়|বিদ্যালয়|কলেজ|জিলা|School|College|High School|ল্যাবরেটরি|ল্যাবরেটরী|ক্যান্টনমেন্ট|পাবলিক|মডেল/i.test(trimmed)) {
    return "SCHOOL"
  }

  return "OTHER"
}

const BN_TO_EN_DIGITS: Record<string, string> = {
  "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
  "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
}
const EN_TO_BN_DIGITS: Record<string, string> = {
  "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
  "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
}

/**
 * Extracts normalized 4-digit Bengali year from references
 * (e.g. "নি. প. ২০২৫" -> "২০২৫", "য. বো. ১৬" -> "২০১৬", "চ. বো. ২৩" -> "২০২৩").
 */
export function extractReferenceYear(ref: string | null | undefined): string | null {
  if (!ref || typeof ref !== "string") return null
  const trimmed = ref.trim()

  // Match 4-digit full year: 2020-2029 or ২০০০-২০৯৯
  const fullYrMatch = trimmed.match(/(?:20\d{2}|[২][০][০-৯]{2})/)
  if (fullYrMatch) {
    const raw = fullYrMatch[0]!
    return raw.replace(/[0-9]/g, (d) => EN_TO_BN_DIGITS[d] || d)
  }

  // Match 2-digit board year suffix: e.g. "য. বো. ১৬", "চ. বো. ২৩", "Board 22"
  const shortMatch = trimmed.match(/(?:বো\.|Board)\s*([০-৯\d]{2})(?![০-৯\d])/)
  if (shortMatch) {
    const digits = shortMatch[1]!
    const enDigits = digits.replace(/[০-৯]/g, (d) => BN_TO_EN_DIGITS[d] || d)
    const fullEn = `20${enDigits}`
    return fullEn.replace(/[0-9]/g, (d) => EN_TO_BN_DIGITS[d] || d)
  }

  return null
}


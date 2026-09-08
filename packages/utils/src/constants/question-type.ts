/**
 * Strict type-safe Question Types configuration and utilities.
 */

export const QUESTION_TYPES = {
  MCQ: "MCQ",
  CQ: "CQ",
  SA: "SA",
  CS: "CS",
  PBQ: "Passage Based",
  PARAGRAPH: "Paragraph",
  LETTER: "Letter",
  APPLICATION: "Application",
  SUMMARY: "Summary",
  ESSENCE: "Essence",
  THOUGHT_EXPANSION: "Thought Expansion",
  NEWS_REPORT: "News report",
  ESSAY: "Essay",
  PARTS_OF_SPEECH: "Parts of Speech",
  FILL_IN_THE_BLANKS_WITH_CLUES: "Fill in the Blanks with Clues",
  RIGHT_FORM_OF_VERBS: "Right Form of Verbs",
  CHANGING_SENTENCES: "Changing Sentences",
  SUBSTITUTION_TABLE: "Substitution Table",
  PUNCTUATION: "Punctuation and Capitalization",
  SHORT_COMPOSITION: "Short Composition",
} as const

export type QuestionTypeName = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES]

export const QUESTION_TYPE_CODES = {
  MCQ: "MCQ",
  CQ: "CQ",
  SA: "SA",
  CS: "CS",
  PBQ: "PBQ",
  PARAGRAPH: "PARAGRAPH",
  LETTER: "LETTER",
  APPLICATION: "APPLICATION",
  SUMMARY: "SUMMARY",
  ESSENCE: "ESSENCE",
  AMPLIFICATION: "AMPLIFICATION",
  NEWS_REPORT: "NEWS_REPORT",
  ESSAY: "ESSAY",
  PARTS_OF_SPEECH: "PARTS_OF_SPEECH",
  FILL_IN_THE_BLANKS_WITH_CLUES: "FILL_IN_THE_BLANKS_WITH_CLUES",
  RIGHT_FORM_OF_VERBS: "RIGHT_FORM_OF_VERBS",
  CHANGING_SENTENCES: "CHANGING_SENTENCES",
  SUBSTITUTION_TABLE: "SUBSTITUTION_TABLE",
  PUNCTUATION: "PUNCTUATION",
  SHORT_COMPOSITION: "SHORT_COMPOSITION",
} as const

export type QuestionTypeCode = (typeof QUESTION_TYPE_CODES)[keyof typeof QUESTION_TYPE_CODES]

export interface QuestionTypeDefinition {
  nameEn: QuestionTypeName
  nameBn: string
  code: QuestionTypeCode
  defaultMark?: number
  defaultPosition?: number
}

export const QUESTION_TYPE_MAP: Record<QuestionTypeName, QuestionTypeDefinition> = {
  [QUESTION_TYPES.MCQ]: {
    nameEn: QUESTION_TYPES.MCQ,
    nameBn: "বহুনির্বাচনি",
    code: QUESTION_TYPE_CODES.MCQ,
    defaultMark: 1,
    defaultPosition: 3,
  },
  [QUESTION_TYPES.CQ]: {
    nameEn: QUESTION_TYPES.CQ,
    nameBn: "সৃজনশীল",
    code: QUESTION_TYPE_CODES.CQ,
    defaultMark: 10,
    defaultPosition: 1,
  },
  [QUESTION_TYPES.SA]: {
    nameEn: QUESTION_TYPES.SA,
    nameBn: "সংক্ষিপ্ত-উত্তর",
    code: QUESTION_TYPE_CODES.SA,
    defaultMark: 2,
    defaultPosition: 2,
  },
  [QUESTION_TYPES.CS]: {
    nameEn: QUESTION_TYPES.CS,
    nameBn: "সহপাঠ অংশ প্রশ্ন",
    code: QUESTION_TYPE_CODES.CS,
    defaultMark: 10,
    defaultPosition: 2,
  },
  [QUESTION_TYPES.PBQ]: {
    nameEn: QUESTION_TYPES.PBQ,
    nameBn: "অনুচ্ছেদভিত্তিক প্রশ্ন",
    code: QUESTION_TYPE_CODES.PBQ,
    defaultMark: 10,
    defaultPosition: 3,
  },
  [QUESTION_TYPES.PARAGRAPH]: {
    nameEn: QUESTION_TYPES.PARAGRAPH,
    nameBn: "অনুচ্ছেদ",
    code: QUESTION_TYPE_CODES.PARAGRAPH,
    defaultMark: 10,
    defaultPosition: 1,
  },
  [QUESTION_TYPES.LETTER]: {
    nameEn: QUESTION_TYPES.LETTER,
    nameBn: "চিঠি",
    code: QUESTION_TYPE_CODES.LETTER,
    defaultMark: 10,
    defaultPosition: 2,
  },
  [QUESTION_TYPES.APPLICATION]: {
    nameEn: QUESTION_TYPES.APPLICATION,
    nameBn: "আবেদন পত্র",
    code: QUESTION_TYPE_CODES.APPLICATION,
    defaultMark: 10,
    defaultPosition: 3,
  },
  [QUESTION_TYPES.SUMMARY]: {
    nameEn: QUESTION_TYPES.SUMMARY,
    nameBn: "সারাংশ",
    code: QUESTION_TYPE_CODES.SUMMARY,
    defaultMark: 10,
    defaultPosition: 4,
  },
  [QUESTION_TYPES.ESSENCE]: {
    nameEn: QUESTION_TYPES.ESSENCE,
    nameBn: "সারমর্ম",
    code: QUESTION_TYPE_CODES.ESSENCE,
    defaultMark: 10,
    defaultPosition: 5,
  },
  [QUESTION_TYPES.THOUGHT_EXPANSION]: {
    nameEn: QUESTION_TYPES.THOUGHT_EXPANSION,
    nameBn: "ভাব-সম্প্রসারণ",
    code: QUESTION_TYPE_CODES.AMPLIFICATION,
    defaultMark: 10,
    defaultPosition: 6,
  },
  [QUESTION_TYPES.NEWS_REPORT]: {
    nameEn: QUESTION_TYPES.NEWS_REPORT,
    nameBn: "সংবাদ প্রতিবেদন",
    code: QUESTION_TYPE_CODES.NEWS_REPORT,
    defaultMark: 10,
    defaultPosition: 7,
  },
  [QUESTION_TYPES.ESSAY]: {
    nameEn: QUESTION_TYPES.ESSAY,
    nameBn: "রচনা",
    code: QUESTION_TYPE_CODES.ESSAY,
    defaultMark: 20,
    defaultPosition: 8,
  },
  [QUESTION_TYPES.PARTS_OF_SPEECH]: {
    nameEn: QUESTION_TYPES.PARTS_OF_SPEECH,
    nameBn: "পদ নির্ণয়",
    code: QUESTION_TYPE_CODES.PARTS_OF_SPEECH,
    defaultMark: 5,
    defaultPosition: 9,
  },
  [QUESTION_TYPES.FILL_IN_THE_BLANKS_WITH_CLUES]: {
    nameEn: QUESTION_TYPES.FILL_IN_THE_BLANKS_WITH_CLUES,
    nameBn: "শূন্যস্থান পূরণ (ক্লুসহ)",
    code: QUESTION_TYPE_CODES.FILL_IN_THE_BLANKS_WITH_CLUES,
    defaultMark: 5,
    defaultPosition: 10,
  },
  [QUESTION_TYPES.RIGHT_FORM_OF_VERBS]: {
    nameEn: QUESTION_TYPES.RIGHT_FORM_OF_VERBS,
    nameBn: "ক্রিয়ার সঠিক রূপ (Right Form of Verbs)",
    code: QUESTION_TYPE_CODES.RIGHT_FORM_OF_VERBS,
    defaultMark: 5,
    defaultPosition: 11,
  },
  [QUESTION_TYPES.CHANGING_SENTENCES]: {
    nameEn: QUESTION_TYPES.CHANGING_SENTENCES,
    nameBn: "বাক্য রূপান্তর (Changing Sentences)",
    code: QUESTION_TYPE_CODES.CHANGING_SENTENCES,
    defaultMark: 5,
    defaultPosition: 12,
  },
  [QUESTION_TYPES.SUBSTITUTION_TABLE]: {
    nameEn: QUESTION_TYPES.SUBSTITUTION_TABLE,
    nameBn: "প্রতিস্থাপন সারণি",
    code: QUESTION_TYPE_CODES.SUBSTITUTION_TABLE,
    defaultMark: 5,
    defaultPosition: 13,
  },
  [QUESTION_TYPES.PUNCTUATION]: {
    nameEn: QUESTION_TYPES.PUNCTUATION,
    nameBn: "বিরাম চিহ্ন ও ক্যাপিটালাইজেশন (Punctuation and Capitalization)",
    code: QUESTION_TYPE_CODES.PUNCTUATION,
    defaultMark: 5,
    defaultPosition: 14,
  },
  [QUESTION_TYPES.SHORT_COMPOSITION]: {
    nameEn: QUESTION_TYPES.SHORT_COMPOSITION,
    nameBn: "শর্ট কম্পোজিশন (Short Composition)",
    code: QUESTION_TYPE_CODES.SHORT_COMPOSITION,
    defaultMark: 10,
    defaultPosition: 15,
  },
} as const

export const QUESTION_TYPE_OPTIONS = Object.values(QUESTION_TYPE_MAP).map((qt) => ({
  value: qt.nameEn,
  label: `${qt.nameEn} (${qt.nameBn})`,
  nameEn: qt.nameEn,
  nameBn: qt.nameBn,
  code: qt.code,
}))

/**
 * Type guard for QuestionTypeName
 */
export function isQuestionTypeName(value: unknown): value is QuestionTypeName {
  return typeof value === "string" && Object.values(QUESTION_TYPES).includes(value as QuestionTypeName)
}

/**
 * Returns the Bangla name for a given English question type name.
 */
export function getQuestionTypeNameBn(nameEn: QuestionTypeName): string {
  return QUESTION_TYPE_MAP[nameEn]?.nameBn ?? nameEn
}

/**
 * Normalizes any question type string (handling casing, abbreviations, synonyms, or db typos)
 * into a strictly typed QuestionTypeName.
 */
export function normalizeQuestionTypeName(raw?: string | null): QuestionTypeName | null {
  if (!raw) return null
  const trimmed = raw.trim()

  // Exact match
  if (isQuestionTypeName(trimmed)) {
    return trimmed
  }

  const lower = trimmed.toLowerCase()

  if (lower === "mcq" || lower.includes("multiple choice") || lower.includes("বহুনির্বাচনি")) {
    return QUESTION_TYPES.MCQ
  }
  if (lower === "cq" || lower.includes("creative") || lower.includes("সৃজনশীল")) {
    return QUESTION_TYPES.CQ
  }
  if (lower === "sa" || lower.includes("short answer") || lower.includes("সংক্ষিপ্ত")) {
    return QUESTION_TYPES.SA
  }
  if (lower === "cs" || lower.includes("creative scenario") || lower.includes("সহপাঠ")) {
    return QUESTION_TYPES.CS
  }
  if (lower === "pbq" || lower.includes("passage based") || lower.includes("অনুচ্ছেদভিত্তিক") || lower.includes("বোধ পরীক্ষণ")) {
    return QUESTION_TYPES.PBQ
  }
  if (lower === "paragraph" || lower.includes("অনুচ্ছেদ")) {
    return QUESTION_TYPES.PARAGRAPH
  }
  if (lower === "letter" || lower.includes("চিঠি") || lower.includes("পত্র")) {
    return QUESTION_TYPES.LETTER
  }
  if (lower === "application" || lower === "applicaion" || lower.includes("আবেদন") || lower.includes("দরখাস্ত")) {
    return QUESTION_TYPES.APPLICATION
  }
  if (lower === "summary" || lower.includes("সারাংশ")) {
    return QUESTION_TYPES.SUMMARY
  }
  if (lower === "essence" || lower.includes("সারমর্ম")) {
    return QUESTION_TYPES.ESSENCE
  }
  if (lower === "thought expansion" || lower === "amplification" || lower.includes("ভাব-সম্প্রসারণ") || lower.includes("ভাবসম্প্রসারণ")) {
    return QUESTION_TYPES.THOUGHT_EXPANSION
  }
  if (lower === "news report" || lower.includes("সংবাদ প্রতিবেদন")) {
    return QUESTION_TYPES.NEWS_REPORT
  }
  if (lower === "essay" || lower.includes("রচনা")) {
    return QUESTION_TYPES.ESSAY
  }
  if (lower === "parts of speech" || lower === "parts_of_speech" || lower.includes("parts of speech") || lower.includes("পদ নির্ণয়") || lower.includes("পদ নির্নয়")) {
    return QUESTION_TYPES.PARTS_OF_SPEECH
  }
  if (
    lower === "fill in the blanks with clues" ||
    lower.includes("fill in the blanks with clues") ||
    lower.includes("with clues") ||
    lower.includes("words from the box") ||
    lower.includes("from the box") ||
    lower.includes("cloze test with clues") ||
    lower.includes("gap filling with clues") ||
    lower.includes("শূন্যস্থান পূরণ (ক্লুসহ)") ||
    lower.includes("ক্লুসহ")
  ) {
    return QUESTION_TYPES.FILL_IN_THE_BLANKS_WITH_CLUES
  }
  if (
    lower === "right form of verbs" ||
    lower === "right form of verb" ||
    lower === "right forms of verbs" ||
    lower.includes("right form of verb") ||
    lower.includes("right forms of verb") ||
    lower.includes("correct form of verb") ||
    lower.includes("correct form of the verb") ||
    lower.includes("verbs given in the brackets") ||
    lower.includes("verbs in the bracket") ||
    lower.includes("verbs in brackets") ||
    lower.includes("ক্রিয়ার সঠিক রূপ") ||
    lower.includes("রাইট ফর্ম অফ ভার্ব")
  ) {
    return QUESTION_TYPES.RIGHT_FORM_OF_VERBS
  }
  if (
    lower === "changing sentences" ||
    lower === "changing sentence" ||
    lower === "transformation of sentences" ||
    lower === "transformation of sentence" ||
    lower.includes("changing sentence") ||
    lower.includes("change the following sentence") ||
    lower.includes("change the sentence") ||
    lower.includes("as directed in brackets") ||
    lower.includes("directed in bracket") ||
    lower.includes("directed in brackets") ||
    lower.includes("transformation of sentence") ||
    lower.includes("বাক্য রূপান্তর") ||
    lower.includes("বাক্য পরিবর্তন")
  ) {
    return QUESTION_TYPES.CHANGING_SENTENCES
  }
  if (
    lower === "substitution table" ||
    lower.includes("substitution table") ||
    lower.includes("substitution") ||
    lower.includes("meaningful sentences from the following") ||
    lower.includes("প্রতিস্থাপন সারণি") ||
    lower.includes("সাবস্টিটিউশন")
  ) {
    return QUESTION_TYPES.SUBSTITUTION_TABLE
  }
  if (
    lower === "punctuation" ||
    lower === "punctuation and capitalization" ||
    lower === "punctuation and capital letters" ||
    lower === "capitalization" ||
    lower.includes("punctuation") ||
    lower.includes("capitalization") ||
    lower.includes("capital letter") ||
    lower.includes("capital letters") ||
    lower.includes("punctuation marks") ||
    lower.includes("বিরাম চিহ্ন") ||
    lower.includes("যতিচিহ্ন")
  ) {
    return QUESTION_TYPES.PUNCTUATION
  }
  if (
    lower === "short composition" ||
    lower === "composition" ||
    lower.includes("short composition") ||
    lower.includes("composition") ||
    lower.includes("কম্পোজিশন")
  ) {
    return QUESTION_TYPES.SHORT_COMPOSITION
  }

  return null
}

/**
 * Strict type-safe Question Types configuration and utilities.
 */

export const QUESTION_TYPES = {
  MCQ: "MCQ",
  CQ: "CQ",
  SA: "SA",
  CS: "CS",
  PARAGRAPH: "Paragraph",
  LETTER: "Letter",
  APPLICATION: "Application",
  SUMMARY: "Summary",
  ESSENCE: "Essence",
  THOUGHT_EXPANSION: "Thought Expansion",
  NEWS_REPORT: "News report",
  ESSAY: "Essay",
} as const

export type QuestionTypeName = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES]

export const QUESTION_TYPE_CODES = {
  MCQ: "MCQ",
  CQ: "CQ",
  SA: "SA",
  CS: "CS",
  PARAGRAPH: "PARAGRAPH",
  LETTER: "LETTER",
  APPLICATION: "APPLICATION",
  SUMMARY: "SUMMARY",
  ESSENCE: "ESSENCE",
  AMPLIFICATION: "AMPLIFICATION",
  NEWS_REPORT: "NEWS_REPORT",
  ESSAY: "ESSAY",
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

  return null
}

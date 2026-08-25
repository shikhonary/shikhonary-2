/**
 * Global application constants.
 */
export const APP_NAME = "UP Hub"

export const DEFAULT_PAGE_SIZE = 20

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "Admin",
  CHAIRMAN: "Chairman",
  MEMBER: "Member",
  USER: "User",
} as const

export const VERIFICATION_STATUS = {
  VERIFIED: "Verified",
  PENDING: "Pending",
  BLOCKED: "Blocked",
} as const

export const SORT_OPTIONS = [
  {
    label: "Oldest",
    label_bn: "সবচেয়ে পুরানো",
    value: "asc",
  },
  {
    label: "Newest",
    label_bn: "সর্বশেষ",
    value: "desc",
  },
  {
    label: "Name (A - Z)",
    label_bn: "নাম (A - Z)",
    value: "name_asc",
  },
  {
    label: "Name (Z - A)",
    label_bn: "নাম (Z - A)",
    value: "name_desc",
  },
]

// ---------------------------------------------------------------------------
// Subscription & Fiscal Year Systems
// ---------------------------------------------------------------------------

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  SUSPENDED: "SUSPENDED",
  CANCELLED: "CANCELLED",
} as const

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS]

export const BILLING_CYCLE = {
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
} as const

export type BillingCycle = (typeof BILLING_CYCLE)[keyof typeof BILLING_CYCLE]

// ---------------------------------------------------------------------------
// Citizen Registry & Applications
// ---------------------------------------------------------------------------

export const RESIDENT_TYPES = {
  TEMPORARY: "TEMPORARY",
  PERMANENT: "PERMANENT",
} as const
export type ResidentType = (typeof RESIDENT_TYPES)[keyof typeof RESIDENT_TYPES]

export const RELIGIONS = {
  ISLAM: "ISLAM",
  HINDU: "HINDU",
  BUDDHIST: "BUDDHIST",
  CHRISTIAN: "CHRISTIAN",
  OTHER: "OTHER",
} as const
export type Religion = (typeof RELIGIONS)[keyof typeof RELIGIONS]

export const GENDERS = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const
export type Gender = (typeof GENDERS)[keyof typeof GENDERS]

export const MARITAL_STATUSES = {
  UNMARRIED: "UNMARRIED",
  MARRIED: "MARRIED",
  DIVORCED: "DIVORCED",
  WIDOWED: "WIDOWED",
  OTHER: "OTHER",
} as const
export type MaritalStatus = (typeof MARITAL_STATUSES)[keyof typeof MARITAL_STATUSES]

export const CITIZEN_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const
export type CitizenStatus = (typeof CITIZEN_STATUSES)[keyof typeof CITIZEN_STATUSES]

// Localized UI Maps & Options
export const GENDER_MAP: Record<Gender, string> = {
  [GENDERS.MALE]: "পুরুষ",
  [GENDERS.FEMALE]: "মহিলা",
  [GENDERS.OTHER]: "অন্যান্য",
}

export const GENDER_OPTIONS = [
  { value: GENDERS.MALE, label: "পুরুষ" },
  { value: GENDERS.FEMALE, label: "মহিলা" },
  { value: GENDERS.OTHER, label: "অন্যান্য" },
] as const

export const RELIGION_MAP: Record<Religion, string> = {
  [RELIGIONS.ISLAM]: "ইসলাম",
  [RELIGIONS.HINDU]: "হিন্দু",
  [RELIGIONS.BUDDHIST]: "বৌদ্ধ",
  [RELIGIONS.CHRISTIAN]: "খ্রিস্টান",
  [RELIGIONS.OTHER]: "অন্যান্য",
}

export const RELIGION_OPTIONS = [
  { value: RELIGIONS.ISLAM, label: "ইসলাম" },
  { value: RELIGIONS.HINDU, label: "হিন্দু" },
  { value: RELIGIONS.BUDDHIST, label: "বৌদ্ধ" },
  { value: RELIGIONS.CHRISTIAN, label: "খ্রিস্টান" },
  { value: RELIGIONS.OTHER, label: "অন্যান্য" },
] as const

export const MARITAL_STATUS_MAP: Record<MaritalStatus, string> = {
  [MARITAL_STATUSES.UNMARRIED]: "অবিবাহিত",
  [MARITAL_STATUSES.MARRIED]: "বিবাহিত",
  [MARITAL_STATUSES.WIDOWED]: "বিপত্নীক/বিধবা",
  [MARITAL_STATUSES.DIVORCED]: "তালাকপ্রাপ্ত",
  [MARITAL_STATUSES.OTHER]: "অন্যান্য",
}

export const MARITAL_STATUS_OPTIONS = [
  { value: MARITAL_STATUSES.UNMARRIED, label: "অবিবাহিত" },
  { value: MARITAL_STATUSES.MARRIED, label: "বিবাহিত" },
  { value: MARITAL_STATUSES.WIDOWED, label: "বিপত্নীক/বিধবা" },
  { value: MARITAL_STATUSES.DIVORCED, label: "তালাকপ্রাপ্ত" },
] as const

export const RESIDENT_TYPE_MAP: Record<ResidentType, string> = {
  [RESIDENT_TYPES.PERMANENT]: "স্থায়ী",
  [RESIDENT_TYPES.TEMPORARY]: "অস্থায়ী",
}

export const RESIDENT_TYPE_OPTIONS = [
  { value: RESIDENT_TYPES.PERMANENT, label: "স্থায়ী" },
  { value: RESIDENT_TYPES.TEMPORARY, label: "অস্থায়ী" },
] as const

// ---------------------------------------------------------------------------
// Counter System
// ---------------------------------------------------------------------------

export const COUNTER_KEYS = {
  CITIZEN: "CITIZEN",
  CERTIFICATE: "CERTIFICATE",
  STAFF: "STAFF",
  TAX_PAYER: "TAX_PAYER",
  TAX_PAYMENT: "TAX_PAYMENT",
} as const

export type CounterKey = (typeof COUNTER_KEYS)[keyof typeof COUNTER_KEYS]

export const COUNTER_KEY_MAP: Record<CounterKey, string> = {
  [COUNTER_KEYS.CITIZEN]: "নাগরিক সংখ্যা",
  [COUNTER_KEYS.CERTIFICATE]: "সনদ সংখ্যা",
  [COUNTER_KEYS.STAFF]: "স্টাফ সংখ্যা",
  [COUNTER_KEYS.TAX_PAYER]: "করদাতা সংখ্যা",
  [COUNTER_KEYS.TAX_PAYMENT]: "কর আদায় সংখ্যা",
}

export const COUNTER_KEY_OPTIONS = [
  { value: COUNTER_KEYS.CITIZEN, label: "নাগরিক সংখ্যা" },
  { value: COUNTER_KEYS.CERTIFICATE, label: "সনদ সংখ্যা" },
  { value: COUNTER_KEYS.STAFF, label: "স্টাফ সংখ্যা" },
  { value: COUNTER_KEYS.TAX_PAYER, label: "করদাতা সংখ্যা" },
  { value: COUNTER_KEYS.TAX_PAYMENT, label: "কর আদায় সংখ্যা" },
] as const

// ---------------------------------------------------------------------------
// Tenant/Institution Types
// ---------------------------------------------------------------------------

export const TENANT_TYPES = {
  SCHOOL: "SCHOOL",
  COLLEGE: "COLLEGE",
  MADRASAH: "MADRASAH",
  UNIVERSITY: "UNIVERSITY",
} as const

export type TenantType = (typeof TENANT_TYPES)[keyof typeof TENANT_TYPES]

export const TENANT_TYPE_OPTIONS = [
  { value: TENANT_TYPES.SCHOOL, label: "School" },
  { value: TENANT_TYPES.COLLEGE, label: "College" },
  { value: TENANT_TYPES.MADRASAH, label: "Madrasah" },
  { value: TENANT_TYPES.UNIVERSITY, label: "University" },
] as const

// ---------------------------------------------------------------------------
// Academic Subject Groups
// ---------------------------------------------------------------------------

export const ACADEMIC_SUBJECT_GROUPS = {
  GENERAL: "General",
  SCIENCE: "Science",
  HUMANITIES: "Humanities",
  COMMERCE: "Commerce",
} as const

export type AcademicSubjectGroup = (typeof ACADEMIC_SUBJECT_GROUPS)[keyof typeof ACADEMIC_SUBJECT_GROUPS]

export const ACADEMIC_SUBJECT_GROUP_OPTIONS = [
  { value: ACADEMIC_SUBJECT_GROUPS.GENERAL, label: "General" },
  { value: ACADEMIC_SUBJECT_GROUPS.SCIENCE, label: "Science" },
  { value: ACADEMIC_SUBJECT_GROUPS.HUMANITIES, label: "Humanities" },
  { value: ACADEMIC_SUBJECT_GROUPS.COMMERCE, label: "Commerce" },
] as const

// ---------------------------------------------------------------------------
// MCQ Difficulty
// ---------------------------------------------------------------------------

export const QUESTION_DIFFICULTY = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const

export type QuestionDifficulty = (typeof QUESTION_DIFFICULTY)[keyof typeof QUESTION_DIFFICULTY]

export const QUESTION_DIFFICULTY_OPTIONS = [
  { value: QUESTION_DIFFICULTY.EASY, label: "Easy" },
  { value: QUESTION_DIFFICULTY.MEDIUM, label: "Medium" },
  { value: QUESTION_DIFFICULTY.HARD, label: "Hard" },
] as const




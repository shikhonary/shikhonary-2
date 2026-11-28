/**
 * Bengali localization utilities for Shikhonary.
 * Provides numeral conversion, date formatting, and natural language helpers.
 */

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
const EN_DIGITS_MAP: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
}

/**
 * Converts English digits (0-9) to Bengali digits (০-৯).
 */
export function toBengaliDigits(num: number | string | undefined | null): string {
  if (num === undefined || num === null || num === "") return "—"
  return String(num).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)] ?? d)
}

/**
 * Converts Bengali digits (০-৯) to English digits (0-9).
 * Useful when parsing inputs submitted by users with Bengali keyboards.
 */
export function toEnglishDigits(str: string | undefined | null): string {
  if (!str) return ""
  return str.replace(/[০-৯]/g, (d) => EN_DIGITS_MAP[d] ?? d)
}

/**
 * Strict Bangladeshi mobile phone number regex.
 * Valid prefixes: 013, 014, 015, 016, 017, 018, 019 followed by 8 digits (total 11 digits).
 */
export const BD_PHONE_REGEX = /^01[3-9]\d{8}$/

/**
 * Normalizes a Bangladeshi phone number:
 * 1. Converts Bengali numerals to English digits
 * 2. Strips spaces, dashes, brackets, and leading +
 * 3. Removes leading Bangladesh country code 88 if present
 */
export function normalizeBdPhoneNumber(phone: string | undefined | null): string {
  if (!phone) return ""
  let normalized = toEnglishDigits(phone)
  normalized = normalized.replace(/[\s\-()+]/g, "")
  if (normalized.startsWith("8801")) {
    normalized = normalized.slice(2)
  }
  return normalized
}

/**
 * Strictly verifies whether a given phone number is a valid 11-digit Bangladeshi mobile number.
 */
export function isValidBdPhoneNumber(phone: string | undefined | null): boolean {
  const normalized = normalizeBdPhoneNumber(phone)
  return BD_PHONE_REGEX.test(normalized)
}

/**
 * Formats a date into natural Bengali string (e.g., "২৪ অক্টোবর, ২০২৬").
 */
export function formatBengaliDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return "—"
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    if (isNaN(date.getTime())) return "—"
    return date.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "—"
  }
}

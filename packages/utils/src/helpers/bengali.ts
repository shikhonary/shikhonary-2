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

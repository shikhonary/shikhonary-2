export const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

export const formatBengaliPrice = (amount: number): string => {
  return `৳${toBengaliDigits(amount.toLocaleString("en-IN"))}`
}

export const formatBengaliDate = (dateString?: string | Date | null): string => {
  if (!dateString) return "অনির্দিষ্ট"
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return "অনির্দিষ্ট"

  const monthsBn = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ]

  const day = toBengaliDigits(d.getDate())
  const month = monthsBn[d.getMonth()]
  const year = toBengaliDigits(d.getFullYear())

  return `${day} ${month}, ${year}`
}

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

export const naturalizePlanName = (name?: string | null): string => {
  if (!name) return "শিক্ষক প্যাক"
  const trimmed = name.trim()
  const lower = trimmed.toLowerCase()
  if (lower === "teacher" || lower === "teacher pack" || lower.includes("teacher")) {
    return "শিক্ষক প্যাক"
  }
  if (lower === "academy" || lower === "academy pack" || lower.includes("academy")) {
    return "একাডেমি প্যাক"
  }
  if (lower === "campus" || lower === "campus pack" || lower.includes("campus")) {
    return "ক্যাম্পাস প্যাক"
  }
  if (lower === "free" || lower === "free pack" || lower.includes("free")) {
    return "ফ্রি প্যাক"
  }
  return trimmed
}

export const naturalizePlanDescription = (
  planName?: string | null,
  description?: string | null
): string => {
  const isEnglish = description && /^[A-Za-z0-9\s.,!?:;'"()-]+$/.test(description.trim())
  if (!description || isEnglish) {
    const lower = (planName || "").toLowerCase()
    if (lower.includes("teacher")) {
      return "ব্যক্তিগত শিক্ষক ও গৃহশিক্ষকদের জন্য আদর্শ প্রশ্নপত্র ও পরীক্ষা প্যাক"
    }
    if (lower.includes("academy")) {
      return "কোচিং সেন্টার ও একাডেমি প্রতিষ্ঠানের জন্য সম্পূর্ণ প্রশ্নভাণ্ডার ও ওএমআর প্যাকেজ"
    }
    if (lower.includes("campus")) {
      return "স্কুল, কলেজ ও বৃহৎ শিক্ষাপ্রতিষ্ঠানের জন্য কাস্টম ব্র্যান্ডিং ও আনলিমিটেড রিসোর্স প্যাক"
    }
    return "ডিজিটাল প্রশ্নপত্র তৈরি, ওএমআর ও অনলাইন পরীক্ষার সম্পূর্ণ সমাধান"
  }
  return description
}

export const formatSubscriptionStatus = (
  status?: string | null
): { label: string; color: string } => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return {
        label: "সক্রিয়",
        color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      }
    case "TRIALING":
      return {
        label: "ট্রায়াল মোড",
        color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      }
    case "EXPIRED":
      return {
        label: "মেয়াদোত্তীর্ণ",
        color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
      }
    case "CANCELLED":
    case "CANCELED":
      return {
        label: "বাতিলকৃত",
        color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
      }
    case "PAST_DUE":
      return {
        label: "বিল বকেয়া",
        color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      }
    default:
      return {
        label: "অপেক্ষমান",
        color: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
      }
  }
}

export const formatTxType = (type?: string | null): string => {
  if (!type) return "লেনদেন"
  const upper = type.toUpperCase()
  const map: Record<string, string> = {
    USAGE: "প্রশ্ন তৈরিতে ব্যবহার",
    TOPUP: "ক্রেডিট রিচার্জ",
    RECHARGE: "ক্রেডিট রিচার্জ",
    BONUS: "ফ্রি বোনাস ক্রেডিট",
    MONTHLY_REFRESH: "মাসিক সাবস্ক্রিপশন ক্রেডিট",
    REFUND: "রিফান্ড ফেরত",
    PURCHASE: "প্যাকেজ ক্রয়",
    ADJUSTMENT: "সমন্বয়",
  }
  return map[upper] || type
}

export const formatPaymentMethod = (method?: string | null): string => {
  if (!method) return "অনলাইন পেমেন্ট"
  const lower = method.toLowerCase()
  if (lower.includes("bkash")) return "বিকাশ"
  if (lower.includes("nagad")) return "নগদ"
  if (lower.includes("rocket")) return "রকেট"
  if (lower.includes("card") || lower.includes("visa") || lower.includes("mastercard")) return "কার্ড"
  if (lower.includes("bank") || lower.includes("beftn") || lower.includes("npsb")) return "ব্যাংক ট্রান্সফার"
  if (lower.includes("citytouch") || lower.includes("ib")) return "ইন্টারনেট ব্যাংকিং"
  return method
}

export const formatInvoiceStatus = (
  status?: string | null
): { label: string; color: string; isPaid: boolean } => {
  switch (status?.toUpperCase()) {
    case "PAID":
      return {
        label: "পরিশোধিত",
        color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        isPaid: true,
      }
    case "PENDING":
      return {
        label: "অপেক্ষমান",
        color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
        isPaid: false,
      }
    case "FAILED":
      return {
        label: "ব্যর্থ",
        color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
        isPaid: false,
      }
    default:
      return {
        label: "অপেক্ষমান",
        color: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
        isPaid: false,
      }
  }
}

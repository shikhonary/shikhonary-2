export const JUKTOBORNO_SOURCE_OPTIONS = [
  { value: "গাইড বুক", label: "গাইড বুক" },
  { value: "বৃত্তি সহায়িকা", label: "বৃত্তি সহায়িকা" },
  { value: "এনসিটিবি টেক্সটবুক", label: "এনসিটিবি টেক্সটবুক" },
  { value: "বোর্ড প্রশ্ন", label: "বোর্ড প্রশ্ন" },
  { value: "মডেল টেস্ট", label: "মডেল টেস্ট" },
  { value: "শ্রেণি পরীক্ষা", label: "শ্রেণি পরীক্ষা" },
  { value: "অন্যান্য", label: "অন্যান্য" },
] as const

export type JuktobornoSource = (typeof JUKTOBORNO_SOURCE_OPTIONS)[number]["value"]

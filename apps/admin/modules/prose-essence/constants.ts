export const PROSE_ESSENCE_SOURCE_OPTIONS = [
  { value: "গাইড বুক", label: "গাইড বুক" },
  { value: "বৃত্তি সহায়িকা", label: "বৃত্তি সহায়িকা" },
  { value: "শিক্ষা বোর্ড", label: "শিক্ষা বোর্ড" },
  { value: "পাঠ্যবই", label: "পাঠ্যবই" },
] as const

export type ProseEssenceSource = (typeof PROSE_ESSENCE_SOURCE_OPTIONS)[number]["value"]

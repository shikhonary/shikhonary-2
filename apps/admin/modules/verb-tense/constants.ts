export const VERB_TENSE_SOURCE_OPTIONS = [
  { value: "গাইড বুক", label: "গাইড বুক" },
  { value: "পাঠ্যবই", label: "পাঠ্যবই" },
  { value: "গ্রামার বই", label: "গ্রামার বই" },
  { value: "বোর্ড প্রশ্ন", label: "বোর্ড প্রশ্ন" },
  { value: "বৃত্তি সহায়িকা", label: "বৃত্তি সহায়িকা" },
] as const

export type VerbTenseSource = (typeof VERB_TENSE_SOURCE_OPTIONS)[number]["value"]

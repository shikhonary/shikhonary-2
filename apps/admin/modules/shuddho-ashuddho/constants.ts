export const SHUDDHO_ASHUDDHO_SOURCE_OPTIONS = [
  { value: "গাইড বুক", label: "গাইড বুক" },
  { value: "বোর্ড বই", label: "বোর্ড বই" },
  { value: "বৃত্তি সহায়িকা", label: "বৃত্তি সহায়িকা" },
] as const

export type ShuddhoAshuddhoSource = (typeof SHUDDHO_ASHUDDHO_SOURCE_OPTIONS)[number]["value"]

export const SHUDDHO_ASHUDDHO_ANSWER_OPTIONS = [
  { value: "শুদ্ধ", label: "শুদ্ধ (Correct)" },
  { value: "অশুদ্ধ", label: "অশুদ্ধ (Incorrect)" },
] as const

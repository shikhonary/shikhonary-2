export const MAKE_SENTENCES_SOURCE_OPTIONS = [
  { value: "গাইড বুক", label: "গাইড বুক" },
  { value: "বৃত্তি সহায়িকা", label: "বৃত্তি সহায়িকা" },
] as const

export type MakeSentencesSource = (typeof MAKE_SENTENCES_SOURCE_OPTIONS)[number]["value"]

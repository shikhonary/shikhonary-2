export const FILL_IN_THE_BLANKS_WITHOUT_CLUES_SOURCE_OPTIONS = [
  { value: "গাইড বুক", label: "গাইড বুক" },
  { value: "বৃত্তি সহায়িকা", label: "বৃত্তি সহায়িকা" },
] as const

export type FillInTheBlanksWithoutCluesSource =
  (typeof FILL_IN_THE_BLANKS_WITHOUT_CLUES_SOURCE_OPTIONS)[number]["value"]

export const DEFAULT_SOURCE = "গাইড বুক"

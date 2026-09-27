export const DESCRIPTIVE_QUESTION_SOURCE_OPTIONS = [
  { value: "গাইড বুক", label: "গাইড বুক" },
  { value: "বৃত্তি সহায়িকা", label: "বৃত্তি সহায়িকা" },
] as const

export type DescriptiveQuestionSource = (typeof DESCRIPTIVE_QUESTION_SOURCE_OPTIONS)[number]["value"]

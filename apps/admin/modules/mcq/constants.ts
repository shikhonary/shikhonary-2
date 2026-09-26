export const MCQ_SOURCE_OPTIONS = [
  { value: "গাইড বুক", label: "গাইড বুক" },
  { value: "বৃত্তি সহায়িকা", label: "বৃত্তি সহায়িকা" },
] as const

export type McqSource = (typeof MCQ_SOURCE_OPTIONS)[number]["value"]

export const DEFAULT_SOURCE = "গাইড বুক"

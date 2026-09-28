export const SADHU_TO_CHOLITO_SOURCE_OPTIONS = [
  { value: "গাইড বুক", label: "গাইড বুক" },
  { value: "বৃত্তি সহায়িকা", label: "বৃত্তি সহায়িকা" },
] as const

export type SadhuToCholitoSource = (typeof SADHU_TO_CHOLITO_SOURCE_OPTIONS)[number]["value"]

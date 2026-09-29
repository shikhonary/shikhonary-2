export const EK_KOTHAY_PROKASH_SOURCE_OPTIONS = [
  { value: "গাইড বুক", label: "গাইড বুক" },
  { value: "বৃত্তি সহায়িকা", label: "বৃত্তি সহায়িকা" },
] as const

export type EkKothayProkashSource = (typeof EK_KOTHAY_PROKASH_SOURCE_OPTIONS)[number]["value"]

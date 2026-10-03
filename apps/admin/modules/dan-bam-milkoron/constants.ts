export const DAN_BAM_MILKORON_SOURCE_OPTIONS = [
  { value: "গাইড বুক", label: "গাইড বুক" },
  { value: "বোর্ড বই", label: "বোর্ড বই" },
  { value: "বৃত্তি সহায়িকা", label: "বৃত্তি সহায়িকা" },
] as const

export type DanBamMilkoronSource = (typeof DAN_BAM_MILKORON_SOURCE_OPTIONS)[number]["value"]

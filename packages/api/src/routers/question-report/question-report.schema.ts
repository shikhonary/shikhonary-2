import { z } from "zod"

export const REPORT_TYPES = [
  "INCORRECT_ANSWER",
  "TYPO_ERROR",
  "INCOMPLETE_QUESTION",
  "MISSING_DIAGRAM",
  "OUT_OF_SYLLABUS",
  "DUPLICATE",
  "OTHER",
] as const

export type ReportType = (typeof REPORT_TYPES)[number]

export const createQuestionReportSchema = z.object({
  entityType: z.string().min(1, "Question type is required"),
  entityId: z.string().min(1, "Question ID is required"),
  reportType: z.enum(REPORT_TYPES),
  description: z
    .string()
    .min(5, "সমস্যার বিবরণ অন্তত ৫ অক্ষরের হতে হবে")
    .max(1000, "বিবরণ ১০০০ অক্ষরের মধ্যে রাখুন"),
})

export type CreateQuestionReportInput = z.infer<typeof createQuestionReportSchema>

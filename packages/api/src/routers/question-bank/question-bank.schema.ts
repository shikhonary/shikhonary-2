import { z } from "zod"

export const listQuestionBankSchema = z.object({
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  search: z.string().optional(),
  board: z.string().optional(),
  sort: z.enum(["newest", "oldest"]).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

export type ListQuestionBankInput = z.infer<typeof listQuestionBankSchema>

export const getQuestionDetailsSchema = z.object({
  id: z.string(),
  category: z.string(),
})

export type GetQuestionDetailsInput = z.infer<typeof getQuestionDetailsSchema>

export const getQuestionBankStatsSchema = z.object({
  classId: z.string().optional(),
  subjectId: z.string().optional(),
})

export type GetQuestionBankStatsInput = z.infer<typeof getQuestionBankStatsSchema>

export const getFilterOptionsSchema = z.object({
  classId: z.string().optional(),
  subjectId: z.string().optional(),
})

export type GetFilterOptionsInput = z.infer<typeof getFilterOptionsSchema>

export const getClassDetailsSchema = z.object({
  classId: z.string().min(1, "Class ID is required"),
})

export type GetClassDetailsInput = z.infer<typeof getClassDetailsSchema>

export const getSubjectDetailsSchema = z.object({
  classId: z.string().min(1, "Class ID is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
})

export type GetSubjectDetailsInput = z.infer<typeof getSubjectDetailsSchema>


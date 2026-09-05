import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listNewsReportsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListNewsReportsInput = z.infer<typeof listNewsReportsSchema>

export const newsReportStatsSchema = z.object({
  subjectId: z.string().optional(),
})

export type NewsReportStatsInput = z.infer<typeof newsReportStatsSchema>

export const getNewsReportSchema = idSchema
export type GetNewsReportInput = z.infer<typeof getNewsReportSchema>

export const createNewsReportSchema = z.object({
  title: z.string().min(1, "Title is required"),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
})

export type CreateNewsReportInput = z.infer<typeof createNewsReportSchema>

export const updateNewsReportSchema = createNewsReportSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateNewsReportInput = z.infer<typeof updateNewsReportSchema>

export const deleteNewsReportSchema = idSchema
export type DeleteNewsReportInput = z.infer<typeof deleteNewsReportSchema>

export const bulkDeleteNewsReportsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteNewsReportsInput = z.infer<typeof bulkDeleteNewsReportsSchema>

export const importNewsReportsSchema = z.object({
  newsReports: z.array(createNewsReportSchema).min(1, "At least one News Report is required"),
})

export type ImportNewsReportsInput = z.infer<typeof importNewsReportsSchema>

import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listSummariesSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListSummariesInput = z.infer<typeof listSummariesSchema>

export const summaryStatsSchema = z.object({
  subjectId: z.string().optional(),
})

export type SummaryStatsInput = z.infer<typeof summaryStatsSchema>

export const getSummarySchema = idSchema
export type GetSummaryInput = z.infer<typeof getSummarySchema>

export const createSummarySchema = z.object({
  title: z.string().min(1, "Title is required"),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
})

export type CreateSummaryInput = z.infer<typeof createSummarySchema>

export const updateSummarySchema = createSummarySchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateSummaryInput = z.infer<typeof updateSummarySchema>

export const deleteSummarySchema = idSchema
export type DeleteSummaryInput = z.infer<typeof deleteSummarySchema>

export const bulkDeleteSummariesSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteSummariesInput = z.infer<typeof bulkDeleteSummariesSchema>

export const importSummariesSchema = z.object({
  summaries: z.array(createSummarySchema).min(1, "At least one Summary is required"),
})

export type ImportSummariesInput = z.infer<typeof importSummariesSchema>

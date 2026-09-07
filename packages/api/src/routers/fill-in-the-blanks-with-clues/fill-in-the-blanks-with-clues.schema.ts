import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listFillInTheBlanksWithCluesSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListFillInTheBlanksWithCluesInput = z.infer<typeof listFillInTheBlanksWithCluesSchema>

export const fillInTheBlanksWithCluesStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
})

export type FillInTheBlanksWithCluesStatsInput = z.infer<typeof fillInTheBlanksWithCluesStatsSchema>

export const getFillInTheBlanksWithCluesSchema = idSchema
export type GetFillInTheBlanksWithCluesInput = z.infer<typeof getFillInTheBlanksWithCluesSchema>

export const createFillInTheBlanksWithCluesSchema = z.object({
  content: z.string().min(1, "Content is required"),
  clues: z.array(z.string()).default([]),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
})

export type CreateFillInTheBlanksWithCluesInput = z.infer<typeof createFillInTheBlanksWithCluesSchema>

export const updateFillInTheBlanksWithCluesSchema = createFillInTheBlanksWithCluesSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateFillInTheBlanksWithCluesInput = z.infer<typeof updateFillInTheBlanksWithCluesSchema>

export const deleteFillInTheBlanksWithCluesSchema = idSchema
export type DeleteFillInTheBlanksWithCluesInput = z.infer<typeof deleteFillInTheBlanksWithCluesSchema>

export const bulkDeleteFillInTheBlanksWithCluesSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteFillInTheBlanksWithCluesInput = z.infer<typeof bulkDeleteFillInTheBlanksWithCluesSchema>

export const importFillInTheBlanksWithCluesSchema = z.object({
  items: z.array(createFillInTheBlanksWithCluesSchema).min(1, "At least one item is required"),
})

export type ImportFillInTheBlanksWithCluesInput = z.infer<typeof importFillInTheBlanksWithCluesSchema>

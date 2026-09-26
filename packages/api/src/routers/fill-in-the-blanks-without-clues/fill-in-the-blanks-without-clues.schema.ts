import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listFillInTheBlanksWithoutCluesSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  difficulty: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListFillInTheBlanksWithoutCluesInput = z.infer<typeof listFillInTheBlanksWithoutCluesSchema>

export const fillInTheBlanksWithoutCluesStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type FillInTheBlanksWithoutCluesStatsInput = z.infer<typeof fillInTheBlanksWithoutCluesStatsSchema>

export const getFillInTheBlanksWithoutCluesSchema = idSchema
export type GetFillInTheBlanksWithoutCluesInput = z.infer<typeof getFillInTheBlanksWithoutCluesSchema>

export const createFillInTheBlanksWithoutCluesSchema = z.object({
  content: z.string().optional().nullable(),
  options: z.array(z.string()).optional().default([]),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
})

export type CreateFillInTheBlanksWithoutCluesInput = z.infer<typeof createFillInTheBlanksWithoutCluesSchema>

export const updateFillInTheBlanksWithoutCluesSchema = createFillInTheBlanksWithoutCluesSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateFillInTheBlanksWithoutCluesInput = z.infer<typeof updateFillInTheBlanksWithoutCluesSchema>

export const deleteFillInTheBlanksWithoutCluesSchema = idSchema
export type DeleteFillInTheBlanksWithoutCluesInput = z.infer<typeof deleteFillInTheBlanksWithoutCluesSchema>

export const bulkDeleteFillInTheBlanksWithoutCluesSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteFillInTheBlanksWithoutCluesInput = z.infer<typeof bulkDeleteFillInTheBlanksWithoutCluesSchema>

export const importFillInTheBlanksWithoutCluesSchema = z.object({
  source: z.string().optional(),
  session: z.string().optional(),
  items: z.array(createFillInTheBlanksWithoutCluesSchema).min(1, "At least one item is required"),
})

export type ImportFillInTheBlanksWithoutCluesInput = z.infer<typeof importFillInTheBlanksWithoutCluesSchema>

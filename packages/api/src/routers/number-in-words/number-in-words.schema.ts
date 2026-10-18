import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listNumberInWordsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  wordMeaningId: z.string().optional(),
  difficulty: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  board: z.string().optional(),
  isActive: z.boolean().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListNumberInWordsInput = z.infer<typeof listNumberInWordsSchema>

export const numberInWordsStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  wordMeaningId: z.string().optional(),
})

export type NumberInWordsStatsInput = z.infer<typeof numberInWordsStatsSchema>

export const getNumberInWordsSchema = idSchema
export type GetNumberInWordsInput = z.infer<typeof getNumberInWordsSchema>

export const createNumberInWordsSchema = z.object({
  number: z.string().min(1, "Number is required"),
  inWords: z.string().min(1, "Number in words is required"),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  wordMeaningId: z.string().optional().nullable(),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export type CreateNumberInWordsInput = z.infer<typeof createNumberInWordsSchema>

export const updateNumberInWordsSchema = createNumberInWordsSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateNumberInWordsInput = z.infer<typeof updateNumberInWordsSchema>

export const toggleNumberInWordsActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleNumberInWordsActiveInput = z.infer<typeof toggleNumberInWordsActiveSchema>

export const deleteNumberInWordsSchema = idSchema
export type DeleteNumberInWordsInput = z.infer<typeof deleteNumberInWordsSchema>

export const bulkDeleteNumberInWordsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteNumberInWordsInput = z.infer<typeof bulkDeleteNumberInWordsSchema>

export const importNumberInWordsSchema = z.object({
  questions: z.array(createNumberInWordsSchema).min(1, "At least one entry is required"),
})

export type ImportNumberInWordsInput = z.infer<typeof importNumberInWordsSchema>

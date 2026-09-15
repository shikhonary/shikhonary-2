import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listWordMeaningSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListWordMeaningInput = z.infer<typeof listWordMeaningSchema>

export const wordMeaningStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type WordMeaningStatsInput = z.infer<typeof wordMeaningStatsSchema>

export const getWordMeaningSchema = idSchema
export type GetWordMeaningInput = z.infer<typeof getWordMeaningSchema>

export const createWordMeaningSchema = z.object({
  word: z.string().min(1, "Word is required"),
  meaning: z.string().optional().nullable(),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
})

export type CreateWordMeaningInput = z.infer<typeof createWordMeaningSchema>

export const updateWordMeaningSchema = createWordMeaningSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateWordMeaningInput = z.infer<typeof updateWordMeaningSchema>

export const deleteWordMeaningSchema = idSchema
export type DeleteWordMeaningInput = z.infer<typeof deleteWordMeaningSchema>

export const bulkDeleteWordMeaningSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteWordMeaningInput = z.infer<typeof bulkDeleteWordMeaningSchema>

export const importWordMeaningSchema = z.object({
  questions: z.array(createWordMeaningSchema).min(1, "At least one word meaning entry is required"),
})

export type ImportWordMeaningInput = z.infer<typeof importWordMeaningSchema>

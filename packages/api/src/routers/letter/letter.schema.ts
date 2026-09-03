import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listLettersSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListLettersInput = z.infer<typeof listLettersSchema>

export const letterStatsSchema = z.object({
  subjectId: z.string().optional(),
})

export type LetterStatsInput = z.infer<typeof letterStatsSchema>

export const getLetterSchema = idSchema
export type GetLetterInput = z.infer<typeof getLetterSchema>

export const createLetterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
})

export type CreateLetterInput = z.infer<typeof createLetterSchema>

export const updateLetterSchema = createLetterSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateLetterInput = z.infer<typeof updateLetterSchema>

export const deleteLetterSchema = idSchema
export type DeleteLetterInput = z.infer<typeof deleteLetterSchema>

export const bulkDeleteLettersSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteLettersInput = z.infer<typeof bulkDeleteLettersSchema>

export const importLettersSchema = z.object({
  letters: z.array(createLetterSchema).min(1, "At least one Letter is required"),
})

export type ImportLettersInput = z.infer<typeof importLettersSchema>

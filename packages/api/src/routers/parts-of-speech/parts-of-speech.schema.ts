import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listPartsOfSpeechSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListPartsOfSpeechInput = z.infer<typeof listPartsOfSpeechSchema>

export const partsOfSpeechStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
})

export type PartsOfSpeechStatsInput = z.infer<typeof partsOfSpeechStatsSchema>

export const getPartsOfSpeechSchema = idSchema
export type GetPartsOfSpeechInput = z.infer<typeof getPartsOfSpeechSchema>

export const createPartsOfSpeechSchema = z.object({
  content: z.string().min(1, "Content is required"),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
})

export type CreatePartsOfSpeechInput = z.infer<typeof createPartsOfSpeechSchema>

export const updatePartsOfSpeechSchema = createPartsOfSpeechSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdatePartsOfSpeechInput = z.infer<typeof updatePartsOfSpeechSchema>

export const deletePartsOfSpeechSchema = idSchema
export type DeletePartsOfSpeechInput = z.infer<typeof deletePartsOfSpeechSchema>

export const bulkDeletePartsOfSpeechSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeletePartsOfSpeechInput = z.infer<typeof bulkDeletePartsOfSpeechSchema>

export const importPartsOfSpeechSchema = z.object({
  partsOfSpeech: z.array(createPartsOfSpeechSchema).min(1, "At least one Parts of Speech item is required"),
})

export type ImportPartsOfSpeechInput = z.infer<typeof importPartsOfSpeechSchema>

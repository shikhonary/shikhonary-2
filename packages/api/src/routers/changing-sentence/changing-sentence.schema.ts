import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listChangingSentencesSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListChangingSentencesInput = z.infer<typeof listChangingSentencesSchema>

export const changingSentencesStatsSchema = z.object({
  subjectId: z.string().optional(),
})

export type ChangingSentencesStatsInput = z.infer<typeof changingSentencesStatsSchema>

export const getChangingSentenceSchema = idSchema
export type GetChangingSentenceInput = z.infer<typeof getChangingSentenceSchema>

export const createChangingSentenceSchema = z.object({
  content: z.string().optional().nullable(),
  options: z.array(z.string()).optional().default([]),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
})

export type CreateChangingSentenceInput = z.infer<typeof createChangingSentenceSchema>

export const updateChangingSentenceSchema = createChangingSentenceSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateChangingSentenceInput = z.infer<typeof updateChangingSentenceSchema>

export const deleteChangingSentenceSchema = idSchema
export type DeleteChangingSentenceInput = z.infer<typeof deleteChangingSentenceSchema>

export const bulkDeleteChangingSentencesSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteChangingSentencesInput = z.infer<typeof bulkDeleteChangingSentencesSchema>

export const importChangingSentencesSchema = z.object({
  changingSentences: z.array(createChangingSentenceSchema).min(1, "At least one Changing Sentence item is required"),
})

export type ImportChangingSentencesInput = z.infer<typeof importChangingSentencesSchema>

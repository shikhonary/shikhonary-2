import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listSynonymSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListSynonymInput = z.infer<typeof listSynonymSchema>

export const synonymStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type SynonymStatsInput = z.infer<typeof synonymStatsSchema>

export const getSynonymSchema = idSchema
export type GetSynonymInput = z.infer<typeof getSynonymSchema>

export const createSynonymSchema = z.object({
  word: z.string().min(1, "Word text is required"),
  synonymWord: z.string().optional().nullable(),
  synonyms: z.array(z.string()).optional().default([]),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
})

export type CreateSynonymInput = z.infer<typeof createSynonymSchema>

export const updateSynonymSchema = createSynonymSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateSynonymInput = z.infer<typeof updateSynonymSchema>

export const deleteSynonymSchema = idSchema
export type DeleteSynonymInput = z.infer<typeof deleteSynonymSchema>

export const bulkDeleteSynonymSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteSynonymInput = z.infer<typeof bulkDeleteSynonymSchema>

export const importSynonymSchema = z.object({
  questions: z.array(createSynonymSchema).min(1, "At least one Synonym entry is required"),
})

export type ImportSynonymInput = z.infer<typeof importSynonymSchema>

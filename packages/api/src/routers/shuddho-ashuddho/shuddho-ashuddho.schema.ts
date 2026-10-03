import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listShuddhoAshuddhoSchema = paginationSchema.extend({
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

export type ListShuddhoAshuddhoInput = z.infer<typeof listShuddhoAshuddhoSchema>

export const shuddhoAshuddhoStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type ShuddhoAshuddhoStatsInput = z.infer<typeof shuddhoAshuddhoStatsSchema>

export const getShuddhoAshuddhoSchema = idSchema
export type GetShuddhoAshuddhoInput = z.infer<typeof getShuddhoAshuddhoSchema>

export const createShuddhoAshuddhoSchema = z.object({
  sentence: z.string().min(1, "Sentence is required"),
  answer: z.string().optional().nullable(),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
})

export type CreateShuddhoAshuddhoInput = z.infer<typeof createShuddhoAshuddhoSchema>

export const updateShuddhoAshuddhoSchema = createShuddhoAshuddhoSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateShuddhoAshuddhoInput = z.infer<typeof updateShuddhoAshuddhoSchema>

export const deleteShuddhoAshuddhoSchema = idSchema
export type DeleteShuddhoAshuddhoInput = z.infer<typeof deleteShuddhoAshuddhoSchema>

export const bulkDeleteShuddhoAshuddhoSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteShuddhoAshuddhoInput = z.infer<typeof bulkDeleteShuddhoAshuddhoSchema>

export const importShuddhoAshuddhoSchema = z.object({
  questions: z.array(createShuddhoAshuddhoSchema).min(1, "At least one question entry is required"),
})

export type ImportShuddhoAshuddhoInput = z.infer<typeof importShuddhoAshuddhoSchema>

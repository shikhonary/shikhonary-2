import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listPoemEssenceSchema = paginationSchema.extend({
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

export type ListPoemEssenceInput = z.infer<typeof listPoemEssenceSchema>

export const poemEssenceStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type PoemEssenceStatsInput = z.infer<typeof poemEssenceStatsSchema>

export const getPoemEssenceSchema = idSchema
export type GetPoemEssenceInput = z.infer<typeof getPoemEssenceSchema>

export const createPoemEssenceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  poemStanza: z.string().optional().nullable(),
  mainTheme: z.string().optional().nullable(),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
})

export type CreatePoemEssenceInput = z.infer<typeof createPoemEssenceSchema>

export const updatePoemEssenceSchema = createPoemEssenceSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdatePoemEssenceInput = z.infer<typeof updatePoemEssenceSchema>

export const deletePoemEssenceSchema = idSchema
export type DeletePoemEssenceInput = z.infer<typeof deletePoemEssenceSchema>

export const bulkDeletePoemEssenceSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeletePoemEssenceInput = z.infer<typeof bulkDeletePoemEssenceSchema>

export const importPoemEssenceSchema = z.object({
  questions: z.array(createPoemEssenceSchema).min(1, "At least one poem essence entry is required"),
})

export type ImportPoemEssenceInput = z.infer<typeof importPoemEssenceSchema>

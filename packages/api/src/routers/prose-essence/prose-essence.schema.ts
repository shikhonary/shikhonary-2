import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listProseEssenceSchema = paginationSchema.extend({
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

export type ListProseEssenceInput = z.infer<typeof listProseEssenceSchema>

export const proseEssenceStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type ProseEssenceStatsInput = z.infer<typeof proseEssenceStatsSchema>

export const getProseEssenceSchema = idSchema
export type GetProseEssenceInput = z.infer<typeof getProseEssenceSchema>

export const createProseEssenceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  prosePassage: z.string().optional().nullable(),
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

export type CreateProseEssenceInput = z.infer<typeof createProseEssenceSchema>

export const updateProseEssenceSchema = createProseEssenceSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateProseEssenceInput = z.infer<typeof updateProseEssenceSchema>

export const deleteProseEssenceSchema = idSchema
export type DeleteProseEssenceInput = z.infer<typeof deleteProseEssenceSchema>

export const bulkDeleteProseEssenceSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteProseEssenceInput = z.infer<typeof bulkDeleteProseEssenceSchema>

export const importProseEssenceSchema = z.object({
  questions: z.array(createProseEssenceSchema).min(1, "At least one prose essence entry is required"),
})

export type ImportProseEssenceInput = z.infer<typeof importProseEssenceSchema>

import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listGenderChangeSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListGenderChangeInput = z.infer<typeof listGenderChangeSchema>

export const genderChangeStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type GenderChangeStatsInput = z.infer<typeof genderChangeStatsSchema>

export const getGenderChangeSchema = idSchema
export type GetGenderChangeInput = z.infer<typeof getGenderChangeSchema>

export const createGenderChangeSchema = z.object({
  word: z.string().min(1, "Word text is required"),
  genderWord: z.string().optional().nullable(),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
})

export type CreateGenderChangeInput = z.infer<typeof createGenderChangeSchema>

export const updateGenderChangeSchema = createGenderChangeSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateGenderChangeInput = z.infer<typeof updateGenderChangeSchema>

export const deleteGenderChangeSchema = idSchema
export type DeleteGenderChangeInput = z.infer<typeof deleteGenderChangeSchema>

export const bulkDeleteGenderChangeSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteGenderChangeInput = z.infer<typeof bulkDeleteGenderChangeSchema>

export const importGenderChangeSchema = z.object({
  questions: z.array(createGenderChangeSchema).min(1, "At least one Gender Change entry is required"),
})

export type ImportGenderChangeInput = z.infer<typeof importGenderChangeSchema>

import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listEssencesSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListEssencesInput = z.infer<typeof listEssencesSchema>

export const essenceStatsSchema = z.object({
  subjectId: z.string().optional(),
})

export type EssenceStatsInput = z.infer<typeof essenceStatsSchema>

export const getEssenceSchema = idSchema
export type GetEssenceInput = z.infer<typeof getEssenceSchema>

export const createEssenceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
})

export type CreateEssenceInput = z.infer<typeof createEssenceSchema>

export const updateEssenceSchema = createEssenceSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateEssenceInput = z.infer<typeof updateEssenceSchema>

export const deleteEssenceSchema = idSchema
export type DeleteEssenceInput = z.infer<typeof deleteEssenceSchema>

export const bulkDeleteEssencesSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteEssencesInput = z.infer<typeof bulkDeleteEssencesSchema>

export const importEssencesSchema = z.object({
  essences: z.array(createEssenceSchema).min(1, "At least one Essence is required"),
})

export type ImportEssencesInput = z.infer<typeof importEssencesSchema>

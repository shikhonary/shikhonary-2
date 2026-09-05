import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listEssaysSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListEssaysInput = z.infer<typeof listEssaysSchema>

export const essayStatsSchema = z.object({
  subjectId: z.string().optional(),
})

export type EssayStatsInput = z.infer<typeof essayStatsSchema>

export const getEssaySchema = idSchema
export type GetEssayInput = z.infer<typeof getEssaySchema>

export const createEssaySchema = z.object({
  title: z.string().min(1, "Title is required"),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
})

export type CreateEssayInput = z.infer<typeof createEssaySchema>

export const updateEssaySchema = createEssaySchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateEssayInput = z.infer<typeof updateEssaySchema>

export const deleteEssaySchema = idSchema
export type DeleteEssayInput = z.infer<typeof deleteEssaySchema>

export const bulkDeleteEssaysSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteEssaysInput = z.infer<typeof bulkDeleteEssaysSchema>

export const importEssaysSchema = z.object({
  essays: z.array(createEssaySchema).min(1, "At least one Essay is required"),
})

export type ImportEssaysInput = z.infer<typeof importEssaysSchema>

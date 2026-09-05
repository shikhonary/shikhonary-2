import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listThoughtExpansionsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListThoughtExpansionsInput = z.infer<typeof listThoughtExpansionsSchema>

export const thoughtExpansionStatsSchema = z.object({
  subjectId: z.string().optional(),
})

export type ThoughtExpansionStatsInput = z.infer<typeof thoughtExpansionStatsSchema>

export const getThoughtExpansionSchema = idSchema
export type GetThoughtExpansionInput = z.infer<typeof getThoughtExpansionSchema>

export const createThoughtExpansionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
})

export type CreateThoughtExpansionInput = z.infer<typeof createThoughtExpansionSchema>

export const updateThoughtExpansionSchema = createThoughtExpansionSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateThoughtExpansionInput = z.infer<typeof updateThoughtExpansionSchema>

export const deleteThoughtExpansionSchema = idSchema
export type DeleteThoughtExpansionInput = z.infer<typeof deleteThoughtExpansionSchema>

export const bulkDeleteThoughtExpansionsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteThoughtExpansionsInput = z.infer<typeof bulkDeleteThoughtExpansionsSchema>

export const importThoughtExpansionsSchema = z.object({
  thoughtExpansions: z.array(createThoughtExpansionSchema).min(1, "At least one Thought Expansion is required"),
})

export type ImportThoughtExpansionsInput = z.infer<typeof importThoughtExpansionsSchema>

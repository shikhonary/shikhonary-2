import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listShortCompositionSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListShortCompositionInput = z.infer<typeof listShortCompositionSchema>

export const shortCompositionStatsSchema = z.object({
  subjectId: z.string().optional(),
})

export type ShortCompositionStatsInput = z.infer<typeof shortCompositionStatsSchema>

export const getShortCompositionSchema = idSchema
export type GetShortCompositionInput = z.infer<typeof getShortCompositionSchema>

export const createShortCompositionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  wordLimit: z.number().int().positive().optional().nullable(),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
})

export type CreateShortCompositionInput = z.infer<typeof createShortCompositionSchema>

export const updateShortCompositionSchema = createShortCompositionSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateShortCompositionInput = z.infer<typeof updateShortCompositionSchema>

export const deleteShortCompositionSchema = idSchema
export type DeleteShortCompositionInput = z.infer<typeof deleteShortCompositionSchema>

export const bulkDeleteShortCompositionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteShortCompositionInput = z.infer<typeof bulkDeleteShortCompositionSchema>

export const importShortCompositionSchema = z.object({
  shortCompositions: z.array(createShortCompositionSchema).min(1, "At least one Short Composition item is required"),
})

export type ImportShortCompositionInput = z.infer<typeof importShortCompositionSchema>

import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listRightFormOfVerbsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListRightFormOfVerbsInput = z.infer<typeof listRightFormOfVerbsSchema>

export const rightFormOfVerbsStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
})

export type RightFormOfVerbsStatsInput = z.infer<typeof rightFormOfVerbsStatsSchema>

export const getRightFormOfVerbSchema = idSchema
export type GetRightFormOfVerbInput = z.infer<typeof getRightFormOfVerbSchema>

export const createRightFormOfVerbSchema = z.object({
  content: z.string().min(1, "Content is required"),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
})

export type CreateRightFormOfVerbInput = z.infer<typeof createRightFormOfVerbSchema>

export const updateRightFormOfVerbSchema = createRightFormOfVerbSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateRightFormOfVerbInput = z.infer<typeof updateRightFormOfVerbSchema>

export const deleteRightFormOfVerbSchema = idSchema
export type DeleteRightFormOfVerbInput = z.infer<typeof deleteRightFormOfVerbSchema>

export const bulkDeleteRightFormOfVerbsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteRightFormOfVerbsInput = z.infer<typeof bulkDeleteRightFormOfVerbsSchema>

export const importRightFormOfVerbsSchema = z.object({
  rightFormOfVerbs: z.array(createRightFormOfVerbSchema).min(1, "At least one Right Form of Verbs item is required"),
})

export type ImportRightFormOfVerbsInput = z.infer<typeof importRightFormOfVerbsSchema>

import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listRearrangeSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  difficulty: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  year: z.number().int().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListRearrangeInput = z.infer<typeof listRearrangeSchema>

export const rearrangeStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type RearrangeStatsInput = z.infer<typeof rearrangeStatsSchema>

export const rearrangeBoardYearsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type RearrangeBoardYearsInput = z.infer<typeof rearrangeBoardYearsSchema>

export const getRearrangeSchema = idSchema
export type GetRearrangeInput = z.infer<typeof getRearrangeSchema>

export const createRearrangeSchema = z.object({
  options: z.array(z.string().min(1, "Option cannot be empty")).min(1, "At least one option is required"),
  answerKey: z.string().optional().nullable(),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export type CreateRearrangeInput = z.infer<typeof createRearrangeSchema>

export const updateRearrangeSchema = createRearrangeSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateRearrangeInput = z.infer<typeof updateRearrangeSchema>

export const deleteRearrangeSchema = idSchema
export type DeleteRearrangeInput = z.infer<typeof deleteRearrangeSchema>

export const bulkDeleteRearrangeSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteRearrangeInput = z.infer<typeof bulkDeleteRearrangeSchema>

export const importRearrangeSchema = z.object({
  questions: z.array(createRearrangeSchema).min(1, "At least one rearrange entry is required"),
})

export type ImportRearrangeInput = z.infer<typeof importRearrangeSchema>

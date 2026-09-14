import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listShortQuestionsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListShortQuestionsInput = z.infer<typeof listShortQuestionsSchema>

export const shortQuestionStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
})

export type ShortQuestionStatsInput = z.infer<typeof shortQuestionStatsSchema>

export const getShortQuestionSchema = idSchema
export type GetShortQuestionInput = z.infer<typeof getShortQuestionSchema>

export const createShortQuestionSchema = z.object({
  question: z.string().min(1, "Question text is required"),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().min(1, "Chapter is required"),
})

export type CreateShortQuestionInput = z.infer<typeof createShortQuestionSchema>

export const updateShortQuestionSchema = createShortQuestionSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateShortQuestionInput = z.infer<typeof updateShortQuestionSchema>

export const deleteShortQuestionSchema = idSchema
export type DeleteShortQuestionInput = z.infer<typeof deleteShortQuestionSchema>

export const bulkDeleteShortQuestionsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteShortQuestionsInput = z.infer<typeof bulkDeleteShortQuestionsSchema>

export const importShortQuestionsSchema = z.object({
  questions: z.array(createShortQuestionSchema).min(1, "At least one Short Question is required"),
})

export type ImportShortQuestionsInput = z.infer<typeof importShortQuestionsSchema>

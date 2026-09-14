import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listDescriptiveQuestionsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListDescriptiveQuestionsInput = z.infer<typeof listDescriptiveQuestionsSchema>

export const descriptiveQuestionStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
})

export type DescriptiveQuestionStatsInput = z.infer<typeof descriptiveQuestionStatsSchema>

export const getDescriptiveQuestionSchema = idSchema
export type GetDescriptiveQuestionInput = z.infer<typeof getDescriptiveQuestionSchema>

export const createDescriptiveQuestionSchema = z.object({
  question: z.string().min(1, "Question text is required"),
  answer: z.string().optional().nullable(),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().min(1, "Chapter is required"),
})

export type CreateDescriptiveQuestionInput = z.infer<typeof createDescriptiveQuestionSchema>

export const updateDescriptiveQuestionSchema = createDescriptiveQuestionSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateDescriptiveQuestionInput = z.infer<typeof updateDescriptiveQuestionSchema>

export const deleteDescriptiveQuestionSchema = idSchema
export type DeleteDescriptiveQuestionInput = z.infer<typeof deleteDescriptiveQuestionSchema>

export const bulkDeleteDescriptiveQuestionsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteDescriptiveQuestionsInput = z.infer<typeof bulkDeleteDescriptiveQuestionsSchema>

export const importDescriptiveQuestionsSchema = z.object({
  questions: z.array(createDescriptiveQuestionSchema).min(1, "At least one Descriptive Question is required"),
})

export type ImportDescriptiveQuestionsInput = z.infer<typeof importDescriptiveQuestionsSchema>

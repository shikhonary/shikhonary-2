import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listMathQuestionSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  questionTypeId: z.string().optional(),
  difficulty: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  isMath: z.boolean().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListMathQuestionInput = z.infer<typeof listMathQuestionSchema>

export const mathQuestionStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  questionTypeId: z.string().optional(),
})

export type MathQuestionStatsInput = z.infer<typeof mathQuestionStatsSchema>

export const getMathQuestionSchema = idSchema
export type GetMathQuestionInput = z.infer<typeof getMathQuestionSchema>

export const createMathQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().optional().nullable(),
  isMath: z.boolean().default(false),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
  questionTypeId: z.string().optional().nullable(),
})

export type CreateMathQuestionInput = z.infer<typeof createMathQuestionSchema>

export const updateMathQuestionSchema = createMathQuestionSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateMathQuestionInput = z.infer<typeof updateMathQuestionSchema>

export const deleteMathQuestionSchema = idSchema
export type DeleteMathQuestionInput = z.infer<typeof deleteMathQuestionSchema>

export const bulkDeleteMathQuestionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteMathQuestionInput = z.infer<typeof bulkDeleteMathQuestionSchema>

export const importMathQuestionSchema = z.object({
  questions: z.array(createMathQuestionSchema).min(1, "At least one math question entry is required"),
})

export type ImportMathQuestionInput = z.infer<typeof importMathQuestionSchema>

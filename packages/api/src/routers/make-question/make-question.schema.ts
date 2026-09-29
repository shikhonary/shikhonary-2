import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listMakeQuestionSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  essenceId: z.string().optional(),
  difficulty: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListMakeQuestionInput = z.infer<typeof listMakeQuestionSchema>

export const makeQuestionStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  essenceId: z.string().optional(),
})

export type MakeQuestionStatsInput = z.infer<typeof makeQuestionStatsSchema>

export const getMakeQuestionSchema = idSchema
export type GetMakeQuestionInput = z.infer<typeof getMakeQuestionSchema>

export const createMakeQuestionSchema = z.object({
  statement: z.string().optional().nullable(),
  answer: z.string().optional().nullable(),
  clue: z.string().optional().nullable(),
  context: z.string().optional().nullable(),
  essenceId: z.string().optional().nullable(),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
})

export type CreateMakeQuestionInput = z.infer<typeof createMakeQuestionSchema>

export const updateMakeQuestionSchema = createMakeQuestionSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateMakeQuestionInput = z.infer<typeof updateMakeQuestionSchema>

export const deleteMakeQuestionSchema = idSchema
export type DeleteMakeQuestionInput = z.infer<typeof deleteMakeQuestionSchema>

export const bulkDeleteMakeQuestionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteMakeQuestionInput = z.infer<typeof bulkDeleteMakeQuestionSchema>

export const importMakeQuestionSchema = z.object({
  questions: z.array(createMakeQuestionSchema).min(1, "At least one question making entry is required"),
})

export type ImportMakeQuestionInput = z.infer<typeof importMakeQuestionSchema>

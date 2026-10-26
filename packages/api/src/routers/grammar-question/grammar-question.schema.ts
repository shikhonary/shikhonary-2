import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listGrammarQuestionSchema = paginationSchema.extend({
  academicClassId: z.string().optional(),
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  board: z.string().optional(),
  questionTypeId: z.string().optional(),
  difficulty: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  year: z.number().int().optional(),
  isActive: z.boolean().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
  search: z.string().optional(),
})

export type ListGrammarQuestionInput = z.infer<typeof listGrammarQuestionSchema>

export const grammarQuestionStatsSchema = z.object({
  academicClassId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  questionTypeId: z.string().optional(),
})

export type GrammarQuestionStatsInput = z.infer<typeof grammarQuestionStatsSchema>

export const getGrammarQuestionSchema = idSchema
export type GetGrammarQuestionInput = z.infer<typeof getGrammarQuestionSchema>

export const createGrammarQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().optional().nullable(),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
  questionTypeId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export type CreateGrammarQuestionInput = z.infer<typeof createGrammarQuestionSchema>

export const updateGrammarQuestionSchema = createGrammarQuestionSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateGrammarQuestionInput = z.infer<typeof updateGrammarQuestionSchema>

export const deleteGrammarQuestionSchema = idSchema
export type DeleteGrammarQuestionInput = z.infer<typeof deleteGrammarQuestionSchema>

export const bulkDeleteGrammarQuestionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteGrammarQuestionInput = z.infer<typeof bulkDeleteGrammarQuestionSchema>

export const toggleGrammarQuestionActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleGrammarQuestionActiveInput = z.infer<typeof toggleGrammarQuestionActiveSchema>

export const importGrammarQuestionSchema = z.object({
  questions: z.array(createGrammarQuestionSchema).min(1, "At least one grammar question entry is required"),
})

export type ImportGrammarQuestionInput = z.infer<typeof importGrammarQuestionSchema>

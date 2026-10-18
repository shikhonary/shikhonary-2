import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const comprehensionQuestionSchema = z.object({
  id: z.string().optional(),
  groupNumber: z.number().int().default(1),
  groupTitle: z.string().optional().nullable(),
  itemLabel: z.string().optional().nullable(),
  orderIndex: z.number().int().default(0),
  type: z.string().default("SHORT_ANSWER"),
  question: z.string().min(1, "Question text is required"),
  options: z.any().optional().nullable(),
  answer: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
  marks: z.number().default(1.0),
})

export type ComprehensionQuestionInput = z.infer<typeof comprehensionQuestionSchema>

export const listSeenComprehensionsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  comprehensionType: z.string().optional(),
  board: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type ListSeenComprehensionsInput = z.infer<typeof listSeenComprehensionsSchema>

export const seenComprehensionStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  comprehensionType: z.string().optional(),
})

export type SeenComprehensionStatsInput = z.infer<typeof seenComprehensionStatsSchema>

export const getSeenComprehensionSchema = idSchema
export type GetSeenComprehensionInput = z.infer<typeof getSeenComprehensionSchema>

export const createSeenComprehensionSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  academicChapterId: z.string().optional().nullable(),
  chapterId: z.string().optional().nullable(), // alias for convenience
  questionTypeId: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  passage: z.string().min(1, "Passage content is required"),
  instruction: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  reference: z.array(z.string()).optional().default([]),
  session: z.string().optional().nullable(),
  comprehensionType: z.string().default("SEEN_COMPREHENSION_1"),
  difficulty: z.string().default(QUESTION_DIFFICULTY.MEDIUM),
  totalMarks: z.number().optional().nullable(),
  isActive: z.boolean().default(true),
  questions: z.array(comprehensionQuestionSchema).optional().default([]),
})

export type CreateSeenComprehensionInput = z.infer<typeof createSeenComprehensionSchema>

export const updateSeenComprehensionSchema = createSeenComprehensionSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateSeenComprehensionInput = z.infer<typeof updateSeenComprehensionSchema>

export const deleteSeenComprehensionSchema = idSchema
export type DeleteSeenComprehensionInput = z.infer<typeof deleteSeenComprehensionSchema>

export const bulkDeleteSeenComprehensionsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteSeenComprehensionsInput = z.infer<typeof bulkDeleteSeenComprehensionsSchema>

export const toggleSeenComprehensionActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleSeenComprehensionActiveInput = z.infer<typeof toggleSeenComprehensionActiveSchema>

export const importSeenComprehensionsSchema = z.object({
  items: z.array(createSeenComprehensionSchema).min(1, "At least one seen comprehension is required"),
})

export type ImportSeenComprehensionsInput = z.infer<typeof importSeenComprehensionsSchema>

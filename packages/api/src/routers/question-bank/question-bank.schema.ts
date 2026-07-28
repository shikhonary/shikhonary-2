/**
 * Question Bank domain — Zod input/output schemas.
 *
 * Single source of truth for Question Bank procedure types.
 * The question bank is a read-only browsing layer over the Mcq model,
 * scoped to only active MCQs.
 */
import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const questionBankSortEnum = z.enum([
  "All",
  "newest",
  "oldest",
  "question_asc",
  "question_desc",
])
export type QuestionBankSortOption = z.infer<typeof questionBankSortEnum>

export const listQuestionBankSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  type: z.string().optional(),
  isMath: z.boolean().optional(),
  query: z.string().optional(),
  sort: questionBankSortEnum.optional(),
  page: z.number().int().min(1).optional(),
})

export type ListQuestionBankInput = z.infer<typeof listQuestionBankSchema>

export const questionBankStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
})

export type QuestionBankStatsInput = z.infer<typeof questionBankStatsSchema>

export const getQuestionBankMcqSchema = idSchema

export type GetQuestionBankMcqInput = z.infer<typeof getQuestionBankMcqSchema>

export const questionBankByChapterSchema = z.object({
  subjectId: z.string().min(1, "Subject ID is required"),
})

export type QuestionBankByChapterInput = z.infer<typeof questionBankByChapterSchema>

export const questionBankBoardYearsSchema = z.object({
  subjectId: z.string().min(1, "Subject ID is required"),
  chapterId: z.string().optional(),
})

export type QuestionBankBoardYearsInput = z.infer<typeof questionBankBoardYearsSchema>

// ---------------------------------------------------------------------------
// Select Shape
// ---------------------------------------------------------------------------

/**
 * Select shape for question bank MCQ reads.
 * Always includes subject + chapter relations and only exposes safe fields.
 */
export const safeQuestionBankMcqSelect = {
  id: true,
  question: true,
  answer: true,
  options: true,
  statements: true,
  type: true,
  isMath: true,
  reference: true,
  explanation: true,
  questionUrl: true,
  context: true,
  contextUrl: true,
  subjectId: true,
  chapterId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  subject: {
    select: {
      id: true,
      name: true,
    },
  },
  chapter: {
    select: {
      id: true,
      name: true,
      position: true,
    },
  },
} as const

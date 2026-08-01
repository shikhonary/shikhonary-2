/**
 * MCQ (Multiple Choice Question) domain — Zod input/output schemas.
 *
 * Single source of truth for MCQ procedure types.
 */
import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const mcqSortEnum = z.enum([
  "All",
  "newest",
  "oldest",
  "question_asc",
  "question_desc",
])
export type McqSortOption = z.infer<typeof mcqSortEnum>

export const listMcqsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  board: z.string().optional(),
  type: z.string().optional(),
  isMath: z.boolean().optional(),
  isActive: z.boolean().optional(),
  query: z.string().optional(),
  sort: mcqSortEnum.optional(),
  page: z.number().int().min(1).optional(),
})

export type ListMcqsInput = z.infer<typeof listMcqsSchema>

export const getMcqSchema = idSchema

export type GetMcqInput = z.infer<typeof getMcqSchema>

export const mcqStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
})

export type McqStatsInput = z.infer<typeof mcqStatsSchema>

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const createMcqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  options: z.array(z.string()).min(1, "At least one option is required"),
  statements: z.array(z.string()).default([]),
  type: z.string().min(1, "Type is required"),
  isMath: z.boolean().default(false),
  reference: z.array(z.string()).default([]),
  explanation: z.string().nullable().optional(),
  questionUrl: z.string().nullable().optional(),
  context: z.string().nullable().optional(),
  contextUrl: z.string().nullable().optional(),
  subjectId: z.string().min(1, "Subject ID is required"),
  chapterId: z.string().min(1, "Chapter ID is required"),
  isActive: z.boolean().default(true),
})

export type CreateMcqInput = z.infer<typeof createMcqSchema>

export const updateMcqSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  options: z.array(z.string()).min(1).optional(),
  statements: z.array(z.string()).optional(),
  type: z.string().min(1).optional(),
  isMath: z.boolean().optional(),
  reference: z.array(z.string()).optional(),
  explanation: z.string().nullable().optional(),
  questionUrl: z.string().nullable().optional(),
  context: z.string().nullable().optional(),
  contextUrl: z.string().nullable().optional(),
  subjectId: z.string().min(1).optional(),
  chapterId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
})

export type UpdateMcqInput = z.infer<typeof updateMcqSchema>

export const deleteMcqSchema = idSchema

export type DeleteMcqInput = z.infer<typeof deleteMcqSchema>

export const bulkDeleteMcqsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one MCQ ID is required"),
})

export type BulkDeleteMcqsInput = z.infer<typeof bulkDeleteMcqsSchema>

export const toggleMcqActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleMcqActiveInput = z.infer<typeof toggleMcqActiveSchema>

export const importMcqsSchema = z.object({
  mcqs: z.array(createMcqSchema).min(1, "At least one MCQ item is required for import"),
})

export type ImportMcqsInput = z.infer<typeof importMcqsSchema>

// ---------------------------------------------------------------------------
// Select Shape
// ---------------------------------------------------------------------------

export const safeMcqSelect = {
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

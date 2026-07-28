/**
 * Exam domain — Zod input/output schemas.
 *
 * Single source of truth for Exam procedure types.
 */
import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const examSortEnum = z.enum([
  "All",
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
])
export type ExamSortOption = z.infer<typeof examSortEnum>

export const listExamsSchema = paginationSchema.extend({
  status: z.string().optional(),
  type: z.string().optional(),
  academicClassId: z.string().optional(),
  examGroupId: z.string().optional(),
  query: z.string().optional(),
  sort: examSortEnum.optional(),
  page: z.number().int().min(1).optional(),
})

export type ListExamsInput = z.infer<typeof listExamsSchema>

export const getExamSchema = idSchema

export type GetExamInput = z.infer<typeof getExamSchema>

export const examStatsSchema = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type ExamStatsInput = z.infer<typeof examStatsSchema>

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const createExamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  total: z.number().int().min(1, "Total marks is required"),
  duration: z.number().int().min(1, "Duration is required"),
  totalMcq: z.number().int().min(1, "Total MCQ count is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  hasSuffle: z.boolean().default(false),
  hasRandom: z.boolean().default(false),
  hasNegativeMark: z.boolean().default(false),
  negativeMark: z.number().default(0),
  type: z.string().min(1, "Exam type is required"),
  status: z.string().default("Pending"),
  academicClassId: z.string().min(1, "Academic class is required"),
  subjectIds: z.array(z.string().min(1)).min(1, "At least one subject is required"),
  examGroupId: z.string().optional(),
})

export type CreateExamInput = z.infer<typeof createExamSchema>

export const updateExamSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  total: z.number().int().min(1).optional(),
  duration: z.number().int().min(1).optional(),
  totalMcq: z.number().int().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  hasSuffle: z.boolean().optional(),
  hasRandom: z.boolean().optional(),
  hasNegativeMark: z.boolean().optional(),
  negativeMark: z.number().optional(),
  type: z.string().min(1).optional(),
  status: z.string().optional(),
  academicClassId: z.string().min(1).optional(),
  examGroupId: z.string().optional().nullable(),
})

export type UpdateExamInput = z.infer<typeof updateExamSchema>

export const deleteExamSchema = idSchema

export type DeleteExamInput = z.infer<typeof deleteExamSchema>

export const bulkDeleteExamsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one Exam ID is required"),
})

export type BulkDeleteExamsInput = z.infer<typeof bulkDeleteExamsSchema>

export const toggleExamStatusSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
})

export type ToggleExamStatusInput = z.infer<typeof toggleExamStatusSchema>

export const addExamSubjectsSchema = z.object({
  examId: z.string().min(1),
  subjectIds: z.array(z.string().min(1)).min(1, "At least one subject is required"),
})

export type AddExamSubjectsInput = z.infer<typeof addExamSubjectsSchema>

export const removeExamSubjectSchema = z.object({
  examId: z.string().min(1),
  subjectId: z.string().min(1),
})

export type RemoveExamSubjectInput = z.infer<typeof removeExamSubjectSchema>

export const updateExamSubjectMcqsSchema = z.object({
  examId: z.string().min(1),
  examSubjectId: z.string().min(1),
  mcqIds: z.array(z.string()),
})

export type UpdateExamSubjectMcqsInput = z.infer<typeof updateExamSubjectMcqsSchema>

// ---------------------------------------------------------------------------
// Select Shape
// ---------------------------------------------------------------------------

export const safeExamSelect = {
  id: true,
  title: true,
  total: true,
  duration: true,
  totalMcq: true,
  startDate: true,
  endDate: true,
  hasSuffle: true,
  hasRandom: true,
  hasNegativeMark: true,
  negativeMark: true,
  type: true,
  status: true,
  academicClassId: true,
  createdAt: true,
  updatedAt: true,
  academicClass: {
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  },
  examSubjects: {
    select: {
      id: true,
      subjectId: true,
      mcqIds: true,
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  examGroupItems: {
    select: {
      id: true,
      examGroupId: true,
      position: true,
      weightage: true,
      isRequired: true,
      examGroup: {
        select: {
          id: true,
          title: true,
          code: true,
          type: true,
          calculationType: true,
          isPublished: true,
        },
      },
    },
  },
  _count: {
    select: {
      examAttempts: true,
      examGroupItems: true,
    },
  },
} as const

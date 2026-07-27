/**
 * ExamGroup domain — Zod input/output schemas.
 *
 * Single source of truth for ExamGroup procedure types.
 */
import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

// ---------------------------------------------------------------------------
// Enums & Constants
// ---------------------------------------------------------------------------

export const calculationTypeEnum = z.enum([
  "SUM",
  "AVERAGE",
  "WEIGHTED_AVERAGE",
  "BEST_OF_N",
])
export type CalculationType = z.infer<typeof calculationTypeEnum>

export const examGroupTypeEnum = z.enum([
  "MODEL_TEST",
  "TERM_EXAM",
  "WEEKLY_SERIES",
  "SUBJECT_COMBO",
])
export type ExamGroupType = z.infer<typeof examGroupTypeEnum>

export const examGroupSortEnum = z.enum([
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
])
export type ExamGroupSortOption = z.infer<typeof examGroupSortEnum>

// ---------------------------------------------------------------------------
// Query Schemas
// ---------------------------------------------------------------------------

export const listExamGroupsSchema = paginationSchema.extend({
  type: z.string().optional(),
  academicClassId: z.string().optional(),
  isPublished: z.boolean().optional(),
  query: z.string().optional(),
  sort: examGroupSortEnum.optional(),
  page: z.number().int().min(1).optional(),
})
export type ListExamGroupsInput = z.infer<typeof listExamGroupsSchema>

export const getExamGroupSchema = idSchema
export type GetExamGroupInput = z.infer<typeof getExamGroupSchema>

export const examGroupStatsSchema = z.object({
  academicClassId: z.string().optional(),
  type: z.string().optional(),
})
export type ExamGroupStatsInput = z.infer<typeof examGroupStatsSchema>

export const listExamGroupResultsSchema = paginationSchema.extend({
  examGroupId: z.string().min(1, "Exam Group ID is required"),
  query: z.string().optional(), // student name, roll, studentId
  status: z.string().optional(), // PASSED, FAILED, INCOMPLETE
  sort: z.enum(["rank_asc", "rank_desc", "score_desc", "score_asc", "name_asc"]).optional(),
  page: z.number().int().min(1).optional(),
})
export type ListExamGroupResultsInput = z.infer<typeof listExamGroupResultsSchema>

export const getStudentExamGroupResultSchema = z.object({
  examGroupId: z.string().min(1, "Exam Group ID is required"),
  studentId: z.string().optional(), // Optional if caller uses session student
})
export type GetStudentExamGroupResultInput = z.infer<typeof getStudentExamGroupResultSchema>

// ---------------------------------------------------------------------------
// Student-facing schemas (studentProcedure)
// ---------------------------------------------------------------------------

/** Input for listing published exam groups for the current student's class. */
export const studentExamGroupsSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
})
export type StudentExamGroupsInput = z.infer<typeof studentExamGroupsSchema>

/** Input for fetching a paginated leaderboard for a specific exam group. */
export const studentExamGroupLeaderboardSchema = z.object({
  examGroupId: z.string().min(1, "Exam Group ID is required"),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(50),
  sort: z.enum(["rank_asc", "score_desc", "name_asc"]).optional().default("rank_asc"),
  query: z.string().optional(),
})
export type StudentExamGroupLeaderboardInput = z.infer<typeof studentExamGroupLeaderboardSchema>


// ---------------------------------------------------------------------------
// Mutation Schemas
// ---------------------------------------------------------------------------

export const createExamGroupItemInputSchema = z.object({
  examId: z.string().min(1, "Exam ID is required"),
  position: z.number().int().min(0).default(0),
  weightage: z.number().min(0).default(100.0),
  isRequired: z.boolean().default(true),
})

export const createExamGroupSchema = z.object({
  title: z.string().min(1, "Title is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  type: examGroupTypeEnum.default("MODEL_TEST"),
  calculationType: calculationTypeEnum.default("SUM"),
  bestOfNCount: z.number().int().min(1).optional(),
  totalMarks: z.number().min(0).optional(),
  passMarks: z.number().min(0).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isPublished: z.boolean().default(false),
  academicClassId: z.string().optional(),
  items: z.array(createExamGroupItemInputSchema).optional(),
})
export type CreateExamGroupInput = z.infer<typeof createExamGroupSchema>

export const updateExamGroupSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  code: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  type: examGroupTypeEnum.optional(),
  calculationType: calculationTypeEnum.optional(),
  bestOfNCount: z.number().int().min(1).optional().nullable(),
  totalMarks: z.number().min(0).optional().nullable(),
  passMarks: z.number().min(0).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  isPublished: z.boolean().optional(),
  academicClassId: z.string().optional().nullable(),
})
export type UpdateExamGroupInput = z.infer<typeof updateExamGroupSchema>

export const deleteExamGroupSchema = idSchema
export type DeleteExamGroupInput = z.infer<typeof deleteExamGroupSchema>

export const bulkDeleteExamGroupsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one Exam Group ID is required"),
})
export type BulkDeleteExamGroupsInput = z.infer<typeof bulkDeleteExamGroupsSchema>

export const togglePublishExamGroupSchema = z.object({
  id: z.string().min(1),
  isPublished: z.boolean(),
})
export type TogglePublishExamGroupInput = z.infer<typeof togglePublishExamGroupSchema>

export const addExamGroupItemSchema = z.object({
  examGroupId: z.string().min(1),
  examId: z.string().min(1),
  position: z.number().int().min(0).optional(),
  weightage: z.number().min(0).optional(),
  isRequired: z.boolean().optional(),
})
export type AddExamGroupItemInput = z.infer<typeof addExamGroupItemSchema>

export const updateExamGroupItemSchema = z.object({
  id: z.string().min(1),
  position: z.number().int().min(0).optional(),
  weightage: z.number().min(0).optional(),
  isRequired: z.boolean().optional(),
})
export type UpdateExamGroupItemInput = z.infer<typeof updateExamGroupItemSchema>

export const removeExamGroupItemSchema = z.object({
  examGroupId: z.string().min(1),
  examId: z.string().min(1),
})
export type RemoveExamGroupItemInput = z.infer<typeof removeExamGroupItemSchema>

export const reorderExamGroupItemsSchema = z.object({
  examGroupId: z.string().min(1),
  items: z.array(
    z.object({
      examId: z.string().min(1),
      position: z.number().int().min(0),
      weightage: z.number().min(0).optional(),
      isRequired: z.boolean().optional(),
    })
  ),
})
export type ReorderExamGroupItemsInput = z.infer<typeof reorderExamGroupItemsSchema>

export const calculateExamGroupResultsSchema = z.object({
  examGroupId: z.string().min(1, "Exam Group ID is required"),
  studentId: z.string().optional(), // Re-calculate for single student or all
})
export type CalculateExamGroupResultsInput = z.infer<typeof calculateExamGroupResultsSchema>

// ---------------------------------------------------------------------------
// Select Shapes
// ---------------------------------------------------------------------------

export const safeExamGroupSelect = {
  id: true,
  title: true,
  code: true,
  description: true,
  type: true,
  calculationType: true,
  bestOfNCount: true,
  totalMarks: true,
  passMarks: true,
  startDate: true,
  endDate: true,
  isPublished: true,
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
  items: {
    orderBy: { position: "asc" as const },
    select: {
      id: true,
      examId: true,
      position: true,
      weightage: true,
      isRequired: true,
      exam: {
        select: {
          id: true,
          title: true,
          total: true,
          duration: true,
          status: true,
          type: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  },
  _count: {
    select: {
      items: true,
      groupResults: true,
    },
  },
} as const

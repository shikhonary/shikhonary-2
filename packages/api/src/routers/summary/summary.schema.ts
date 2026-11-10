import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listSummariesSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  academicClassId: z.string().optional(),
  board: z.string().optional(),
  reference: z.string().optional(),
  isActive: z.union([z.boolean(), z.string()]).optional(),
  hasReport: z.union([z.boolean(), z.string()]).optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListSummariesInput = z.infer<typeof listSummariesSchema>

export const summaryStatsSchema = z.object({
  subjectId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type SummaryStatsInput = z.infer<typeof summaryStatsSchema>

export const summaryBoardYearsSchema = z.object({
  subjectId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type SummaryBoardYearsInput = z.infer<typeof summaryBoardYearsSchema>

export const getSummarySchema = idSchema
export type GetSummaryInput = z.infer<typeof getSummarySchema>

export const createSummarySchema = z.object({
  title: z.string().min(1, "Title is required"),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  questionTypeId: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export type CreateSummaryInput = z.infer<typeof createSummarySchema>

export const updateSummarySchema = createSummarySchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateSummaryInput = z.infer<typeof updateSummarySchema>

export const deleteSummarySchema = idSchema
export type DeleteSummaryInput = z.infer<typeof deleteSummarySchema>

export const bulkDeleteSummariesSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteSummariesInput = z.infer<typeof bulkDeleteSummariesSchema>

export const toggleSummaryActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleSummaryActiveInput = z.infer<typeof toggleSummaryActiveSchema>

export const resolveSummaryReportSchema = z.object({
  summaryId: z.string().min(1, "Summary ID is required"),
  reportId: z.string().optional(),
  resolvedNote: z.string().optional(),
})

export type ResolveSummaryReportInput = z.infer<typeof resolveSummaryReportSchema>

export const assignSummaryReportSchema = z.object({
  summaryId: z.string().min(1, "Summary ID is required"),
  reportId: z.string().optional(),
  assignedToId: z.string().min(1, "Assignee user ID is required"),
  note: z.string().optional(),
})

export type AssignSummaryReportInput = z.infer<typeof assignSummaryReportSchema>

export const importSummariesSchema = z.object({
  summaries: z.array(createSummarySchema).min(1, "At least one Summary is required"),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).optional(),
})

export type ImportSummariesInput = z.infer<typeof importSummariesSchema>

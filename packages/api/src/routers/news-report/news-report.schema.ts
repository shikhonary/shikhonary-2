import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listNewsReportsSchema = paginationSchema.extend({
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

export type ListNewsReportsInput = z.infer<typeof listNewsReportsSchema>

export const newsReportStatsSchema = z.object({
  subjectId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type NewsReportStatsInput = z.infer<typeof newsReportStatsSchema>

export const newsReportBoardYearsSchema = z.object({
  subjectId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type NewsReportBoardYearsInput = z.infer<typeof newsReportBoardYearsSchema>

export const getNewsReportSchema = idSchema
export type GetNewsReportInput = z.infer<typeof getNewsReportSchema>

export const createNewsReportSchema = z.object({
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

export type CreateNewsReportInput = z.infer<typeof createNewsReportSchema>

export const updateNewsReportSchema = createNewsReportSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateNewsReportInput = z.infer<typeof updateNewsReportSchema>

export const deleteNewsReportSchema = idSchema
export type DeleteNewsReportInput = z.infer<typeof deleteNewsReportSchema>

export const bulkDeleteNewsReportsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteNewsReportsInput = z.infer<typeof bulkDeleteNewsReportsSchema>

export const toggleNewsReportActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleNewsReportActiveInput = z.infer<typeof toggleNewsReportActiveSchema>

export const resolveNewsReportReportSchema = z.object({
  newsReportId: z.string().min(1, "News Report ID is required"),
  reportId: z.string().optional(),
  resolvedNote: z.string().optional(),
})

export type ResolveNewsReportReportInput = z.infer<typeof resolveNewsReportReportSchema>

export const assignNewsReportReportSchema = z.object({
  newsReportId: z.string().min(1, "News Report ID is required"),
  reportId: z.string().optional(),
  assignedToId: z.string().min(1, "Assignee user ID is required"),
  note: z.string().optional(),
})

export type AssignNewsReportReportInput = z.infer<typeof assignNewsReportReportSchema>

export const importNewsReportsSchema = z.object({
  newsReports: z
    .array(createNewsReportSchema)
    .min(1, "At least one News Report is required"),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).optional(),
})

export type ImportNewsReportsInput = z.infer<typeof importNewsReportsSchema>

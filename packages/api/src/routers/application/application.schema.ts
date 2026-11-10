import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listApplicationsSchema = paginationSchema.extend({
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

export type ListApplicationsInput = z.infer<typeof listApplicationsSchema>

export const applicationStatsSchema = z.object({
  subjectId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type ApplicationStatsInput = z.infer<typeof applicationStatsSchema>

export const applicationBoardYearsSchema = z.object({
  subjectId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type ApplicationBoardYearsInput = z.infer<typeof applicationBoardYearsSchema>

export const getApplicationSchema = idSchema
export type GetApplicationInput = z.infer<typeof getApplicationSchema>

export const createApplicationSchema = z.object({
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

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>

export const updateApplicationSchema = createApplicationSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>

export const deleteApplicationSchema = idSchema
export type DeleteApplicationInput = z.infer<typeof deleteApplicationSchema>

export const bulkDeleteApplicationsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteApplicationsInput = z.infer<typeof bulkDeleteApplicationsSchema>

export const toggleApplicationActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleApplicationActiveInput = z.infer<typeof toggleApplicationActiveSchema>

export const resolveApplicationReportSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  reportId: z.string().optional(),
  resolvedNote: z.string().optional(),
})

export type ResolveApplicationReportInput = z.infer<typeof resolveApplicationReportSchema>

export const assignApplicationReportSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  reportId: z.string().optional(),
  assignedToId: z.string().min(1, "Assignee user ID is required"),
  note: z.string().optional(),
})

export type AssignApplicationReportInput = z.infer<typeof assignApplicationReportSchema>

export const importApplicationsSchema = z.object({
  applications: z
    .array(createApplicationSchema)
    .min(1, "At least one Application is required"),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).optional(),
})

export type ImportApplicationsInput = z.infer<typeof importApplicationsSchema>

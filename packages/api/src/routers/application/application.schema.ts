import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listApplicationsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListApplicationsInput = z.infer<typeof listApplicationsSchema>

export const applicationStatsSchema = z.object({
  subjectId: z.string().optional(),
})

export type ApplicationStatsInput = z.infer<typeof applicationStatsSchema>

export const getApplicationSchema = idSchema
export type GetApplicationInput = z.infer<typeof getApplicationSchema>

export const createApplicationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
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

export const importApplicationsSchema = z.object({
  applications: z.array(createApplicationSchema).min(1, "At least one Application is required"),
})

export type ImportApplicationsInput = z.infer<typeof importApplicationsSchema>

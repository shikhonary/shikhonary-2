import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listEssencesSchema = paginationSchema.extend({
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

export type ListEssencesInput = z.infer<typeof listEssencesSchema>

export const essenceStatsSchema = z.object({
  subjectId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type EssenceStatsInput = z.infer<typeof essenceStatsSchema>

export const essenceBoardYearsSchema = z.object({
  subjectId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type EssenceBoardYearsInput = z.infer<typeof essenceBoardYearsSchema>

export const getEssenceSchema = idSchema
export type GetEssenceInput = z.infer<typeof getEssenceSchema>

export const createEssenceSchema = z.object({
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

export type CreateEssenceInput = z.infer<typeof createEssenceSchema>

export const updateEssenceSchema = createEssenceSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateEssenceInput = z.infer<typeof updateEssenceSchema>

export const deleteEssenceSchema = idSchema
export type DeleteEssenceInput = z.infer<typeof deleteEssenceSchema>

export const bulkDeleteEssencesSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteEssencesInput = z.infer<typeof bulkDeleteEssencesSchema>

export const toggleEssenceActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleEssenceActiveInput = z.infer<typeof toggleEssenceActiveSchema>

export const resolveEssenceReportSchema = z.object({
  essenceId: z.string().min(1, "Essence ID is required"),
  reportId: z.string().optional(),
  resolvedNote: z.string().optional(),
})

export type ResolveEssenceReportInput = z.infer<typeof resolveEssenceReportSchema>

export const assignEssenceReportSchema = z.object({
  essenceId: z.string().min(1, "Essence ID is required"),
  reportId: z.string().optional(),
  assignedToId: z.string().min(1, "Assignee user ID is required"),
  note: z.string().optional(),
})

export type AssignEssenceReportInput = z.infer<typeof assignEssenceReportSchema>

export const importEssencesSchema = z.object({
  essences: z.array(createEssenceSchema).min(1, "At least one Essence is required"),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).optional(),
})

export type ImportEssencesInput = z.infer<typeof importEssencesSchema>

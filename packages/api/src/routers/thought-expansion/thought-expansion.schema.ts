import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listThoughtExpansionsSchema = paginationSchema.extend({
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

export type ListThoughtExpansionsInput = z.infer<typeof listThoughtExpansionsSchema>

export const thoughtExpansionStatsSchema = z.object({
  subjectId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type ThoughtExpansionStatsInput = z.infer<typeof thoughtExpansionStatsSchema>

export const thoughtExpansionBoardYearsSchema = z.object({
  subjectId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type ThoughtExpansionBoardYearsInput = z.infer<typeof thoughtExpansionBoardYearsSchema>

export const getThoughtExpansionSchema = idSchema
export type GetThoughtExpansionInput = z.infer<typeof getThoughtExpansionSchema>

export const createThoughtExpansionSchema = z.object({
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

export type CreateThoughtExpansionInput = z.infer<typeof createThoughtExpansionSchema>

export const updateThoughtExpansionSchema = createThoughtExpansionSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateThoughtExpansionInput = z.infer<typeof updateThoughtExpansionSchema>

export const deleteThoughtExpansionSchema = idSchema
export type DeleteThoughtExpansionInput = z.infer<typeof deleteThoughtExpansionSchema>

export const bulkDeleteThoughtExpansionsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteThoughtExpansionsInput = z.infer<typeof bulkDeleteThoughtExpansionsSchema>

export const toggleThoughtExpansionActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleThoughtExpansionActiveInput = z.infer<typeof toggleThoughtExpansionActiveSchema>

export const resolveThoughtExpansionReportSchema = z.object({
  thoughtExpansionId: z.string().min(1, "Thought Expansion ID is required"),
  reportId: z.string().optional(),
  resolvedNote: z.string().optional(),
})

export type ResolveThoughtExpansionReportInput = z.infer<typeof resolveThoughtExpansionReportSchema>

export const assignThoughtExpansionReportSchema = z.object({
  thoughtExpansionId: z.string().min(1, "Thought Expansion ID is required"),
  reportId: z.string().optional(),
  assignedToId: z.string().min(1, "Assignee user ID is required"),
  note: z.string().optional(),
})

export type AssignThoughtExpansionReportInput = z.infer<typeof assignThoughtExpansionReportSchema>

export const importThoughtExpansionsSchema = z.object({
  thoughtExpansions: z
    .array(createThoughtExpansionSchema)
    .min(1, "At least one Thought Expansion is required"),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).optional(),
})

export type ImportThoughtExpansionsInput = z.infer<typeof importThoughtExpansionsSchema>

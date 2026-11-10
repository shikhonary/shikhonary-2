import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listEssaysSchema = paginationSchema.extend({
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

export type ListEssaysInput = z.infer<typeof listEssaysSchema>

export const essayStatsSchema = z.object({
  subjectId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type EssayStatsInput = z.infer<typeof essayStatsSchema>

export const essayBoardYearsSchema = z.object({
  subjectId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type EssayBoardYearsInput = z.infer<typeof essayBoardYearsSchema>

export const getEssaySchema = idSchema
export type GetEssayInput = z.infer<typeof getEssaySchema>

export const createEssaySchema = z.object({
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

export type CreateEssayInput = z.infer<typeof createEssaySchema>

export const updateEssaySchema = createEssaySchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateEssayInput = z.infer<typeof updateEssaySchema>

export const deleteEssaySchema = idSchema
export type DeleteEssayInput = z.infer<typeof deleteEssaySchema>

export const bulkDeleteEssaysSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteEssaysInput = z.infer<typeof bulkDeleteEssaysSchema>

export const toggleEssayActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleEssayActiveInput = z.infer<typeof toggleEssayActiveSchema>

export const resolveEssayReportSchema = z.object({
  essayId: z.string().min(1, "Essay ID is required"),
  reportId: z.string().optional(),
  resolvedNote: z.string().optional(),
})

export type ResolveEssayReportInput = z.infer<typeof resolveEssayReportSchema>

export const assignEssayReportSchema = z.object({
  essayId: z.string().min(1, "Essay ID is required"),
  reportId: z.string().optional(),
  assignedToId: z.string().min(1, "Assignee user ID is required"),
  note: z.string().optional(),
})

export type AssignEssayReportInput = z.infer<typeof assignEssayReportSchema>

export const importEssaysSchema = z.object({
  essays: z.array(createEssaySchema).min(1, "At least one Essay is required"),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).optional(),
})

export type ImportEssaysInput = z.infer<typeof importEssaysSchema>

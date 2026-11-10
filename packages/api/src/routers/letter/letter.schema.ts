import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listLettersSchema = paginationSchema.extend({
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

export type ListLettersInput = z.infer<typeof listLettersSchema>

export const letterStatsSchema = z.object({
  subjectId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type LetterStatsInput = z.infer<typeof letterStatsSchema>

export const letterBoardYearsSchema = z.object({
  subjectId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type LetterBoardYearsInput = z.infer<typeof letterBoardYearsSchema>

export const getLetterSchema = idSchema
export type GetLetterInput = z.infer<typeof getLetterSchema>

export const createLetterSchema = z.object({
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

export type CreateLetterInput = z.infer<typeof createLetterSchema>

export const updateLetterSchema = createLetterSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateLetterInput = z.infer<typeof updateLetterSchema>

export const deleteLetterSchema = idSchema
export type DeleteLetterInput = z.infer<typeof deleteLetterSchema>

export const bulkDeleteLettersSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteLettersInput = z.infer<typeof bulkDeleteLettersSchema>

export const toggleLetterActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleLetterActiveInput = z.infer<typeof toggleLetterActiveSchema>

export const resolveLetterReportSchema = z.object({
  letterId: z.string().min(1, "Letter ID is required"),
  reportId: z.string().optional(),
  resolvedNote: z.string().optional(),
})

export type ResolveLetterReportInput = z.infer<typeof resolveLetterReportSchema>

export const assignLetterReportSchema = z.object({
  letterId: z.string().min(1, "Letter ID is required"),
  reportId: z.string().optional(),
  assignedToId: z.string().min(1, "Assignee user ID is required"),
  note: z.string().optional(),
})

export type AssignLetterReportInput = z.infer<typeof assignLetterReportSchema>

export const importLettersSchema = z.object({
  letters: z.array(createLetterSchema).min(1, "At least one Letter is required"),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).optional(),
})

export type ImportLettersInput = z.infer<typeof importLettersSchema>

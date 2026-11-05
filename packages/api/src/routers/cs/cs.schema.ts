import { z } from "zod"
import { idSchema, paginationSchema, questionAttachmentSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listCsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  difficulty: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  isActive: z.union([z.boolean(), z.string()]).optional(),
  hasReport: z.union([z.boolean(), z.string()]).optional(),
  year: z.number().optional(),
  board: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListCsInput = z.infer<typeof listCsSchema>

export const csStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
})

export type CsStatsInput = z.infer<typeof csStatsSchema>

export const getCsSchema = idSchema
export type GetCsInput = z.infer<typeof getCsSchema>

export const createCsSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().min(1, "Chapter is required"),
  questionA: z.string().min(1, "Question A text is required"),
  questionB: z.string().min(1, "Question B text is required"),
  context: z.string().optional().nullable(),
  contextCaption: z.string().optional().nullable(),
  contextBottomContent: z.string().optional().nullable(),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  questionTypeId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  attachments: z.array(questionAttachmentSchema).optional().default([]),
})

export type CreateCsInput = z.infer<typeof createCsSchema>

export const updateCsSchema = createCsSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateCsInput = z.infer<typeof updateCsSchema>

export const deleteCsSchema = idSchema
export type DeleteCsInput = z.infer<typeof deleteCsSchema>

export const bulkDeleteCsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteCsInput = z.infer<typeof bulkDeleteCsSchema>

export const toggleCsActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleCsActiveInput = z.infer<typeof toggleCsActiveSchema>

export const importCsSchema = z.object({
  cses: z.array(createCsSchema).min(1, "At least one CS is required"),
})

export type ImportCsInput = z.infer<typeof importCsSchema>

export const resolveCsReportSchema = z.object({
  csId: z.string().min(1, "CS ID is required"),
  reportId: z.string().optional(),
  resolvedNote: z.string().optional(),
})

export type ResolveCsReportInput = z.infer<typeof resolveCsReportSchema>

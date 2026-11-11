import { z } from "zod"
import { QUESTION_DIFFICULTY } from "@workspace/utils"
import { idSchema, paginationSchema, questionAttachmentSchema } from "../../schemas/common"

export const listShortAnswersSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicClassId: z.string().optional(),
  difficulty: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  year: z.number().int().optional(),
  board: z.string().optional(),
  isMath: z.boolean().optional(),
  isActive: z.union([z.boolean(), z.string()]).optional(),
  hasReport: z.union([z.boolean(), z.string()]).optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export const shortAnswerStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export const shortAnswerBoardYearsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicClassId: z.string().optional(),
})

export const getShortAnswerSchema = idSchema

export const deleteShortAnswerSchema = idSchema

export const bulkDeleteShortAnswersSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export const toggleShortAnswerActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export const createShortAnswerSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().min(1, "Chapter is required"),
  question: z.string().min(1, "Question text is required"),
  answer: z.string().nullable().optional(),
  options: z.array(z.string()).optional().default([]),
  isMath: z.boolean().default(false),
  context: z.string().optional().nullable(),
  contextCaption: z.string().optional().nullable(),
  contextBottomContent: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  year: z.number().int().nullable().optional(),
  source: z.string().nullable().optional(),
  session: z.string().nullable().optional(),
  reference: z.array(z.string()).optional().default([]),
  questionTypeId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  attachments: z.array(questionAttachmentSchema).optional().default([]),
})

export const updateShortAnswerSchema = createShortAnswerSchema.partial().extend({
  id: z.string().min(1),
})

export const resolveShortAnswerReportSchema = z.object({
  shortAnswerId: z.string().min(1, "Short Answer ID is required"),
  reportId: z.string().optional(),
  resolvedNote: z.string().optional(),
})

export const assignShortAnswerReportSchema = z.object({
  shortAnswerId: z.string().min(1, "Short Answer ID is required"),
  reportId: z.string().optional(),
  assignedToId: z.string().min(1, "Assignee user ID is required"),
  note: z.string().optional(),
})

export const importShortAnswersSchema = z.object({
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).optional(),
  shortAnswers: z
    .array(createShortAnswerSchema)
    .min(1, "At least one Short Answer is required"),
})

export type ListShortAnswersInput = z.infer<typeof listShortAnswersSchema>
export type ShortAnswerStatsInput = z.infer<typeof shortAnswerStatsSchema>
export type ShortAnswerBoardYearsInput = z.infer<typeof shortAnswerBoardYearsSchema>
export type GetShortAnswerInput = z.infer<typeof getShortAnswerSchema>
export type CreateShortAnswerInput = z.infer<typeof createShortAnswerSchema>
export type UpdateShortAnswerInput = z.infer<typeof updateShortAnswerSchema>
export type DeleteShortAnswerInput = z.infer<typeof deleteShortAnswerSchema>
export type BulkDeleteShortAnswersInput = z.infer<typeof bulkDeleteShortAnswersSchema>
export type ToggleShortAnswerActiveInput = z.infer<typeof toggleShortAnswerActiveSchema>
export type ResolveShortAnswerReportInput = z.infer<typeof resolveShortAnswerReportSchema>
export type AssignShortAnswerReportInput = z.infer<typeof assignShortAnswerReportSchema>
export type ImportShortAnswersInput = z.infer<typeof importShortAnswersSchema>

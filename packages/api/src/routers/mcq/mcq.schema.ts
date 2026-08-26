import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listMcqsSchema = paginationSchema.extend({
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  board: z.string().optional(),
  type: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListMcqsInput = z.infer<typeof listMcqsSchema>

export const mcqStatsSchema = z.object({
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
})

export type McqStatsInput = z.infer<typeof mcqStatsSchema>

export const getMcqSchema = idSchema
export type GetMcqInput = z.infer<typeof getMcqSchema>

export const createMcqSchema = z.object({
  classId: z.string().min(1, "Academic class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().min(1, "Chapter is required"),
  question: z.string().min(1, "Question stem is required"),
  answer: z.string().min(1, "Correct answer is required"),
  options: z.array(z.string()).min(2, "At least 2 options are required"),
  statements: z.array(z.string()).optional().default([]),
  type: z.string().min(1, "Question type is required"),
  isMath: z.boolean().default(false),
  reference: z.array(z.string()).optional().default([]),
  explanation: z.string().optional().nullable(),
  questionUrl: z.string().optional().nullable(),
  contextId: z.string().optional().nullable(),
  context: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  year: z.number().int().optional().nullable(),
  source: z.string().optional().nullable(),
  questionTypeId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  attachments: z.array(z.object({
    url: z.string().min(1, "Attachment URL is required"),
    type: z.string().default("image"),
    caption: z.string().optional().nullable(),
    position: z.number().int().default(0),
  })).optional().default([]),
})

export type CreateMcqInput = z.infer<typeof createMcqSchema>

export const updateMcqSchema = createMcqSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateMcqInput = z.infer<typeof updateMcqSchema>

export const deleteMcqSchema = idSchema
export type DeleteMcqInput = z.infer<typeof deleteMcqSchema>

export const bulkDeleteMcqsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteMcqsInput = z.infer<typeof bulkDeleteMcqsSchema>

export const toggleMcqActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleMcqActiveInput = z.infer<typeof toggleMcqActiveSchema>

export const importMcqsSchema = z.object({
  mcqs: z.array(createMcqSchema).min(1, "At least one MCQ is required"),
})

export type ImportMcqsInput = z.infer<typeof importMcqsSchema>

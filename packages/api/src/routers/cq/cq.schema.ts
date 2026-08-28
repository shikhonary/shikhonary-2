import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listCqsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  board: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListCqsInput = z.infer<typeof listCqsSchema>

export const cqStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
})

export type CqStatsInput = z.infer<typeof cqStatsSchema>

export const getCqSchema = idSchema
export type GetCqInput = z.infer<typeof getCqSchema>

export const createCqSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().min(1, "Chapter is required"),
  questionA: z.string().min(1, "Question A text is required"),
  questionB: z.string().min(1, "Question B text is required"),
  questionC: z.string().min(1, "Question C text is required"),
  questionD: z.string().optional().nullable(),
  context: z.string().optional().nullable(),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  year: z.number().int().optional().nullable(),
  source: z.string().optional().nullable(),
  questionTypeId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  marks: z.record(z.any()).optional().nullable(),
  answer: z.object({
    answerA: z.string().optional().nullable(),
    answerB: z.string().optional().nullable(),
    answerC: z.string().optional().nullable(),
    answerD: z.string().optional().nullable(),
    explanation: z.string().optional().nullable(),
  }).optional().nullable(),
  attachments: z.array(z.object({
    url: z.string().min(1, "Attachment URL is required"),
    type: z.string().default("image"),
    caption: z.string().optional().nullable(),
    position: z.number().int().default(0),
  })).optional().default([]),
})

export type CreateCqInput = z.infer<typeof createCqSchema>

export const updateCqSchema = createCqSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateCqInput = z.infer<typeof updateCqSchema>

export const deleteCqSchema = idSchema
export type DeleteCqInput = z.infer<typeof deleteCqSchema>

export const bulkDeleteCqsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteCqsInput = z.infer<typeof bulkDeleteCqsSchema>

export const toggleCqActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleCqActiveInput = z.infer<typeof toggleCqActiveSchema>

export const importCqsSchema = z.object({
  cqs: z.array(createCqSchema).min(1, "At least one CQ is required"),
})

export type ImportCqsInput = z.infer<typeof importCqsSchema>

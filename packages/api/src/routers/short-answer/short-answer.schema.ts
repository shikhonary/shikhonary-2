import { z } from "zod"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listShortAnswersSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  page: z.number().min(1).default(1),
  query: z.string().optional(),
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).optional(),
  source: z.string().optional(),
  year: z.number().optional(),
  sort: z
    .enum(["createdAt_desc", "createdAt_asc", "question_asc", "question_desc"])
    .default("createdAt_desc"),
})

export const shortAnswerStatsSchema = z.object({
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
})

export const getShortAnswerSchema = z.object({
  id: z.string(),
})

export const deleteShortAnswerSchema = z.object({
  id: z.string(),
})

export const bulkDeleteShortAnswersSchema = z.object({
  ids: z.array(z.string()),
})

export const toggleShortAnswerActiveSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
})

export const createShortAnswerSchema = z.object({
  classId: z.string().min(1, "Academic class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().min(1, "Chapter is required"),
  question: z.string().min(1, "Question text is required"),
  answer: z.string().nullable().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  year: z.number().nullable().optional(),
  source: z.string().nullable().optional(),
  reference: z.array(z.string()).default([]),
  questionTypeId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  attachments: z
    .array(
      z.object({
        url: z.string(),
        type: z.string().default("image"),
        caption: z.string().nullable().optional(),
        position: z.number().default(0),
      })
    )
    .default([]),
})

export const updateShortAnswerSchema = createShortAnswerSchema.extend({
  id: z.string(),
})

export const importShortAnswersSchema = z.object({
  shortAnswers: z.array(
    z.object({
      classId: z.string().optional(),
      subjectId: z.string().optional(),
      chapterId: z.string().optional(),
      question: z.string(),
      answer: z.string().nullable().optional(),
      difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
      year: z.number().nullable().optional(),
      source: z.string().nullable().optional(),
      reference: z.array(z.string()).default([]),
      questionTypeId: z.string().nullable().optional(),
      isActive: z.boolean().default(true),
      attachments: z
        .array(
          z.object({
            url: z.string(),
            type: z.string().default("image"),
            caption: z.string().nullable().optional(),
            position: z.number().default(0),
          })
        )
        .optional(),
    })
  ),
})

export type ListShortAnswersInput = z.infer<typeof listShortAnswersSchema>
export type ShortAnswerStatsInput = z.infer<typeof shortAnswerStatsSchema>
export type GetShortAnswerInput = z.infer<typeof getShortAnswerSchema>
export type CreateShortAnswerInput = z.infer<typeof createShortAnswerSchema>
export type UpdateShortAnswerInput = z.infer<typeof updateShortAnswerSchema>
export type DeleteShortAnswerInput = z.infer<typeof deleteShortAnswerSchema>
export type BulkDeleteShortAnswersInput = z.infer<typeof bulkDeleteShortAnswersSchema>
export type ToggleShortAnswerActiveInput = z.infer<typeof toggleShortAnswerActiveSchema>
export type ImportShortAnswersInput = z.infer<typeof importShortAnswersSchema>

/**
 * CQ (Creative Question) domain — Zod input/output schemas.
 *
 * Single source of truth for CQ procedure types.
 */
import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const cqSortEnum = z.enum([
  "All",
  "newest",
  "oldest",
  "question_asc",
  "question_desc",
])
export type CqSortOption = z.infer<typeof cqSortEnum>

export const listCqsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  query: z.string().optional(),
  board: z.string().optional(),
  sort: cqSortEnum.optional(),
  page: z.number().int().min(1).optional(),
})

export type ListCqsInput = z.infer<typeof listCqsSchema>

export const getCqSchema = idSchema

export type GetCqInput = z.infer<typeof getCqSchema>

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const createCqAttachmentSchema = z.object({
  url: z.string().url("Valid URL is required"),
  type: z.string().default("image"),
  caption: z.string().nullable().optional(),
  position: z.number().int().default(0),
})

export const createCqAnswerSchema = z.object({
  answerA: z.string().nullable().optional(),
  answerB: z.string().nullable().optional(),
  answerC: z.string().nullable().optional(),
  answerD: z.string().nullable().optional(),
  explanation: z.string().nullable().optional(),
})

export const createCqSchema = z.object({
  questionA: z.string().min(1, "Question A is required"),
  questionB: z.string().min(1, "Question B is required"),
  questionC: z.string().min(1, "Question C is required"),
  questionD: z.string().nullable().optional(),
  context: z.string().nullable().optional(),
  reference: z.array(z.string()).default([]),
  subjectId: z.string().min(1, "Subject ID is required"),
  chapterId: z.string().min(1, "Chapter ID is required"),
  attachments: z.array(createCqAttachmentSchema).default([]),
  answer: createCqAnswerSchema.nullable().optional(),
})

export type CreateCqInput = z.infer<typeof createCqSchema>

export const updateCqAttachmentSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("Valid URL is required"),
  type: z.string().default("image"),
  caption: z.string().nullable().optional(),
  position: z.number().int().default(0),
})

export const updateCqAnswerSchema = z.object({
  answerA: z.string().nullable().optional(),
  answerB: z.string().nullable().optional(),
  answerC: z.string().nullable().optional(),
  answerD: z.string().nullable().optional(),
  explanation: z.string().nullable().optional(),
})

export const updateCqSchema = z.object({
  id: z.string().min(1),
  questionA: z.string().min(1).optional(),
  questionB: z.string().min(1).optional(),
  questionC: z.string().min(1).optional(),
  questionD: z.string().nullable().optional(),
  context: z.string().nullable().optional(),
  reference: z.array(z.string()).optional(),
  subjectId: z.string().min(1).optional(),
  chapterId: z.string().min(1).optional(),
  attachments: z.array(updateCqAttachmentSchema).optional(),
  answer: updateCqAnswerSchema.nullable().optional(),
})

export type UpdateCqInput = z.infer<typeof updateCqSchema>

export const deleteCqSchema = idSchema

export type DeleteCqInput = z.infer<typeof deleteCqSchema>

export const bulkDeleteCqsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one CQ ID is required"),
})

export type BulkDeleteCqsInput = z.infer<typeof bulkDeleteCqsSchema>

export const importCqsSchema = z.object({
  cqs: z.array(createCqSchema).min(1, "At least one CQ item is required for import"),
})

export type ImportCqsInput = z.infer<typeof importCqsSchema>

// ---------------------------------------------------------------------------
// Select Shape
// ---------------------------------------------------------------------------

export const safeCqSelect = {
  id: true,
  questionA: true,
  questionB: true,
  questionC: true,
  questionD: true,
  context: true,
  reference: true,
  subjectId: true,
  chapterId: true,
  createdAt: true,
  updatedAt: true,
  subject: {
    select: {
      id: true,
      name: true,
    },
  },
  chapter: {
    select: {
      id: true,
      name: true,
      position: true,
    },
  },
  attachments: {
    select: {
      id: true,
      url: true,
      type: true,
      caption: true,
      position: true,
    },
    orderBy: {
      position: "asc" as const,
    },
  },
  answer: {
    select: {
      id: true,
      answerA: true,
      answerB: true,
      answerC: true,
      answerD: true,
      explanation: true,
    },
  },
} as const

export const cqBoardYearsSchema = z.object({
  subjectId: z.string().min(1, "Subject ID is required"),
  chapterId: z.string().optional(),
})

export type CqBoardYearsInput = z.infer<typeof cqBoardYearsSchema>

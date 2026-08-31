import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listParagraphsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListParagraphsInput = z.infer<typeof listParagraphsSchema>

export const paragraphStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
})

export type ParagraphStatsInput = z.infer<typeof paragraphStatsSchema>

export const getParagraphSchema = idSchema
export type GetParagraphInput = z.infer<typeof getParagraphSchema>

export const createParagraphSchema = z.object({
  name: z.string().min(1, "Name is required"),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
})

export type CreateParagraphInput = z.infer<typeof createParagraphSchema>

export const updateParagraphSchema = createParagraphSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateParagraphInput = z.infer<typeof updateParagraphSchema>

export const deleteParagraphSchema = idSchema
export type DeleteParagraphInput = z.infer<typeof deleteParagraphSchema>

export const bulkDeleteParagraphsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteParagraphsInput = z.infer<typeof bulkDeleteParagraphsSchema>

export const importParagraphsSchema = z.object({
  paragraphs: z.array(createParagraphSchema).min(1, "At least one Paragraph is required"),
})

export type ImportParagraphsInput = z.infer<typeof importParagraphsSchema>

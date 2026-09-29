import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listPunctuationSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  academicChapterId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListPunctuationInput = z.infer<typeof listPunctuationSchema>

export const punctuationStatsSchema = z.object({
  subjectId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type PunctuationStatsInput = z.infer<typeof punctuationStatsSchema>

export const getPunctuationSchema = idSchema
export type GetPunctuationInput = z.infer<typeof getPunctuationSchema>

export const createPunctuationSchema = z.object({
  rawText: z.string().min(1, "Raw text is required"),
  prompt: z.string().optional().nullable(),
  answerText: z.string().optional().nullable(),
  totalMarks: z.number().int().optional().default(5),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  academicChapterId: z.string().optional().nullable(),
})

export type CreatePunctuationInput = z.infer<typeof createPunctuationSchema>

export const updatePunctuationSchema = createPunctuationSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdatePunctuationInput = z.infer<typeof updatePunctuationSchema>

export const deletePunctuationSchema = idSchema
export type DeletePunctuationInput = z.infer<typeof deletePunctuationSchema>

export const bulkDeletePunctuationSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeletePunctuationInput = z.infer<typeof bulkDeletePunctuationSchema>

export const importPunctuationSchema = z.object({
  punctuations: z.array(createPunctuationSchema).min(1, "At least one Punctuation item is required"),
})

export type ImportPunctuationInput = z.infer<typeof importPunctuationSchema>

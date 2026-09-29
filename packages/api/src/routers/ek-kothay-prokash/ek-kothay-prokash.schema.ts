import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listEkKothayProkashSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  wordMeaningId: z.string().optional(),
  difficulty: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListEkKothayProkashInput = z.infer<typeof listEkKothayProkashSchema>

export const ekKothayProkashStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type EkKothayProkashStatsInput = z.infer<typeof ekKothayProkashStatsSchema>

export const getEkKothayProkashSchema = idSchema
export type GetEkKothayProkashInput = z.infer<typeof getEkKothayProkashSchema>

export const createEkKothayProkashSchema = z.object({
  phrase: z.string().min(1, "Phrase is required"),
  oneWord: z.string().optional().nullable(),
  wordMeaningId: z.string().optional().nullable(),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
})

export type CreateEkKothayProkashInput = z.infer<typeof createEkKothayProkashSchema>

export const updateEkKothayProkashSchema = createEkKothayProkashSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateEkKothayProkashInput = z.infer<typeof updateEkKothayProkashSchema>

export const deleteEkKothayProkashSchema = idSchema
export type DeleteEkKothayProkashInput = z.infer<typeof deleteEkKothayProkashSchema>

export const bulkDeleteEkKothayProkashSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteEkKothayProkashInput = z.infer<typeof bulkDeleteEkKothayProkashSchema>

export const importEkKothayProkashSchema = z.object({
  questions: z.array(createEkKothayProkashSchema).min(1, "At least one Ek Kothay Prokash entry is required"),
})

export type ImportEkKothayProkashInput = z.infer<typeof importEkKothayProkashSchema>

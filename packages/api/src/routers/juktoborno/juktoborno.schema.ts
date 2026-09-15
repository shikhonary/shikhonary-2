import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listJuktobornoSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListJuktobornoInput = z.infer<typeof listJuktobornoSchema>

export const juktobornoStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type JuktobornoStatsInput = z.infer<typeof juktobornoStatsSchema>

export const getJuktobornoSchema = idSchema
export type GetJuktobornoInput = z.infer<typeof getJuktobornoSchema>

export const createJuktobornoSchema = z.object({
  juktoborno: z.string().min(1, "Juktoborno is required"),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
})

export type CreateJuktobornoInput = z.infer<typeof createJuktobornoSchema>

export const updateJuktobornoSchema = createJuktobornoSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateJuktobornoInput = z.infer<typeof updateJuktobornoSchema>

export const deleteJuktobornoSchema = idSchema
export type DeleteJuktobornoInput = z.infer<typeof deleteJuktobornoSchema>

export const bulkDeleteJuktobornoSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteJuktobornoInput = z.infer<typeof bulkDeleteJuktobornoSchema>

export const importJuktobornoSchema = z.object({
  questions: z.array(createJuktobornoSchema).min(1, "At least one juktoborno entry is required"),
})

export type ImportJuktobornoInput = z.infer<typeof importJuktobornoSchema>

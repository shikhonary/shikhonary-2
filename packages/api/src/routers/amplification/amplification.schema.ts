import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listAmplificationsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListAmplificationsInput = z.infer<typeof listAmplificationsSchema>

export const amplificationStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
})

export type AmplificationStatsInput = z.infer<typeof amplificationStatsSchema>

export const getAmplificationSchema = idSchema
export type GetAmplificationInput = z.infer<typeof getAmplificationSchema>

export const createAmplificationSchema = z.object({
  title: z.string().min(1, "Title/Proverb is required"),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
})

export type CreateAmplificationInput = z.infer<typeof createAmplificationSchema>

export const updateAmplificationSchema = createAmplificationSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateAmplificationInput = z.infer<typeof updateAmplificationSchema>

export const deleteAmplificationSchema = idSchema
export type DeleteAmplificationInput = z.infer<typeof deleteAmplificationSchema>

export const bulkDeleteAmplificationsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteAmplificationsInput = z.infer<typeof bulkDeleteAmplificationsSchema>

export const importAmplificationsSchema = z.object({
  amplifications: z.array(createAmplificationSchema).min(1, "At least one Amplification is required"),
})

export type ImportAmplificationsInput = z.infer<typeof importAmplificationsSchema>

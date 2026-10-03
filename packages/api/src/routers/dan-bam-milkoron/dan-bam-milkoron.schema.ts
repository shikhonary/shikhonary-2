import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listDanBamMilkoronSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  difficulty: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListDanBamMilkoronInput = z.infer<typeof listDanBamMilkoronSchema>

export const danBamMilkoronStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type DanBamMilkoronStatsInput = z.infer<typeof danBamMilkoronStatsSchema>

export const getDanBamMilkoronSchema = idSchema
export type GetDanBamMilkoronInput = z.infer<typeof getDanBamMilkoronSchema>

export const createDanBamMilkoronSchema = z.object({
  leftColumn: z.array(z.string()).min(1, "At least one item in left column is required"),
  rightColumn: z.array(z.string()).min(1, "At least one item in right column is required"),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
})

export type CreateDanBamMilkoronInput = z.infer<typeof createDanBamMilkoronSchema>

export const updateDanBamMilkoronSchema = createDanBamMilkoronSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateDanBamMilkoronInput = z.infer<typeof updateDanBamMilkoronSchema>

export const deleteDanBamMilkoronSchema = idSchema
export type DeleteDanBamMilkoronInput = z.infer<typeof deleteDanBamMilkoronSchema>

export const bulkDeleteDanBamMilkoronSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteDanBamMilkoronInput = z.infer<typeof bulkDeleteDanBamMilkoronSchema>

export const importDanBamMilkoronSchema = z.object({
  questions: z.array(createDanBamMilkoronSchema).min(1, "At least one item is required"),
})

export type ImportDanBamMilkoronInput = z.infer<typeof importDanBamMilkoronSchema>

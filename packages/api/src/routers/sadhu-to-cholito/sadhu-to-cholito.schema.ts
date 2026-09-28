import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listSadhuToCholitoSchema = paginationSchema.extend({
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

export type ListSadhuToCholitoInput = z.infer<typeof listSadhuToCholitoSchema>

export const sadhuToCholitoStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type SadhuToCholitoStatsInput = z.infer<typeof sadhuToCholitoStatsSchema>

export const getSadhuToCholitoSchema = idSchema
export type GetSadhuToCholitoInput = z.infer<typeof getSadhuToCholitoSchema>

export const createSadhuToCholitoSchema = z.object({
  sadhuText: z.string().min(1, "Sadhu text is required"),
  cholitoText: z.string().optional().nullable(),
  alternativeTexts: z.array(z.string()).optional().default([]),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
})

export type CreateSadhuToCholitoInput = z.infer<typeof createSadhuToCholitoSchema>

export const updateSadhuToCholitoSchema = createSadhuToCholitoSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateSadhuToCholitoInput = z.infer<typeof updateSadhuToCholitoSchema>

export const deleteSadhuToCholitoSchema = idSchema
export type DeleteSadhuToCholitoInput = z.infer<typeof deleteSadhuToCholitoSchema>

export const bulkDeleteSadhuToCholitoSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteSadhuToCholitoInput = z.infer<typeof bulkDeleteSadhuToCholitoSchema>

export const importSadhuToCholitoSchema = z.object({
  questions: z.array(createSadhuToCholitoSchema).min(1, "At least one sadhu to cholito entry is required"),
})

export type ImportSadhuToCholitoInput = z.infer<typeof importSadhuToCholitoSchema>

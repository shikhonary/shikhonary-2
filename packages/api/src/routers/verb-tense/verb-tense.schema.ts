import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listVerbTenseSchema = paginationSchema.extend({
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

export type ListVerbTenseInput = z.infer<typeof listVerbTenseSchema>

export const verbTenseStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type VerbTenseStatsInput = z.infer<typeof verbTenseStatsSchema>

export const getVerbTenseSchema = idSchema
export type GetVerbTenseInput = z.infer<typeof getVerbTenseSchema>

export const createVerbTenseSchema = z.object({
  verb: z.string().min(1, "Verb is required"),
  presentForm: z.string().optional().nullable(),
  pastForm: z.string().optional().nullable(),
  futureForm: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
})

export type CreateVerbTenseInput = z.infer<typeof createVerbTenseSchema>

export const updateVerbTenseSchema = createVerbTenseSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateVerbTenseInput = z.infer<typeof updateVerbTenseSchema>

export const deleteVerbTenseSchema = idSchema
export type DeleteVerbTenseInput = z.infer<typeof deleteVerbTenseSchema>

export const bulkDeleteVerbTenseSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteVerbTenseInput = z.infer<typeof bulkDeleteVerbTenseSchema>

export const importVerbTenseSchema = z.object({
  questions: z.array(createVerbTenseSchema).min(1, "At least one verb tense entry is required"),
})

export type ImportVerbTenseInput = z.infer<typeof importVerbTenseSchema>

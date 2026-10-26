import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listMakeSentencesSchema = paginationSchema.extend({
  academicClassId: z.string().optional(),
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  board: z.string().optional(),
  questionTypeId: z.string().optional(),
  difficulty: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  year: z.number().int().optional(),
  isActive: z.boolean().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
  search: z.string().optional(),
})

export type ListMakeSentencesInput = z.infer<typeof listMakeSentencesSchema>

export const makeSentencesStatsSchema = z.object({
  academicClassId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  questionTypeId: z.string().optional(),
})

export type MakeSentencesStatsInput = z.infer<typeof makeSentencesStatsSchema>

export const getMakeSentencesSchema = idSchema
export type GetMakeSentencesInput = z.infer<typeof getMakeSentencesSchema>

export const createMakeSentencesSchema = z.object({
  word: z.string().min(1, "Word is required"),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
  questionTypeId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export type CreateMakeSentencesInput = z.infer<typeof createMakeSentencesSchema>

export const updateMakeSentencesSchema = createMakeSentencesSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateMakeSentencesInput = z.infer<typeof updateMakeSentencesSchema>

export const deleteMakeSentencesSchema = idSchema
export type DeleteMakeSentencesInput = z.infer<typeof deleteMakeSentencesSchema>

export const bulkDeleteMakeSentencesSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteMakeSentencesInput = z.infer<typeof bulkDeleteMakeSentencesSchema>

export const toggleMakeSentencesActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleMakeSentencesActiveInput = z.infer<typeof toggleMakeSentencesActiveSchema>

export const importMakeSentencesSchema = z.object({
  questions: z.array(createMakeSentencesSchema).min(1, "At least one word entry is required"),
})

export type ImportMakeSentencesInput = z.infer<typeof importMakeSentencesSchema>

import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listOppositeWordSchema = paginationSchema.extend({
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

export type ListOppositeWordInput = z.infer<typeof listOppositeWordSchema>

export const oppositeWordStatsSchema = z.object({
  academicClassId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  questionTypeId: z.string().optional(),
})

export type OppositeWordStatsInput = z.infer<typeof oppositeWordStatsSchema>

export const getOppositeWordSchema = idSchema
export type GetOppositeWordInput = z.infer<typeof getOppositeWordSchema>

export const createOppositeWordSchema = z.object({
  word: z.string().min(1, "Word is required"),
  oppositeWord: z.string().optional().nullable(),
  oppositeWords: z.array(z.string()).optional().default([]),
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

export type CreateOppositeWordInput = z.infer<typeof createOppositeWordSchema>

export const updateOppositeWordSchema = createOppositeWordSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateOppositeWordInput = z.infer<typeof updateOppositeWordSchema>

export const deleteOppositeWordSchema = idSchema
export type DeleteOppositeWordInput = z.infer<typeof deleteOppositeWordSchema>

export const bulkDeleteOppositeWordSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteOppositeWordInput = z.infer<typeof bulkDeleteOppositeWordSchema>

export const toggleOppositeWordActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type ToggleOppositeWordActiveInput = z.infer<typeof toggleOppositeWordActiveSchema>

export const importOppositeWordSchema = z.object({
  questions: z.array(createOppositeWordSchema).min(1, "At least one opposite word entry is required"),
})

export type ImportOppositeWordInput = z.infer<typeof importOppositeWordSchema>

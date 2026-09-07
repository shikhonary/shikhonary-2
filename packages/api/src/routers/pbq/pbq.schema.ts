import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listPbqsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  board: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListPbqsInput = z.infer<typeof listPbqsSchema>

export const pbqStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type PbqStatsInput = z.infer<typeof pbqStatsSchema>

export const getPbqSchema = idSchema
export type GetPbqInput = z.infer<typeof getPbqSchema>

export const createPbqSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  academicChapterId: z.string().optional().nullable(),
  chapterId: z.string().optional().nullable(), // alias for academicChapterId convenience
  questionTypeId: z.string().optional().nullable(),
  context: z.string().min(1, "Context / passage is required"),
  questionA: z.string().min(1, "Question A text is required"),
  questionB: z.string().min(1, "Question B text is required"),
  questionC: z.string().min(1, "Question C text is required"),
  questionD: z.string().min(1, "Question D text is required"),
  questionE: z.string().min(1, "Question E text is required"),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  marks: z.record(z.any()).optional().nullable(),
  isActive: z.boolean().default(true),
})

export type CreatePbqInput = z.infer<typeof createPbqSchema>

export const updatePbqSchema = createPbqSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdatePbqInput = z.infer<typeof updatePbqSchema>

export const deletePbqSchema = idSchema
export type DeletePbqInput = z.infer<typeof deletePbqSchema>

export const bulkDeletePbqsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeletePbqsInput = z.infer<typeof bulkDeletePbqsSchema>

export const togglePbqActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
})

export type TogglePbqActiveInput = z.infer<typeof togglePbqActiveSchema>

export const importPbqsSchema = z.object({
  pbqs: z.array(createPbqSchema).min(1, "At least one PBQ is required"),
})

export type ImportPbqsInput = z.infer<typeof importPbqsSchema>

import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listPoemsSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListPoemsInput = z.infer<typeof listPoemsSchema>

export const poemStatsSchema = z.object({
  subjectId: z.string().optional(),
})

export type PoemStatsInput = z.infer<typeof poemStatsSchema>

export const getPoemSchema = idSchema
export type GetPoemInput = z.infer<typeof getPoemSchema>

export const createPoemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
})

export type CreatePoemInput = z.infer<typeof createPoemSchema>

export const updatePoemSchema = createPoemSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdatePoemInput = z.infer<typeof updatePoemSchema>

export const deletePoemSchema = idSchema
export type DeletePoemInput = z.infer<typeof deletePoemSchema>

export const bulkDeletePoemsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeletePoemsInput = z.infer<typeof bulkDeletePoemsSchema>

export const importPoemsSchema = z.object({
  poems: z.array(createPoemSchema).min(1, "At least one Poem is required"),
})

export type ImportPoemsInput = z.infer<typeof importPoemsSchema>

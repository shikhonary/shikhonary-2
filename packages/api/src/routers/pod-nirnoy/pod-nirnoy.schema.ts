import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listPodNirnoySchema = paginationSchema.extend({
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

export type ListPodNirnoyInput = z.infer<typeof listPodNirnoySchema>

export const podNirnoyStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type PodNirnoyStatsInput = z.infer<typeof podNirnoyStatsSchema>

export const getPodNirnoySchema = idSchema
export type GetPodNirnoyInput = z.infer<typeof getPodNirnoySchema>

export const createPodNirnoySchema = z
  .object({
    content: z.string().optional().nullable(),
    word: z.string().optional().nullable(),
    words: z.array(z.string()).optional().default([]),
    reference: z.array(z.string()).optional().default([]),
    source: z.string().optional().nullable(),
    session: z.string().optional().nullable(),
    difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
    popularityCount: z.number().int().optional().default(0),
    subjectId: z.string().min(1, "Subject is required"),
    chapterId: z.string().optional().nullable(),
    academicChapterId: z.string().optional().nullable(),
  })
  .refine(
    (data) => Boolean(data.content?.trim() || data.word?.trim() || (data.words && data.words.length > 0)),
    {
      message: "At least one of content, word, or words must be provided",
      path: ["content"],
    }
  )

export type CreatePodNirnoyInput = z.infer<typeof createPodNirnoySchema>

export const updatePodNirnoySchema = z.object({
  id: z.string().min(1),
  content: z.string().optional().nullable(),
  word: z.string().optional().nullable(),
  words: z.array(z.string()).optional(),
  reference: z.array(z.string()).optional(),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).optional(),
  popularityCount: z.number().int().optional(),
  subjectId: z.string().min(1).optional(),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
})

export type UpdatePodNirnoyInput = z.infer<typeof updatePodNirnoySchema>

export const deletePodNirnoySchema = idSchema
export type DeletePodNirnoyInput = z.infer<typeof deletePodNirnoySchema>

export const bulkDeletePodNirnoySchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeletePodNirnoyInput = z.infer<typeof bulkDeletePodNirnoySchema>

export const importPodNirnoySchema = z.object({
  questions: z.array(createPodNirnoySchema).min(1, "At least one Pod Nirnoy entry is required"),
})

export type ImportPodNirnoyInput = z.infer<typeof importPodNirnoySchema>

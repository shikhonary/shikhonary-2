/**
 * Chapter domain — Zod input/output schemas.
 *
 * Single source of truth for chapter procedure types.
 */
import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const chapterSortEnum = z.enum([
  "All",
  "position_asc",
  "position_desc",
  "name_asc",
  "name_desc",
  "newest",
  "oldest",
])
export type ChapterSortOption = z.infer<typeof chapterSortEnum>

export const listChaptersSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  query: z.string().optional(),
  sort: chapterSortEnum.optional(),
  page: z.number().int().min(1).optional(),
})

export type ListChaptersInput = z.infer<typeof listChaptersSchema>

export const getChapterSchema = idSchema

export type GetChapterInput = z.infer<typeof getChapterSchema>

export const chapterStatsSchema = z
  .object({
    subjectId: z.string().optional(),
  })
  .optional()

export type ChapterStatsInput = z.infer<typeof chapterStatsSchema>

export const chapterForSelectionSchema = z.object({
  subjectId: z.string().optional(),
})

export type ChapterForSelectionInput = z.infer<
  typeof chapterForSelectionSchema
>

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const createChapterSchema = z.object({
  name: z.string().min(1, "English name is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
  position: z.number().int().default(0),
})

export type CreateChapterInput = z.infer<typeof createChapterSchema>

export const updateChapterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  subjectId: z.string().min(1).optional(),
  position: z.number().int().optional(),
})

export type UpdateChapterInput = z.infer<typeof updateChapterSchema>

export const deleteChapterSchema = idSchema

export type DeleteChapterInput = z.infer<typeof deleteChapterSchema>

export const reorderChaptersSchema = z.object({
  subjectId: z.string().min(1),
  chapterIds: z.array(z.string().min(1)),
})

export type ReorderChaptersInput = z.infer<typeof reorderChaptersSchema>

// ---------------------------------------------------------------------------
// Select Shape
// ---------------------------------------------------------------------------

export const safeChapterSelect = {
  id: true,
  name: true,
  position: true,
  subjectId: true,
  createdAt: true,
  updatedAt: true,
  subject: {
    select: {
      id: true,
      name: true,
    },
  },
} as const

/**
 * Shared Zod validation schemas used across multiple routers.
 *
 * Centralising common shapes here avoids duplication and lets clients
 * import canonical types from `@workspace/api/schemas`.
 */
import { z } from "zod"

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/**
 * Cursor-based pagination input.
 * Prefer cursors over offsets for large/growing datasets.
 */
export const paginationSchema = z.object({
  /** Opaque cursor pointing to the last item of the previous page. */
  cursor: z.string().optional(),
  /** Max items to return. Clamped to 1-100, defaults to 20. */
  limit: z.number().int().min(1).max(100).default(20),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// ---------------------------------------------------------------------------
// Identifiers
// ---------------------------------------------------------------------------

/** Single cuid/cuid2 id input. */
export const idSchema = z.object({
  id: z.string().min(1),
})

export type IdInput = z.infer<typeof idSchema>

/** Slug input (URL-safe lowercase string). */
export const slugSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only."),
})

export type SlugInput = z.infer<typeof slugSchema>

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export const searchSchema = z.object({
  query: z.string().min(1).max(200),
})

export type SearchInput = z.infer<typeof searchSchema>

// ---------------------------------------------------------------------------
// Question Attachments
// ---------------------------------------------------------------------------

export const questionAttachmentSchema = z.object({
  id: z.string().optional(),
  type: z.string().optional().default("image"),
  caption: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  table: z.any().nullable().optional(),
  bottomContent: z.string().nullable().optional(),
  tableBorder: z.boolean().nullable().optional(),
  position: z.number().int().optional().default(0),
})

export type QuestionAttachmentInput = z.infer<typeof questionAttachmentSchema>

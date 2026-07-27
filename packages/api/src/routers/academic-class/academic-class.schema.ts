/**
 * Academic Class domain — Zod input/output schemas.
 *
 * Single source of truth for academic class procedure types.
 */
import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const academicClassSortEnum = z.enum([
  "All",
  "name_asc",
  "name_desc",
  "newest",
  "oldest",
])
export type AcademicClassSortOption = z.infer<typeof academicClassSortEnum>

export const listAcademicClassesSchema = paginationSchema.extend({
  isActive: z.boolean().optional(),
  query: z.string().optional(),
  sort: academicClassSortEnum.optional(),
  page: z.number().int().min(1).optional(),
})

export type ListAcademicClassesInput = z.infer<typeof listAcademicClassesSchema>

export const getAcademicClassSchema = idSchema

export type GetAcademicClassInput = z.infer<typeof getAcademicClassSchema>

export const academicClassForSelectionSchema = z.object({
  isActive: z.boolean().optional(),
})

export type AcademicClassForSelectionInput = z.infer<
  typeof academicClassForSelectionSchema
>

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const createAcademicClassSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isActive: z.boolean().optional().default(false),
})

export type CreateAcademicClassInput = z.infer<typeof createAcademicClassSchema>

export const updateAcademicClassSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
})

export type UpdateAcademicClassInput = z.infer<typeof updateAcademicClassSchema>

export const deleteAcademicClassSchema = idSchema

export type DeleteAcademicClassInput = z.infer<typeof deleteAcademicClassSchema>

// ---------------------------------------------------------------------------
// Select Shape
// ---------------------------------------------------------------------------

export const safeAcademicClassSelect = {
  id: true,
  name: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const

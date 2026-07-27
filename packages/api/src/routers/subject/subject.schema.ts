/**
 * Subject domain — Zod input/output schemas.
 *
 * Single source of truth for subject procedure types.
 */
import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const subjectSortEnum = z.enum([
  "All",
  "position_asc",
  "position_desc",
  "name_asc",
  "name_desc",
  "newest",
  "oldest",
])
export type SubjectSortOption = z.infer<typeof subjectSortEnum>

export const listSubjectsSchema = paginationSchema.extend({
  level: z.string().optional(),
  group: z.string().optional(),
  academicClassId: z.string().optional(),
  query: z.string().optional(),
  sort: subjectSortEnum.optional(),
  page: z.number().int().min(1).optional(),
})

export type ListSubjectsInput = z.infer<typeof listSubjectsSchema>

export const getSubjectSchema = idSchema

export type GetSubjectInput = z.infer<typeof getSubjectSchema>

export const subjectForSelectionSchema = z.object({
  level: z.string().optional(),
  group: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type SubjectForSelectionInput = z.infer<
  typeof subjectForSelectionSchema
>

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const createSubjectSchema = z.object({
  name: z.string().min(1, "English name is required"),
  nameBn: z.string().min(1, "Bangla name is required"),
  level: z.string().min(1, "Level is required"),
  group: z.string().nullable().optional(),
  position: z.number().int().default(0),
  academicClassIds: z.array(z.string()).optional(),
})

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>

export const updateSubjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  nameBn: z.string().min(1).optional(),
  level: z.string().min(1).optional(),
  group: z.string().nullable().optional(),
  position: z.number().int().optional(),
  academicClassIds: z.array(z.string()).optional(),
})

export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>

export const deleteSubjectSchema = idSchema

export type DeleteSubjectInput = z.infer<typeof deleteSubjectSchema>

export const assignAcademicClassesSchema = z.object({
  subjectId: z.string().min(1),
  academicClassIds: z.array(z.string()),
})

export type AssignAcademicClassesInput = z.infer<
  typeof assignAcademicClassesSchema
>

// ---------------------------------------------------------------------------
// Select Shape
// ---------------------------------------------------------------------------

export const safeSubjectSelect = {
  id: true,
  name: true,
  nameBn: true,
  level: true,
  group: true,
  position: true,
  createdAt: true,
  updatedAt: true,
  academicClasses: {
    select: {
      id: true,
      academicClassId: true,
      academicClass: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
    },
  },
  _count: {
    select: {
      chapters: true,
      academicClasses: true,
    },
  },
} as const

/**
 * Student domain — Zod input/output schemas.
 *
 * Single source of truth for student procedure input validation and shapes.
 */
import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const completeStudentOnboardingSchema = z.object({
  // Required fields according to Prisma model / client
  name: z.string().min(1, "Name is required"),
  academicClassId: z.string().min(1, "Academic class selection is required"),

  // Optional/derived fields
  phone: z.string().optional(),
  institute: z.string().optional(),

  // Optional fields
  roll: z.coerce.number().int().optional().nullable(),
  isOfflineStudent: z.boolean().optional(),
  imageUrl: z.string().optional(),

  // Legacy/ignored fields that client might send (made optional so client doesn't break)
  studentId: z.any().optional(),
  nameBn: z.string().optional(),
  mPhone: z.string().optional(),
  session: z.string().optional(),
  section: z.string().optional(),
  shift: z.string().optional(),
  group: z.string().optional(),
  fName: z.string().optional(),
  mName: z.string().optional(),
  gender: z.string().optional(),
  dob: z.any().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  fPhone: z.string().optional(),
  presentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
})

export type CompleteStudentOnboardingInput = z.infer<
  typeof completeStudentOnboardingSchema
>

export const updateStudentProfileSchema = completeStudentOnboardingSchema.partial()

export type UpdateStudentProfileInput = z.infer<
  typeof updateStudentProfileSchema
>

export const safeStudentSelect = {
  id: true,
  name: true,
  phone: true,
  institute: true,
  roll: true,
  isOfflineStudent: true,
  academicClassId: true,
  academicClass: {
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  },
  userId: true,
  user: {
    select: {
      image: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} as const

// ---------------------------------------------------------------------------
// Admin Queries / Mutations Schemas
// ---------------------------------------------------------------------------

export const studentSortEnum = z.enum([
  "All",
  "name_asc",
  "name_desc",
  "roll_asc",
  "roll_desc",
  "newest",
  "oldest",
])
export type StudentSortOption = z.infer<typeof studentSortEnum>

export const listStudentsSchema = paginationSchema.extend({
  academicClassId: z.string().optional(),
  isOfflineStudent: z.boolean().optional(),
  isLinkedToUser: z.boolean().optional(),
  query: z.string().optional(),
  sort: studentSortEnum.optional(),
  page: z.number().int().min(1).optional(),
})
export type ListStudentsInput = z.infer<typeof listStudentsSchema>

export const getStudentSchema = idSchema
export type GetStudentInput = z.infer<typeof getStudentSchema>

export const createStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  institute: z.string().min(1, "Institute name is required"),
  roll: z.number().int().optional().nullable(),
  isOfflineStudent: z.boolean().optional().default(false),
  academicClassId: z.string().min(1, "Academic class is required"),
  userId: z.string().optional().nullable(),
})
export type CreateStudentInput = z.infer<typeof createStudentSchema>

export const updateStudentAdminSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  institute: z.string().min(1).optional(),
  roll: z.number().int().optional().nullable(),
  isOfflineStudent: z.boolean().optional(),
  academicClassId: z.string().min(1).optional(),
  userId: z.string().optional().nullable(),
})
export type UpdateStudentAdminInput = z.infer<typeof updateStudentAdminSchema>

export const deleteStudentSchema = idSchema
export type DeleteStudentInput = z.infer<typeof deleteStudentSchema>

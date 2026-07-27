/**
 * Student domain — Zod input/output schemas.
 *
 * Single source of truth for student procedure input validation and shapes.
 */
import { z } from "zod"

export const completeStudentOnboardingSchema = z.object({
  // Required fields according to Prisma model
  studentId: z.coerce.number().int().min(1, "Student ID is required"),
  name: z.string().min(1, "Name (English) is required"),
  nameBn: z.string().min(1, "Name (Bengali) is required"),
  mPhone: z.string().min(1, "Mother's phone number is required"),
  academicClassId: z.string().min(1, "Academic class selection is required"),

  // Optional academic fields
  session: z.string().optional(),
  section: z.string().optional(),
  shift: z.string().optional(),
  group: z.string().optional(),
  roll: z.coerce.number().int().optional(),

  // Optional personal fields
  fName: z.string().optional(),
  mName: z.string().optional(),
  gender: z.string().optional(),
  dob: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  imageUrl: z.string().optional(),

  // Optional contact & address fields
  fPhone: z.string().optional(),
  presentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
})

export type CompleteStudentOnboardingInput = z.infer<
  typeof completeStudentOnboardingSchema
>

export const updateStudentProfileSchema = completeStudentOnboardingSchema.partial().extend({
  studentId: z.coerce.number().int().optional(),
  name: z.string().optional(),
  nameBn: z.string().optional(),
  mPhone: z.string().optional(),
  academicClassId: z.string().optional(),
})

export type UpdateStudentProfileInput = z.infer<
  typeof updateStudentProfileSchema
>

export const safeStudentSelect = {
  id: true,
  studentId: true,
  name: true,
  nameBn: true,
  session: true,
  fName: true,
  mName: true,
  gender: true,
  dob: true,
  nationality: true,
  religion: true,
  imageUrl: true,
  section: true,
  shift: true,
  group: true,
  roll: true,
  fPhone: true,
  mPhone: true,
  presentAddress: true,
  permanentAddress: true,
  academicClassId: true,
  academicClass: {
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  },
  userId: true,
  createdAt: true,
  updatedAt: true,
} as const

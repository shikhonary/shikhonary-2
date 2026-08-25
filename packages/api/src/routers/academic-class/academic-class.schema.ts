import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const listAcademicClassesSchema = paginationSchema.extend({
  isActive: z.boolean().optional(),
  query: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  academicYearId: z.string().optional(),
})

export type ListAcademicClassesInput = z.infer<typeof listAcademicClassesSchema>

export const getAcademicClassSchema = idSchema

export type GetAcademicClassInput = z.infer<typeof getAcademicClassSchema>

export const createAcademicClassSchema = z.object({
  nameBn: z.string().min(1),
  nameEn: z.string().min(1),
  position: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

export type CreateAcademicClassInput = z.infer<typeof createAcademicClassSchema>

export const updateAcademicClassSchema = z.object({
  id: z.string().min(1),
  nameBn: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  position: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

export type UpdateAcademicClassInput = z.infer<typeof updateAcademicClassSchema>

export const deleteAcademicClassSchema = idSchema

export type DeleteAcademicClassInput = z.infer<typeof deleteAcademicClassSchema>


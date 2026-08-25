import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const listAcademicYearsSchema = paginationSchema.extend({
  isActive: z.boolean().optional(),
  query: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
})

export type ListAcademicYearsInput = z.infer<typeof listAcademicYearsSchema>

export const getAcademicYearSchema = idSchema

export type GetAcademicYearInput = z.infer<typeof getAcademicYearSchema>

export const createAcademicYearSchema = z.object({
  nameBn: z.string().min(1),
  nameEn: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isCurrent: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>

export const updateAcademicYearSchema = z.object({
  id: z.string().min(1),
  nameBn: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isCurrent: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export type UpdateAcademicYearInput = z.infer<typeof updateAcademicYearSchema>

export const deleteAcademicYearSchema = idSchema

export type DeleteAcademicYearInput = z.infer<typeof deleteAcademicYearSchema>


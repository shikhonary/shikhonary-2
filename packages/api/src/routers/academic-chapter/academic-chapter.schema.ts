import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const listAcademicChaptersSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  academicYearId: z.string().optional(),
  isActive: z.boolean().optional(),
  query: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
})

export type ListAcademicChaptersInput = z.infer<typeof listAcademicChaptersSchema>

export const getAcademicChapterSchema = idSchema

export type GetAcademicChapterInput = z.infer<typeof getAcademicChapterSchema>

export const createAcademicChapterSchema = z.object({
  nameBn: z.string().min(1),
  nameEn: z.string().min(1),
  position: z.number().int().default(0),
  isActive: z.boolean().default(true),
  subjectId: z.string().min(1),
  academicYearId: z.string().optional().nullable(),
})

export type CreateAcademicChapterInput = z.infer<typeof createAcademicChapterSchema>

export const updateAcademicChapterSchema = z.object({
  id: z.string().min(1),
  nameBn: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  position: z.number().int().optional(),
  isActive: z.boolean().optional(),
  subjectId: z.string().min(1).optional(),
  academicYearId: z.string().optional().nullable(),
})

export type UpdateAcademicChapterInput = z.infer<typeof updateAcademicChapterSchema>

export const deleteAcademicChapterSchema = idSchema

export type DeleteAcademicChapterInput = z.infer<typeof deleteAcademicChapterSchema>


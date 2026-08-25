import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const listAcademicSubjectsSchema = paginationSchema.extend({
  academicYearId: z.string().optional(),
  classId: z.string().optional(),
  isActive: z.boolean().optional(),
  query: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
})

export type ListAcademicSubjectsInput = z.infer<typeof listAcademicSubjectsSchema>

export const getAcademicSubjectSchema = idSchema

export type GetAcademicSubjectInput = z.infer<typeof getAcademicSubjectSchema>

export const createAcademicSubjectSchema = z.object({
  nameBn: z.string().min(1),
  nameEn: z.string().min(1),
  code: z.string().optional().nullable(),
  group: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  academicYearId: z.string().optional().nullable(),
  classIds: z.array(z.string()).optional(),
})

export type CreateAcademicSubjectInput = z.infer<typeof createAcademicSubjectSchema>

export const updateAcademicSubjectSchema = z.object({
  id: z.string().min(1),
  nameBn: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  code: z.string().optional().nullable(),
  group: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  academicYearId: z.string().optional().nullable(),
  classIds: z.array(z.string()).optional(),
})

export type UpdateAcademicSubjectInput = z.infer<typeof updateAcademicSubjectSchema>

export const deleteAcademicSubjectSchema = idSchema

export type DeleteAcademicSubjectInput = z.infer<typeof deleteAcademicSubjectSchema>

export const saveSubjectQuestionTypesSchema = z.object({
  subjectId: z.string().min(1),
  questionTypes: z.array(
    z.object({
      questionTypeId: z.string().min(1),
      mark: z.number().min(0),
      requiredCount: z.number().int().min(0),
      totalQuestions: z.number().int().min(0),
      markDistribution: z.record(z.string(), z.number()).optional().nullable(),
    })
  ),
})

export type SaveSubjectQuestionTypesInput = z.infer<typeof saveSubjectQuestionTypesSchema>


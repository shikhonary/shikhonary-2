import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const listQuestionTypesSchema = paginationSchema.extend({
  isActive: z.boolean().optional(),
  query: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  subjectId: z.string().optional(),
})

export type ListQuestionTypesInput = z.infer<typeof listQuestionTypesSchema>

export const getQuestionTypeSchema = idSchema

export type GetQuestionTypeInput = z.infer<typeof getQuestionTypeSchema>

export const createQuestionTypeSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameBn: z.string().min(1, "Bangla name is required"),
  label: z.string().optional().nullable(),
  mark: z.number().min(0, "Mark must be at least 0"),
  position: z.number().int().min(0).default(0),
  descriptionEn: z.string().optional().nullable(),
  descriptionBn: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export type CreateQuestionTypeInput = z.infer<typeof createQuestionTypeSchema>

export const updateQuestionTypeSchema = z.object({
  id: z.string().min(1),
  nameEn: z.string().min(1).optional(),
  nameBn: z.string().min(1).optional(),
  label: z.string().optional().nullable(),
  mark: z.number().min(0).optional(),
  position: z.number().int().min(0).optional(),
  descriptionEn: z.string().optional().nullable(),
  descriptionBn: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

export type UpdateQuestionTypeInput = z.infer<typeof updateQuestionTypeSchema>

export const deleteQuestionTypeSchema = idSchema

export type DeleteQuestionTypeInput = z.infer<typeof deleteQuestionTypeSchema>

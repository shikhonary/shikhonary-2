import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listFormFillupSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
  difficulty: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListFormFillupInput = z.infer<typeof listFormFillupSchema>
export type ListFormFillingInput = ListFormFillupInput

export const formFillupStatsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  academicChapterId: z.string().optional(),
})

export type FormFillupStatsInput = z.infer<typeof formFillupStatsSchema>
export type FormFillingStatsInput = FormFillupStatsInput

export const getFormFillupSchema = idSchema
export type GetFormFillupInput = z.infer<typeof getFormFillupSchema>
export type GetFormFillingInput = GetFormFillupInput

export const createFormFillupSchema = z.object({
  scenario: z.string().min(1, "Scenario is required"),
  institution: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  hasPhoto: z.boolean().optional().default(false),
  declaration: z.string().optional().nullable(),
  signatures: z.array(z.string()).optional().default([]),
  formData: z.any().refine((val) => val !== undefined && val !== null, "formData is required"),
  solution: z.any().optional().nullable(),
  reference: z.array(z.string()).optional().default([]),
  source: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional().nullable(),
  academicChapterId: z.string().optional().nullable(),
})

export type CreateFormFillupInput = z.infer<typeof createFormFillupSchema>
export type CreateFormFillingInput = CreateFormFillupInput

export const updateFormFillupSchema = createFormFillupSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateFormFillupInput = z.infer<typeof updateFormFillupSchema>
export type UpdateFormFillingInput = UpdateFormFillupInput

export const deleteFormFillupSchema = idSchema
export type DeleteFormFillupInput = z.infer<typeof deleteFormFillupSchema>
export type DeleteFormFillingInput = DeleteFormFillupInput

export const bulkDeleteFormFillupSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteFormFillupInput = z.infer<typeof bulkDeleteFormFillupSchema>
export type BulkDeleteFormFillingInput = BulkDeleteFormFillupInput

export const importFormFillupSchema = z.object({
  questions: z.array(createFormFillupSchema).min(1, "At least one form fillup entry is required"),
})

export type ImportFormFillupInput = z.infer<typeof importFormFillupSchema>
export type ImportFormFillingInput = ImportFormFillupInput

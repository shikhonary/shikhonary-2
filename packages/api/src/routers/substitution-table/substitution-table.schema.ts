import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

export const listSubstitutionTablesSchema = paginationSchema.extend({
  subjectId: z.string().optional(),
  difficulty: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  query: z.string().optional(),
})

export type ListSubstitutionTablesInput = z.infer<typeof listSubstitutionTablesSchema>

export const substitutionTableStatsSchema = z.object({
  subjectId: z.string().optional(),
})

export type SubstitutionTableStatsInput = z.infer<typeof substitutionTableStatsSchema>

export const getSubstitutionTableSchema = idSchema
export type GetSubstitutionTableInput = z.infer<typeof getSubstitutionTableSchema>

export const createSubstitutionTableSchema = z.object({
  columnA: z.array(z.string()).default([]),
  columnB: z.array(z.string()).default([]),
  columnC: z.array(z.string()).default([]),
  reference: z.array(z.string()).optional().default([]),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY).default(QUESTION_DIFFICULTY.MEDIUM),
  popularityCount: z.number().int().optional().default(0),
  subjectId: z.string().min(1, "Subject is required"),
})

export type CreateSubstitutionTableInput = z.infer<typeof createSubstitutionTableSchema>

export const updateSubstitutionTableSchema = createSubstitutionTableSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateSubstitutionTableInput = z.infer<typeof updateSubstitutionTableSchema>

export const deleteSubstitutionTableSchema = idSchema
export type DeleteSubstitutionTableInput = z.infer<typeof deleteSubstitutionTableSchema>

export const bulkDeleteSubstitutionTablesSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
})

export type BulkDeleteSubstitutionTablesInput = z.infer<typeof bulkDeleteSubstitutionTablesSchema>

export const importSubstitutionTablesSchema = z.object({
  items: z.array(createSubstitutionTableSchema).min(1, "At least one item is required"),
})

export type ImportSubstitutionTablesInput = z.infer<typeof importSubstitutionTablesSchema>

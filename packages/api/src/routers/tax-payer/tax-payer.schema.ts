import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const listTaxPayersSchema = paginationSchema.extend({
  search: z.string().max(100).optional(),
  wardId: z.string().optional(),
  fiscalYearId: z.string().optional(),
  unpaidOnly: z.boolean().optional(),
  sort: z
    .enum([
      "all",
      "name_asc",
      "name_desc",
      "newest",
      "oldest",
      "holding_asc",
      "holding_desc",
      "tax_asc",
      "tax_desc",
    ])
    .optional(),
})

export type ListTaxPayersInput = z.infer<typeof listTaxPayersSchema>

export const getTaxPayerSchema = idSchema

export type GetTaxPayerInput = z.infer<typeof getTaxPayerSchema>

export const getTaxPayerByHoldingSchema = z.object({
  holding: z.string().min(1, "Holding number is required"),
  wardId: z.string().optional(),
})

export type GetTaxPayerByHoldingInput = z.infer<typeof getTaxPayerByHoldingSchema>

export const taxPayerStatsSchema = z.object({
  wardId: z.string().optional(),
  fiscalYearId: z.string().optional(),
})

export type TaxPayerStatsInput = z.infer<typeof taxPayerStatsSchema>

export const createTaxPayerSchema = z.object({
  holding: z.string().min(1, "Holding number is required"),
  name: z.string().min(1, "Name is required"),
  fatherName: z.string().optional(),
  phone: z.string().optional(),
  nid: z.string().optional(),
  wardId: z.string().min(1, "Ward is required"),
  village: z.string().min(1, "Village is required"),
  tax: z.number().int().min(0).default(0),
})

export type CreateTaxPayerInput = z.infer<typeof createTaxPayerSchema>

export const bulkCreateTaxPayerSchema = z.object({
  items: z.array(createTaxPayerSchema).min(1, "At least one taxpayer is required"),
})

export type BulkCreateTaxPayerInput = z.infer<typeof bulkCreateTaxPayerSchema>

export const updateTaxPayerSchema = z.object({
  id: z.string().min(1),
  holding: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  fatherName: z.string().optional(),
  phone: z.string().optional(),
  nid: z.string().optional(),
  wardId: z.string().min(1).optional(),
  village: z.string().min(1).optional(),
  tax: z.number().int().min(0).optional(),
})

export type UpdateTaxPayerInput = z.infer<typeof updateTaxPayerSchema>

export const deleteTaxPayerSchema = idSchema

export type DeleteTaxPayerInput = z.infer<typeof deleteTaxPayerSchema>

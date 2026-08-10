import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const listTenantFiscalYearsSchema = paginationSchema.extend({
  search: z.string().optional(),
  sort: z.enum(["all", "name_asc", "name_desc", "newest", "oldest"]).optional(),
})

export type ListTenantFiscalYearsInput = z.infer<typeof listTenantFiscalYearsSchema>

export const getTenantFiscalYearSchema = idSchema

export type GetTenantFiscalYearInput = z.infer<typeof getTenantFiscalYearSchema>

export const createTenantFiscalYearSchema = z.object({
  year: z.string().min(4).max(20), // e.g. "2026" or "2025-2026"
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isCurrent: z.boolean().default(false),
})

export type CreateTenantFiscalYearInput = z.infer<typeof createTenantFiscalYearSchema>

export const updateTenantFiscalYearSchema = z.object({
  id: z.string().min(1),
  year: z.string().min(4).max(20).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isCurrent: z.boolean().optional(),
})

export type UpdateTenantFiscalYearInput = z.infer<typeof updateTenantFiscalYearSchema>

export const deleteTenantFiscalYearSchema = idSchema

export type DeleteTenantFiscalYearInput = z.infer<typeof deleteTenantFiscalYearSchema>

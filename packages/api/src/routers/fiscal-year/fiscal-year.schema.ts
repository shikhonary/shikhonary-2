import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const listFiscalYearsSchema = paginationSchema.extend({
  tenantId: z.string().optional(),
  query: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
})

export type ListFiscalYearsInput = z.infer<typeof listFiscalYearsSchema>

export const getFiscalYearSchema = idSchema

export type GetFiscalYearInput = z.infer<typeof getFiscalYearSchema>

export const createFiscalYearSchema = z.object({
  year: z.string().min(4).max(10), // e.g. "2026" or "2025-2026"
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isCurrent: z.boolean().default(false),
  tenantId: z.string().optional(),
})

export type CreateFiscalYearInput = z.infer<typeof createFiscalYearSchema>

export const updateFiscalYearSchema = z.object({
  id: z.string().min(1),
  year: z.string().min(4).max(10).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isCurrent: z.boolean().optional(),
  tenantId: z.string().optional(),
})

export type UpdateFiscalYearInput = z.infer<typeof updateFiscalYearSchema>

export const deleteFiscalYearSchema = idSchema

export type DeleteFiscalYearInput = z.infer<typeof deleteFiscalYearSchema>

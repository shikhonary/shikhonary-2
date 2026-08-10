import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const listTaxPaymentsSchema = paginationSchema.extend({
  search: z.string().optional(),
  taxPayerId: z.string().optional(),
  fiscalYearId: z.string().optional(),
  wardId: z.string().optional(),
  status: z.enum(["all", "paid", "unpaid"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sort: z.enum(["all", "newest", "oldest", "amount_asc", "amount_desc"]).optional(),
})

export type ListTaxPaymentsInput = z.infer<typeof listTaxPaymentsSchema>

export const getTaxPaymentSchema = idSchema

export type GetTaxPaymentInput = z.infer<typeof getTaxPaymentSchema>

export const getPaymentByReceiptNoSchema = z.object({
  receiptNo: z.string().min(1, "Receipt number is required"),
})

export type GetPaymentByReceiptNoInput = z.infer<typeof getPaymentByReceiptNoSchema>

export const taxPaymentStatsSchema = z.object({
  fiscalYearId: z.string().optional(),
  wardId: z.string().optional(),
})

export type TaxPaymentStatsInput = z.infer<typeof taxPaymentStatsSchema>

export const createTaxPaymentSchema = z.object({
  taxPayerId: z.string().min(1, "Tax payer is required"),
  fiscalYearId: z.string().min(1, "Fiscal year is required"),
  amount: z.number().int().min(1, "Amount must be at least 1"),
  receiptNo: z.string().optional(),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.string().optional(),
  note: z.string().optional(),
})

export type CreateTaxPaymentInput = z.infer<typeof createTaxPaymentSchema>

export const updateTaxPaymentSchema = z.object({
  id: z.string().min(1),
  amount: z.number().int().min(1).optional(),
  receiptNo: z.string().optional(),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.string().optional(),
  note: z.string().optional(),
})

export type UpdateTaxPaymentInput = z.infer<typeof updateTaxPaymentSchema>

export const deleteTaxPaymentSchema = idSchema

export type DeleteTaxPaymentInput = z.infer<typeof deleteTaxPaymentSchema>

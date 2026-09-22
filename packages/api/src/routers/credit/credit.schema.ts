import { z } from "zod"
import { paginationSchema } from "../../schemas/common"

export const getCreditBalanceSchema = z.object({}).optional()

export const listCreditTransactionsSchema = paginationSchema.extend({
  type: z.enum(["SUBSCRIPTION_REFRESH", "PURCHASE", "USAGE", "REFUND", "ADMIN_ADJUSTMENT"]).optional(),
  page: z.number().int().min(1).optional(),
})

export type ListCreditTransactionsInput = z.infer<typeof listCreditTransactionsSchema>

export const estimatePaperCostSchema = z.object({
  questionTypeCounts: z.array(
    z.object({
      questionTypeId: z.string().min(1),
      count: z.number().int().min(1),
    })
  ),
})

export type EstimatePaperCostInput = z.infer<typeof estimatePaperCostSchema>

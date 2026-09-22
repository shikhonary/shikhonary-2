import { createTRPCRouter, tenantMemberProcedure } from "../../trpc"
import { listCreditTransactionsSchema, estimatePaperCostSchema } from "./credit.schema"
import {
  getTenantCreditBalance,
  listTenantCreditTransactions,
  getQuestionTypePricing,
  estimatePaperCost,
} from "./credit.service"

export const creditRouter = createTRPCRouter({
  getBalance: tenantMemberProcedure.query(({ ctx }) =>
    getTenantCreditBalance(ctx.db, ctx.tenant.id)
  ),

  getTransactions: tenantMemberProcedure
    .input(listCreditTransactionsSchema)
    .query(({ ctx, input }) =>
      listTenantCreditTransactions(ctx.db, ctx.tenant.id, input)
    ),

  getPricing: tenantMemberProcedure.query(({ ctx }) =>
    getQuestionTypePricing(ctx.db)
  ),

  estimateCost: tenantMemberProcedure
    .input(estimatePaperCostSchema)
    .query(({ ctx, input }) =>
      estimatePaperCost(ctx.db, input)
    ),
})

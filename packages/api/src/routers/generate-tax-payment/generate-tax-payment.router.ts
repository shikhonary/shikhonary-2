import { createTRPCRouter, tenantMemberProcedure } from "../../trpc"
import {
  executeTaxGenerationSchema,
  generationStatsSchema,
  previewTaxGenerationSchema,
} from "./generate-tax-payment.schema"
import {
  executeTaxGeneration,
  getGenerationStats,
  previewTaxGeneration,
} from "./generate-tax-payment.service"

export const generateTaxPaymentRouter = createTRPCRouter({
  preview: tenantMemberProcedure
    .input(previewTaxGenerationSchema)
    .query(({ ctx, input }) => previewTaxGeneration(ctx.tenantDb, input)),

  executeBatch: tenantMemberProcedure
    .input(executeTaxGenerationSchema)
    .mutation(({ ctx, input }) => executeTaxGeneration(ctx.tenantDb, input)),

  stats: tenantMemberProcedure
    .input(generationStatsSchema)
    .query(({ ctx, input }) => getGenerationStats(ctx.tenantDb, input)),
})

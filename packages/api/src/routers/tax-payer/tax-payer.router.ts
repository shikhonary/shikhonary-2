import { createTRPCRouter, tenantMemberProcedure, publicTenantProcedure } from "../../trpc"
import {
  bulkCreateTaxPayerSchema,
  createTaxPayerSchema,
  deleteTaxPayerSchema,
  getTaxPayerByHoldingSchema,
  getTaxPayerSchema,
  listTaxPayersSchema,
  taxPayerStatsSchema,
  updateTaxPayerSchema,
} from "./tax-payer.schema"
import {
  bulkCreateTaxPayers,
  createTaxPayer,
  deleteTaxPayer,
  getTaxPayerByHolding,
  getTaxPayerById,
  getTaxPayerStats,
  listTaxPayers,
  updateTaxPayer,
} from "./tax-payer.service"

export const taxPayerRouter = createTRPCRouter({
  list: tenantMemberProcedure
    .input(listTaxPayersSchema)
    .query(({ ctx, input }) => listTaxPayers(ctx.tenantDb, input)),

  byId: publicTenantProcedure
    .input(getTaxPayerSchema)
    .query(({ ctx, input }) => getTaxPayerById(ctx.tenantDb, input)),

  byHolding: tenantMemberProcedure
    .input(getTaxPayerByHoldingSchema)
    .query(({ ctx, input }) => getTaxPayerByHolding(ctx.tenantDb, input)),

  stats: tenantMemberProcedure
    .input(taxPayerStatsSchema)
    .query(({ ctx, input }) => getTaxPayerStats(ctx.tenantDb, input)),

  create: tenantMemberProcedure
    .input(createTaxPayerSchema)
    .mutation(({ ctx, input }) => createTaxPayer(ctx.tenantDb, input)),

  bulkCreate: tenantMemberProcedure
    .input(bulkCreateTaxPayerSchema)
    .mutation(({ ctx, input }) => bulkCreateTaxPayers(ctx.tenantDb, input)),

  update: tenantMemberProcedure
    .input(updateTaxPayerSchema)
    .mutation(({ ctx, input }) => updateTaxPayer(ctx.tenantDb, input)),

  delete: tenantMemberProcedure
    .input(deleteTaxPayerSchema)
    .mutation(({ ctx, input }) => deleteTaxPayer(ctx.tenantDb, input)),
})

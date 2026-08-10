import { createTRPCRouter, tenantMemberProcedure, publicTenantProcedure } from "../../trpc"
import {
  createTaxPaymentSchema,
  deleteTaxPaymentSchema,
  getPaymentByReceiptNoSchema,
  getTaxPaymentSchema,
  listTaxPaymentsSchema,
  taxPaymentStatsSchema,
  updateTaxPaymentSchema,
} from "./tax-payment.schema"
import {
  createTaxPayment,
  deleteTaxPayment,
  getPaymentByReceiptNo,
  getTaxPaymentById,
  getTaxPaymentStats,
  listTaxPayments,
  updateTaxPayment,
} from "./tax-payment.service"

export const taxPaymentRouter = createTRPCRouter({
  list: tenantMemberProcedure
    .input(listTaxPaymentsSchema)
    .query(({ ctx, input }) => listTaxPayments(ctx.tenantDb, input)),

  byId: publicTenantProcedure
    .input(getTaxPaymentSchema)
    .query(({ ctx, input }) => getTaxPaymentById(ctx.tenantDb, input)),

  byReceiptNo: tenantMemberProcedure
    .input(getPaymentByReceiptNoSchema)
    .query(({ ctx, input }) => getPaymentByReceiptNo(ctx.tenantDb, input)),

  stats: tenantMemberProcedure
    .input(taxPaymentStatsSchema)
    .query(({ ctx, input }) => getTaxPaymentStats(ctx.tenantDb, input)),

  create: tenantMemberProcedure
    .input(createTaxPaymentSchema)
    .mutation(({ ctx, input }) => createTaxPayment(ctx.tenantDb, input)),

  update: tenantMemberProcedure
    .input(updateTaxPaymentSchema)
    .mutation(({ ctx, input }) => updateTaxPayment(ctx.tenantDb, input)),

  delete: tenantMemberProcedure
    .input(deleteTaxPaymentSchema)
    .mutation(({ ctx, input }) => deleteTaxPayment(ctx.tenantDb, input)),
})

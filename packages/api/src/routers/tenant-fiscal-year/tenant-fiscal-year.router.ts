import { createTRPCRouter, tenantMemberProcedure } from "../../trpc"
import {
  createTenantFiscalYearSchema,
  deleteTenantFiscalYearSchema,
  getTenantFiscalYearSchema,
  listTenantFiscalYearsSchema,
  updateTenantFiscalYearSchema,
} from "./tenant-fiscal-year.schema"
import {
  createTenantFiscalYear,
  deleteTenantFiscalYear,
  getCurrentTenantFiscalYear,
  getTenantFiscalYearById,
  listTenantFiscalYears,
  updateTenantFiscalYear,
} from "./tenant-fiscal-year.service"

export const tenantFiscalYearRouter = createTRPCRouter({
  list: tenantMemberProcedure
    .input(listTenantFiscalYearsSchema)
    .query(({ ctx, input }) => listTenantFiscalYears(ctx.tenantDb, input)),

  byId: tenantMemberProcedure
    .input(getTenantFiscalYearSchema)
    .query(({ ctx, input }) => getTenantFiscalYearById(ctx.tenantDb, input)),

  current: tenantMemberProcedure
    .query(({ ctx }) => getCurrentTenantFiscalYear(ctx.tenantDb)),

  create: tenantMemberProcedure
    .input(createTenantFiscalYearSchema)
    .mutation(({ ctx, input }) => createTenantFiscalYear(ctx.tenantDb, input)),

  update: tenantMemberProcedure
    .input(updateTenantFiscalYearSchema)
    .mutation(({ ctx, input }) => updateTenantFiscalYear(ctx.tenantDb, input)),

  delete: tenantMemberProcedure
    .input(deleteTenantFiscalYearSchema)
    .mutation(({ ctx, input }) => deleteTenantFiscalYear(ctx.tenantDb, input)),
})

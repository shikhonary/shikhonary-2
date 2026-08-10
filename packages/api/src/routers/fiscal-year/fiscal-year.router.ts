import { z } from "zod"
import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createFiscalYearSchema,
  deleteFiscalYearSchema,
  getFiscalYearSchema,
  listFiscalYearsSchema,
  updateFiscalYearSchema,
} from "./fiscal-year.schema"
import {
  createFiscalYear,
  deleteFiscalYear,
  getCurrentFiscalYear,
  getFiscalYearById,
  listFiscalYears,
  updateFiscalYear,
} from "./fiscal-year.service"

export const fiscalYearRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listFiscalYearsSchema)
    .query(({ ctx, input }) => listFiscalYears(ctx.db, input)),

  byId: superAdminProcedure
    .input(getFiscalYearSchema)
    .query(({ ctx, input }) => getFiscalYearById(ctx.db, input)),

  current: superAdminProcedure
    .input(z.object({ tenantId: z.string().optional() }).optional())
    .query(({ ctx, input }) => getCurrentFiscalYear(ctx.db, input?.tenantId)),

  create: superAdminProcedure
    .input(createFiscalYearSchema)
    .mutation(({ ctx, input }) => createFiscalYear(ctx.db, input)),

  update: superAdminProcedure
    .input(updateFiscalYearSchema)
    .mutation(({ ctx, input }) => updateFiscalYear(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteFiscalYearSchema)
    .mutation(({ ctx, input }) => deleteFiscalYear(ctx.db, input)),
})

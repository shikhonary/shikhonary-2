import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createCsSchema,
  deleteCsSchema,
  getCsSchema,
  listCsSchema,
  updateCsSchema,
  bulkDeleteCsSchema,
  toggleCsActiveSchema,
  importCsSchema,
  csStatsSchema,
} from "./cs.schema"
import {
  createCs,
  deleteCs,
  getCsById,
  listCs,
  updateCs,
  bulkDeleteCs,
  toggleCsActive,
  importCs,
  getCsStats,
} from "./cs.service"

export const csRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listCsSchema)
    .query(({ ctx, input }) => listCs(ctx.db, input)),

  stats: superAdminProcedure
    .input(csStatsSchema.optional())
    .query(({ ctx, input }) => getCsStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getCsSchema)
    .query(({ ctx, input }) => getCsById(ctx.db, input)),

  create: superAdminProcedure
    .input(createCsSchema)
    .mutation(({ ctx, input }) => createCs(ctx.db, input)),

  update: superAdminProcedure
    .input(updateCsSchema)
    .mutation(({ ctx, input }) => updateCs(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteCsSchema)
    .mutation(({ ctx, input }) => deleteCs(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteCsSchema)
    .mutation(({ ctx, input }) => bulkDeleteCs(ctx.db, input)),

  toggleActive: superAdminProcedure
    .input(toggleCsActiveSchema)
    .mutation(({ ctx, input }) => toggleCsActive(ctx.db, input)),

  import: superAdminProcedure
    .input(importCsSchema)
    .mutation(({ ctx, input }) => importCs(ctx.db, input)),
})

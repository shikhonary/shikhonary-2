import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createThoughtExpansionSchema,
  deleteThoughtExpansionSchema,
  getThoughtExpansionSchema,
  listThoughtExpansionsSchema,
  updateThoughtExpansionSchema,
  bulkDeleteThoughtExpansionsSchema,
  importThoughtExpansionsSchema,
  thoughtExpansionStatsSchema,
  thoughtExpansionBoardYearsSchema,
  toggleThoughtExpansionActiveSchema,
  resolveThoughtExpansionReportSchema,
  assignThoughtExpansionReportSchema,
} from "./thought-expansion.schema"
import {
  createThoughtExpansion,
  deleteThoughtExpansion,
  getThoughtExpansionById,
  listThoughtExpansions,
  updateThoughtExpansion,
  bulkDeleteThoughtExpansions,
  importThoughtExpansions,
  getThoughtExpansionStats,
  getBoardYears,
  toggleThoughtExpansionActive,
  resolveThoughtExpansionReport,
  assignThoughtExpansionReport,
} from "./thought-expansion.service"

export const thoughtExpansionRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listThoughtExpansionsSchema)
    .query(({ ctx, input }) => listThoughtExpansions(ctx.db, input)),

  stats: superAdminProcedure
    .input(thoughtExpansionStatsSchema.optional())
    .query(({ ctx, input }) => getThoughtExpansionStats(ctx.db, input ?? {})),

  boardYears: superAdminProcedure
    .input(thoughtExpansionBoardYearsSchema.optional())
    .query(({ ctx, input }) => getBoardYears(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getThoughtExpansionSchema)
    .query(({ ctx, input }) => getThoughtExpansionById(ctx.db, input)),

  create: superAdminProcedure
    .input(createThoughtExpansionSchema)
    .mutation(({ ctx, input }) => createThoughtExpansion(ctx.db, input)),

  update: superAdminProcedure
    .input(updateThoughtExpansionSchema)
    .mutation(({ ctx, input }) => updateThoughtExpansion(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteThoughtExpansionSchema)
    .mutation(({ ctx, input }) => deleteThoughtExpansion(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteThoughtExpansionsSchema)
    .mutation(({ ctx, input }) => bulkDeleteThoughtExpansions(ctx.db, input)),

  toggleActive: superAdminProcedure
    .input(toggleThoughtExpansionActiveSchema)
    .mutation(({ ctx, input }) => toggleThoughtExpansionActive(ctx.db, input)),

  import: superAdminProcedure
    .input(importThoughtExpansionsSchema)
    .mutation(({ ctx, input }) => importThoughtExpansions(ctx.db, input)),

  resolveReport: superAdminProcedure
    .input(resolveThoughtExpansionReportSchema)
    .mutation(({ ctx, input }) =>
      resolveThoughtExpansionReport(ctx.db, input, ctx.session?.user?.id)
    ),

  assignReport: superAdminProcedure
    .input(assignThoughtExpansionReportSchema)
    .mutation(({ ctx, input }) =>
      assignThoughtExpansionReport(ctx.db, input, ctx.session?.user?.id)
    ),
})

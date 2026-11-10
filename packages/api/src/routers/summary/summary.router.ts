import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createSummarySchema,
  deleteSummarySchema,
  getSummarySchema,
  listSummariesSchema,
  updateSummarySchema,
  bulkDeleteSummariesSchema,
  importSummariesSchema,
  summaryStatsSchema,
  summaryBoardYearsSchema,
  toggleSummaryActiveSchema,
  resolveSummaryReportSchema,
  assignSummaryReportSchema,
} from "./summary.schema"
import {
  createSummary,
  deleteSummary,
  getSummaryById,
  listSummaries,
  updateSummary,
  bulkDeleteSummaries,
  importSummaries,
  getSummaryStats,
  getBoardYears,
  toggleSummaryActive,
  resolveSummaryReport,
  assignSummaryReport,
} from "./summary.service"

export const summaryRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listSummariesSchema)
    .query(({ ctx, input }) => listSummaries(ctx.db, input)),

  stats: superAdminProcedure
    .input(summaryStatsSchema.optional())
    .query(({ ctx, input }) => getSummaryStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getSummarySchema)
    .query(({ ctx, input }) => getSummaryById(ctx.db, input)),

  boardYears: superAdminProcedure
    .input(summaryBoardYearsSchema.optional())
    .query(({ ctx, input }) => getBoardYears(ctx.db, input ?? {})),

  create: superAdminProcedure
    .input(createSummarySchema)
    .mutation(({ ctx, input }) => createSummary(ctx.db, input)),

  update: superAdminProcedure
    .input(updateSummarySchema)
    .mutation(({ ctx, input }) => updateSummary(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteSummarySchema)
    .mutation(({ ctx, input }) => deleteSummary(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteSummariesSchema)
    .mutation(({ ctx, input }) => bulkDeleteSummaries(ctx.db, input)),

  toggleActive: superAdminProcedure
    .input(toggleSummaryActiveSchema)
    .mutation(({ ctx, input }) => toggleSummaryActive(ctx.db, input)),

  import: superAdminProcedure
    .input(importSummariesSchema)
    .mutation(({ ctx, input }) => importSummaries(ctx.db, input)),

  resolveReport: superAdminProcedure
    .input(resolveSummaryReportSchema)
    .mutation(({ ctx, input }) =>
      resolveSummaryReport(ctx.db, input, ctx.session?.user?.id)
    ),

  assignReport: superAdminProcedure
    .input(assignSummaryReportSchema)
    .mutation(({ ctx, input }) =>
      assignSummaryReport(ctx.db, input, ctx.session?.user?.id)
    ),
})

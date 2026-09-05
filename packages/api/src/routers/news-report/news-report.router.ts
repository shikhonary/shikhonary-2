import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createNewsReportSchema,
  deleteNewsReportSchema,
  getNewsReportSchema,
  listNewsReportsSchema,
  updateNewsReportSchema,
  bulkDeleteNewsReportsSchema,
  importNewsReportsSchema,
  newsReportStatsSchema,
} from "./news-report.schema"
import {
  createNewsReport,
  deleteNewsReport,
  getNewsReportById,
  listNewsReports,
  updateNewsReport,
  bulkDeleteNewsReports,
  importNewsReports,
  getNewsReportStats,
} from "./news-report.service"

export const newsReportRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listNewsReportsSchema)
    .query(({ ctx, input }) => listNewsReports(ctx.db, input)),

  stats: superAdminProcedure
    .input(newsReportStatsSchema.optional())
    .query(({ ctx, input }) => getNewsReportStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getNewsReportSchema)
    .query(({ ctx, input }) => getNewsReportById(ctx.db, input)),

  create: superAdminProcedure
    .input(createNewsReportSchema)
    .mutation(({ ctx, input }) => createNewsReport(ctx.db, input)),

  update: superAdminProcedure
    .input(updateNewsReportSchema)
    .mutation(({ ctx, input }) => updateNewsReport(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteNewsReportSchema)
    .mutation(({ ctx, input }) => deleteNewsReport(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteNewsReportsSchema)
    .mutation(({ ctx, input }) => bulkDeleteNewsReports(ctx.db, input)),

  import: superAdminProcedure
    .input(importNewsReportsSchema)
    .mutation(({ ctx, input }) => importNewsReports(ctx.db, input)),
})

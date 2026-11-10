import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createApplicationSchema,
  deleteApplicationSchema,
  getApplicationSchema,
  listApplicationsSchema,
  updateApplicationSchema,
  bulkDeleteApplicationsSchema,
  importApplicationsSchema,
  applicationStatsSchema,
  applicationBoardYearsSchema,
  toggleApplicationActiveSchema,
  resolveApplicationReportSchema,
  assignApplicationReportSchema,
} from "./application.schema"
import {
  createApplication,
  deleteApplication,
  getApplicationById,
  listApplications,
  updateApplication,
  bulkDeleteApplications,
  importApplications,
  getApplicationStats,
  getBoardYears,
  toggleApplicationActive,
  resolveApplicationReport,
  assignApplicationReport,
} from "./application.service"

export const applicationRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listApplicationsSchema)
    .query(({ ctx, input }) => listApplications(ctx.db, input)),

  stats: superAdminProcedure
    .input(applicationStatsSchema.optional())
    .query(({ ctx, input }) => getApplicationStats(ctx.db, input ?? {})),

  boardYears: superAdminProcedure
    .input(applicationBoardYearsSchema.optional())
    .query(({ ctx, input }) => getBoardYears(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getApplicationSchema)
    .query(({ ctx, input }) => getApplicationById(ctx.db, input)),

  create: superAdminProcedure
    .input(createApplicationSchema)
    .mutation(({ ctx, input }) => createApplication(ctx.db, input)),

  update: superAdminProcedure
    .input(updateApplicationSchema)
    .mutation(({ ctx, input }) => updateApplication(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteApplicationSchema)
    .mutation(({ ctx, input }) => deleteApplication(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteApplicationsSchema)
    .mutation(({ ctx, input }) => bulkDeleteApplications(ctx.db, input)),

  toggleActive: superAdminProcedure
    .input(toggleApplicationActiveSchema)
    .mutation(({ ctx, input }) => toggleApplicationActive(ctx.db, input)),

  import: superAdminProcedure
    .input(importApplicationsSchema)
    .mutation(({ ctx, input }) => importApplications(ctx.db, input)),

  resolveReport: superAdminProcedure
    .input(resolveApplicationReportSchema)
    .mutation(({ ctx, input }) =>
      resolveApplicationReport(ctx.db, input, ctx.session?.user?.id)
    ),

  assignReport: superAdminProcedure
    .input(assignApplicationReportSchema)
    .mutation(({ ctx, input }) =>
      assignApplicationReport(ctx.db, input, ctx.session?.user?.id)
    ),
})

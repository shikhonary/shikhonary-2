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
} from "./application.service"

export const applicationRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listApplicationsSchema)
    .query(({ ctx, input }) => listApplications(ctx.db, input)),

  stats: superAdminProcedure
    .input(applicationStatsSchema.optional())
    .query(({ ctx, input }) => getApplicationStats(ctx.db, input ?? {})),

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

  import: superAdminProcedure
    .input(importApplicationsSchema)
    .mutation(({ ctx, input }) => importApplications(ctx.db, input)),
})

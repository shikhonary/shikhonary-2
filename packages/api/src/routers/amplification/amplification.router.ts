import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createAmplificationSchema,
  deleteAmplificationSchema,
  getAmplificationSchema,
  listAmplificationsSchema,
  updateAmplificationSchema,
  bulkDeleteAmplificationsSchema,
  importAmplificationsSchema,
  amplificationStatsSchema,
} from "./amplification.schema"
import {
  createAmplification,
  deleteAmplification,
  getAmplificationById,
  listAmplifications,
  updateAmplification,
  bulkDeleteAmplifications,
  importAmplifications,
  getAmplificationStats,
} from "./amplification.service"

export const amplificationRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listAmplificationsSchema)
    .query(({ ctx, input }) => listAmplifications(ctx.db, input)),

  stats: superAdminProcedure
    .input(amplificationStatsSchema.optional())
    .query(({ ctx, input }) => getAmplificationStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getAmplificationSchema)
    .query(({ ctx, input }) => getAmplificationById(ctx.db, input)),

  create: superAdminProcedure
    .input(createAmplificationSchema)
    .mutation(({ ctx, input }) => createAmplification(ctx.db, input)),

  update: superAdminProcedure
    .input(updateAmplificationSchema)
    .mutation(({ ctx, input }) => updateAmplification(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteAmplificationSchema)
    .mutation(({ ctx, input }) => deleteAmplification(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteAmplificationsSchema)
    .mutation(({ ctx, input }) => bulkDeleteAmplifications(ctx.db, input)),

  import: superAdminProcedure
    .input(importAmplificationsSchema)
    .mutation(({ ctx, input }) => importAmplifications(ctx.db, input)),
})

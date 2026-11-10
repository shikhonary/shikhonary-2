import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createEssenceSchema,
  deleteEssenceSchema,
  getEssenceSchema,
  listEssencesSchema,
  updateEssenceSchema,
  bulkDeleteEssencesSchema,
  importEssencesSchema,
  essenceStatsSchema,
  essenceBoardYearsSchema,
  toggleEssenceActiveSchema,
  resolveEssenceReportSchema,
  assignEssenceReportSchema,
} from "./essence.schema"
import {
  createEssence,
  deleteEssence,
  getEssenceById,
  listEssences,
  updateEssence,
  bulkDeleteEssences,
  importEssences,
  getEssenceStats,
  getBoardYears,
  toggleEssenceActive,
  resolveEssenceReport,
  assignEssenceReport,
} from "./essence.service"

export const essenceRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listEssencesSchema)
    .query(({ ctx, input }) => listEssences(ctx.db, input)),

  stats: superAdminProcedure
    .input(essenceStatsSchema.optional())
    .query(({ ctx, input }) => getEssenceStats(ctx.db, input ?? {})),

  boardYears: superAdminProcedure
    .input(essenceBoardYearsSchema.optional())
    .query(({ ctx, input }) => getBoardYears(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getEssenceSchema)
    .query(({ ctx, input }) => getEssenceById(ctx.db, input)),

  create: superAdminProcedure
    .input(createEssenceSchema)
    .mutation(({ ctx, input }) => createEssence(ctx.db, input)),

  update: superAdminProcedure
    .input(updateEssenceSchema)
    .mutation(({ ctx, input }) => updateEssence(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteEssenceSchema)
    .mutation(({ ctx, input }) => deleteEssence(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteEssencesSchema)
    .mutation(({ ctx, input }) => bulkDeleteEssences(ctx.db, input)),

  toggleActive: superAdminProcedure
    .input(toggleEssenceActiveSchema)
    .mutation(({ ctx, input }) => toggleEssenceActive(ctx.db, input)),

  resolveReport: superAdminProcedure
    .input(resolveEssenceReportSchema)
    .mutation(({ ctx, input }) => resolveEssenceReport(ctx.db, input, ctx.session?.user?.id)),

  assignReport: superAdminProcedure
    .input(assignEssenceReportSchema)
    .mutation(({ ctx, input }) => assignEssenceReport(ctx.db, input, ctx.session?.user?.id)),

  import: superAdminProcedure
    .input(importEssencesSchema)
    .mutation(({ ctx, input }) => importEssences(ctx.db, input)),
})

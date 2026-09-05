import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createEssaySchema,
  deleteEssaySchema,
  getEssaySchema,
  listEssaysSchema,
  updateEssaySchema,
  bulkDeleteEssaysSchema,
  importEssaysSchema,
  essayStatsSchema,
} from "./essay.schema"
import {
  createEssay,
  deleteEssay,
  getEssayById,
  listEssays,
  updateEssay,
  bulkDeleteEssays,
  importEssays,
  getEssayStats,
} from "./essay.service"

export const essayRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listEssaysSchema)
    .query(({ ctx, input }) => listEssays(ctx.db, input)),

  stats: superAdminProcedure
    .input(essayStatsSchema.optional())
    .query(({ ctx, input }) => getEssayStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getEssaySchema)
    .query(({ ctx, input }) => getEssayById(ctx.db, input)),

  create: superAdminProcedure
    .input(createEssaySchema)
    .mutation(({ ctx, input }) => createEssay(ctx.db, input)),

  update: superAdminProcedure
    .input(updateEssaySchema)
    .mutation(({ ctx, input }) => updateEssay(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteEssaySchema)
    .mutation(({ ctx, input }) => deleteEssay(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteEssaysSchema)
    .mutation(({ ctx, input }) => bulkDeleteEssays(ctx.db, input)),

  import: superAdminProcedure
    .input(importEssaysSchema)
    .mutation(({ ctx, input }) => importEssays(ctx.db, input)),
})

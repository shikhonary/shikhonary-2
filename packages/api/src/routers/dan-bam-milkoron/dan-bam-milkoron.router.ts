import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createDanBamMilkoronSchema,
  deleteDanBamMilkoronSchema,
  getDanBamMilkoronSchema,
  listDanBamMilkoronSchema,
  updateDanBamMilkoronSchema,
  bulkDeleteDanBamMilkoronSchema,
  importDanBamMilkoronSchema,
  danBamMilkoronStatsSchema,
} from "./dan-bam-milkoron.schema"
import {
  createDanBamMilkoron,
  deleteDanBamMilkoron,
  getDanBamMilkoronById,
  listDanBamMilkoron,
  updateDanBamMilkoron,
  bulkDeleteDanBamMilkoron,
  importDanBamMilkoron,
  getDanBamMilkoronStats,
} from "./dan-bam-milkoron.service"

export const danBamMilkoronRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listDanBamMilkoronSchema)
    .query(({ ctx, input }) => listDanBamMilkoron(ctx.db, input)),

  stats: superAdminProcedure
    .input(danBamMilkoronStatsSchema.optional())
    .query(({ ctx, input }) => getDanBamMilkoronStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getDanBamMilkoronSchema)
    .query(({ ctx, input }) => getDanBamMilkoronById(ctx.db, input)),

  create: superAdminProcedure
    .input(createDanBamMilkoronSchema)
    .mutation(({ ctx, input }) => createDanBamMilkoron(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateDanBamMilkoronSchema)
    .mutation(({ ctx, input }) => updateDanBamMilkoron(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deleteDanBamMilkoronSchema)
    .mutation(({ ctx, input }) => deleteDanBamMilkoron(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteDanBamMilkoronSchema)
    .mutation(({ ctx, input }) => bulkDeleteDanBamMilkoron(ctx.db, input)),

  import: superAdminProcedure
    .input(importDanBamMilkoronSchema)
    .mutation(({ ctx, input }) => importDanBamMilkoron(ctx.db, input, ctx.session?.user?.id)),
})

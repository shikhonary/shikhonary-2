import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createEkKothayProkashSchema,
  deleteEkKothayProkashSchema,
  getEkKothayProkashSchema,
  listEkKothayProkashSchema,
  updateEkKothayProkashSchema,
  bulkDeleteEkKothayProkashSchema,
  importEkKothayProkashSchema,
  ekKothayProkashStatsSchema,
} from "./ek-kothay-prokash.schema"
import {
  createEkKothayProkash,
  deleteEkKothayProkash,
  getEkKothayProkashById,
  listEkKothayProkash,
  updateEkKothayProkash,
  bulkDeleteEkKothayProkash,
  importEkKothayProkash,
  getEkKothayProkashStats,
} from "./ek-kothay-prokash.service"

export const ekKothayProkashRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listEkKothayProkashSchema)
    .query(({ ctx, input }) => listEkKothayProkash(ctx.db, input)),

  stats: superAdminProcedure
    .input(ekKothayProkashStatsSchema.optional())
    .query(({ ctx, input }) => getEkKothayProkashStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getEkKothayProkashSchema)
    .query(({ ctx, input }) => getEkKothayProkashById(ctx.db, input)),

  create: superAdminProcedure
    .input(createEkKothayProkashSchema)
    .mutation(({ ctx, input }) => createEkKothayProkash(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateEkKothayProkashSchema)
    .mutation(({ ctx, input }) => updateEkKothayProkash(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deleteEkKothayProkashSchema)
    .mutation(({ ctx, input }) => deleteEkKothayProkash(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteEkKothayProkashSchema)
    .mutation(({ ctx, input }) => bulkDeleteEkKothayProkash(ctx.db, input)),

  import: superAdminProcedure
    .input(importEkKothayProkashSchema)
    .mutation(({ ctx, input }) => importEkKothayProkash(ctx.db, input, ctx.session?.user?.id)),
})

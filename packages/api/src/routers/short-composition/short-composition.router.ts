import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createShortCompositionSchema,
  deleteShortCompositionSchema,
  getShortCompositionSchema,
  listShortCompositionSchema,
  updateShortCompositionSchema,
  bulkDeleteShortCompositionSchema,
  importShortCompositionSchema,
  shortCompositionStatsSchema,
} from "./short-composition.schema"
import {
  createShortComposition,
  deleteShortComposition,
  getShortCompositionById,
  listShortCompositions,
  updateShortComposition,
  bulkDeleteShortCompositions,
  bulkImportShortCompositions,
  getShortCompositionStats,
} from "./short-composition.service"

export const shortCompositionRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listShortCompositionSchema)
    .query(({ ctx, input }) => listShortCompositions(ctx.db, input)),

  stats: superAdminProcedure
    .input(shortCompositionStatsSchema.optional())
    .query(({ ctx, input }) => getShortCompositionStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getShortCompositionSchema)
    .query(({ ctx, input }) => getShortCompositionById(ctx.db, input)),

  create: superAdminProcedure
    .input(createShortCompositionSchema)
    .mutation(({ ctx, input }) => createShortComposition(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateShortCompositionSchema)
    .mutation(({ ctx, input }) => updateShortComposition(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deleteShortCompositionSchema)
    .mutation(({ ctx, input }) => deleteShortComposition(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteShortCompositionSchema)
    .mutation(({ ctx, input }) => bulkDeleteShortCompositions(ctx.db, input)),

  import: superAdminProcedure
    .input(importShortCompositionSchema)
    .mutation(({ ctx, input }) => bulkImportShortCompositions(ctx.db, input, ctx.session?.user?.id)),
})

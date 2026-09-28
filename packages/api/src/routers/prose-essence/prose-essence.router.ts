import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createProseEssenceSchema,
  deleteProseEssenceSchema,
  getProseEssenceSchema,
  listProseEssenceSchema,
  updateProseEssenceSchema,
  bulkDeleteProseEssenceSchema,
  importProseEssenceSchema,
  proseEssenceStatsSchema,
} from "./prose-essence.schema"
import {
  createProseEssence,
  deleteProseEssence,
  getProseEssenceById,
  listProseEssence,
  updateProseEssence,
  bulkDeleteProseEssence,
  importProseEssence,
  getProseEssenceStats,
} from "./prose-essence.service"

export const proseEssenceRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listProseEssenceSchema)
    .query(({ ctx, input }) => listProseEssence(ctx.db, input)),

  stats: superAdminProcedure
    .input(proseEssenceStatsSchema.optional())
    .query(({ ctx, input }) => getProseEssenceStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getProseEssenceSchema)
    .query(({ ctx, input }) => getProseEssenceById(ctx.db, input)),

  create: superAdminProcedure
    .input(createProseEssenceSchema)
    .mutation(({ ctx, input }) => createProseEssence(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateProseEssenceSchema)
    .mutation(({ ctx, input }) => updateProseEssence(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deleteProseEssenceSchema)
    .mutation(({ ctx, input }) => deleteProseEssence(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteProseEssenceSchema)
    .mutation(({ ctx, input }) => bulkDeleteProseEssence(ctx.db, input)),

  import: superAdminProcedure
    .input(importProseEssenceSchema)
    .mutation(({ ctx, input }) => importProseEssence(ctx.db, input, ctx.session?.user?.id)),
})

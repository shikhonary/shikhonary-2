import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createPoemEssenceSchema,
  deletePoemEssenceSchema,
  getPoemEssenceSchema,
  listPoemEssenceSchema,
  updatePoemEssenceSchema,
  bulkDeletePoemEssenceSchema,
  importPoemEssenceSchema,
  poemEssenceStatsSchema,
} from "./poem-essence.schema"
import {
  createPoemEssence,
  deletePoemEssence,
  getPoemEssenceById,
  listPoemEssence,
  updatePoemEssence,
  bulkDeletePoemEssence,
  importPoemEssence,
  getPoemEssenceStats,
} from "./poem-essence.service"

export const poemEssenceRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listPoemEssenceSchema)
    .query(({ ctx, input }) => listPoemEssence(ctx.db, input)),

  stats: superAdminProcedure
    .input(poemEssenceStatsSchema.optional())
    .query(({ ctx, input }) => getPoemEssenceStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getPoemEssenceSchema)
    .query(({ ctx, input }) => getPoemEssenceById(ctx.db, input)),

  create: superAdminProcedure
    .input(createPoemEssenceSchema)
    .mutation(({ ctx, input }) => createPoemEssence(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updatePoemEssenceSchema)
    .mutation(({ ctx, input }) => updatePoemEssence(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deletePoemEssenceSchema)
    .mutation(({ ctx, input }) => deletePoemEssence(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeletePoemEssenceSchema)
    .mutation(({ ctx, input }) => bulkDeletePoemEssence(ctx.db, input)),

  import: superAdminProcedure
    .input(importPoemEssenceSchema)
    .mutation(({ ctx, input }) => importPoemEssence(ctx.db, input, ctx.session?.user?.id)),
})

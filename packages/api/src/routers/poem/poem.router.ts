import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createPoemSchema,
  deletePoemSchema,
  getPoemSchema,
  listPoemsSchema,
  updatePoemSchema,
  bulkDeletePoemsSchema,
  importPoemsSchema,
  poemStatsSchema,
} from "./poem.schema"
import {
  createPoem,
  deletePoem,
  getPoemById,
  listPoems,
  updatePoem,
  bulkDeletePoems,
  importPoems,
  getPoemStats,
} from "./poem.service"

export const poemRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listPoemsSchema)
    .query(({ ctx, input }) => listPoems(ctx.db, input)),

  stats: superAdminProcedure
    .input(poemStatsSchema.optional())
    .query(({ ctx, input }) => getPoemStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getPoemSchema)
    .query(({ ctx, input }) => getPoemById(ctx.db, input)),

  create: superAdminProcedure
    .input(createPoemSchema)
    .mutation(({ ctx, input }) => createPoem(ctx.db, input)),

  update: superAdminProcedure
    .input(updatePoemSchema)
    .mutation(({ ctx, input }) => updatePoem(ctx.db, input)),

  delete: superAdminProcedure
    .input(deletePoemSchema)
    .mutation(({ ctx, input }) => deletePoem(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeletePoemsSchema)
    .mutation(({ ctx, input }) => bulkDeletePoems(ctx.db, input)),

  import: superAdminProcedure
    .input(importPoemsSchema)
    .mutation(({ ctx, input }) => importPoems(ctx.db, input)),
})

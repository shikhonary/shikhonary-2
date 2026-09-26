import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createFillInTheBlanksWithoutCluesSchema,
  deleteFillInTheBlanksWithoutCluesSchema,
  getFillInTheBlanksWithoutCluesSchema,
  listFillInTheBlanksWithoutCluesSchema,
  updateFillInTheBlanksWithoutCluesSchema,
  bulkDeleteFillInTheBlanksWithoutCluesSchema,
  importFillInTheBlanksWithoutCluesSchema,
  fillInTheBlanksWithoutCluesStatsSchema,
} from "./fill-in-the-blanks-without-clues.schema"
import {
  createFillInTheBlanksWithoutClues,
  deleteFillInTheBlanksWithoutClues,
  getFillInTheBlanksWithoutCluesById,
  listFillInTheBlanksWithoutClues,
  updateFillInTheBlanksWithoutClues,
  bulkDeleteFillInTheBlanksWithoutClues,
  importFillInTheBlanksWithoutClues,
  getFillInTheBlanksWithoutCluesStats,
} from "./fill-in-the-blanks-without-clues.service"

export const fillInTheBlanksWithoutCluesRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listFillInTheBlanksWithoutCluesSchema)
    .query(({ ctx, input }) => listFillInTheBlanksWithoutClues(ctx.db, input)),

  stats: superAdminProcedure
    .input(fillInTheBlanksWithoutCluesStatsSchema.optional())
    .query(({ ctx, input }) => getFillInTheBlanksWithoutCluesStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getFillInTheBlanksWithoutCluesSchema)
    .query(({ ctx, input }) => getFillInTheBlanksWithoutCluesById(ctx.db, input)),

  create: superAdminProcedure
    .input(createFillInTheBlanksWithoutCluesSchema)
    .mutation(({ ctx, input }) => createFillInTheBlanksWithoutClues(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateFillInTheBlanksWithoutCluesSchema)
    .mutation(({ ctx, input }) => updateFillInTheBlanksWithoutClues(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deleteFillInTheBlanksWithoutCluesSchema)
    .mutation(({ ctx, input }) => deleteFillInTheBlanksWithoutClues(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteFillInTheBlanksWithoutCluesSchema)
    .mutation(({ ctx, input }) => bulkDeleteFillInTheBlanksWithoutClues(ctx.db, input)),

  import: superAdminProcedure
    .input(importFillInTheBlanksWithoutCluesSchema)
    .mutation(({ ctx, input }) => importFillInTheBlanksWithoutClues(ctx.db, input, ctx.session?.user?.id)),
})

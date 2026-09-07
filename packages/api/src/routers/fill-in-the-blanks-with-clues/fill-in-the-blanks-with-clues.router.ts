import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createFillInTheBlanksWithCluesSchema,
  deleteFillInTheBlanksWithCluesSchema,
  getFillInTheBlanksWithCluesSchema,
  listFillInTheBlanksWithCluesSchema,
  updateFillInTheBlanksWithCluesSchema,
  bulkDeleteFillInTheBlanksWithCluesSchema,
  importFillInTheBlanksWithCluesSchema,
  fillInTheBlanksWithCluesStatsSchema,
} from "./fill-in-the-blanks-with-clues.schema"
import {
  createFillInTheBlanksWithClues,
  deleteFillInTheBlanksWithClues,
  getFillInTheBlanksWithCluesById,
  listFillInTheBlanksWithClues,
  updateFillInTheBlanksWithClues,
  bulkDeleteFillInTheBlanksWithClues,
  importFillInTheBlanksWithClues,
  getFillInTheBlanksWithCluesStats,
} from "./fill-in-the-blanks-with-clues.service"

export const fillInTheBlanksWithCluesRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listFillInTheBlanksWithCluesSchema)
    .query(({ ctx, input }) => listFillInTheBlanksWithClues(ctx.db, input)),

  stats: superAdminProcedure
    .input(fillInTheBlanksWithCluesStatsSchema.optional())
    .query(({ ctx, input }) => getFillInTheBlanksWithCluesStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getFillInTheBlanksWithCluesSchema)
    .query(({ ctx, input }) => getFillInTheBlanksWithCluesById(ctx.db, input)),

  create: superAdminProcedure
    .input(createFillInTheBlanksWithCluesSchema)
    .mutation(({ ctx, input }) => createFillInTheBlanksWithClues(ctx.db, input)),

  update: superAdminProcedure
    .input(updateFillInTheBlanksWithCluesSchema)
    .mutation(({ ctx, input }) => updateFillInTheBlanksWithClues(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteFillInTheBlanksWithCluesSchema)
    .mutation(({ ctx, input }) => deleteFillInTheBlanksWithClues(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteFillInTheBlanksWithCluesSchema)
    .mutation(({ ctx, input }) => bulkDeleteFillInTheBlanksWithClues(ctx.db, input)),

  import: superAdminProcedure
    .input(importFillInTheBlanksWithCluesSchema)
    .mutation(({ ctx, input }) => importFillInTheBlanksWithClues(ctx.db, input)),
})

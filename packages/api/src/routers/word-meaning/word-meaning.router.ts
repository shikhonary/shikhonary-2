import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createWordMeaningSchema,
  deleteWordMeaningSchema,
  getWordMeaningSchema,
  listWordMeaningSchema,
  updateWordMeaningSchema,
  bulkDeleteWordMeaningSchema,
  importWordMeaningSchema,
  wordMeaningStatsSchema,
} from "./word-meaning.schema"
import {
  createWordMeaning,
  deleteWordMeaning,
  getWordMeaningById,
  listWordMeaning,
  updateWordMeaning,
  bulkDeleteWordMeaning,
  importWordMeaning,
  getWordMeaningStats,
} from "./word-meaning.service"

export const wordMeaningRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listWordMeaningSchema)
    .query(({ ctx, input }) => listWordMeaning(ctx.db, input)),

  stats: superAdminProcedure
    .input(wordMeaningStatsSchema.optional())
    .query(({ ctx, input }) => getWordMeaningStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getWordMeaningSchema)
    .query(({ ctx, input }) => getWordMeaningById(ctx.db, input)),

  create: superAdminProcedure
    .input(createWordMeaningSchema)
    .mutation(({ ctx, input }) => createWordMeaning(ctx.db, input)),

  update: superAdminProcedure
    .input(updateWordMeaningSchema)
    .mutation(({ ctx, input }) => updateWordMeaning(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteWordMeaningSchema)
    .mutation(({ ctx, input }) => deleteWordMeaning(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteWordMeaningSchema)
    .mutation(({ ctx, input }) => bulkDeleteWordMeaning(ctx.db, input)),

  import: superAdminProcedure
    .input(importWordMeaningSchema)
    .mutation(({ ctx, input }) => importWordMeaning(ctx.db, input)),
})

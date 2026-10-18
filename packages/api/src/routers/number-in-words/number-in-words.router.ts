import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createNumberInWordsSchema,
  deleteNumberInWordsSchema,
  getNumberInWordsSchema,
  listNumberInWordsSchema,
  updateNumberInWordsSchema,
  bulkDeleteNumberInWordsSchema,
  importNumberInWordsSchema,
  numberInWordsStatsSchema,
  toggleNumberInWordsActiveSchema,
} from "./number-in-words.schema"
import {
  createNumberInWords,
  deleteNumberInWords,
  getNumberInWordsById,
  listNumberInWords,
  updateNumberInWords,
  bulkDeleteNumberInWords,
  importNumberInWords,
  getNumberInWordsStats,
  getNumberInWordsBoardYears,
  toggleNumberInWordsActive,
} from "./number-in-words.service"

export const numberInWordsRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listNumberInWordsSchema)
    .query(({ ctx, input }) => listNumberInWords(ctx.db, input)),

  stats: superAdminProcedure
    .input(numberInWordsStatsSchema.optional())
    .query(({ ctx, input }) => getNumberInWordsStats(ctx.db, input ?? {})),

  boardYears: superAdminProcedure
    .input(numberInWordsStatsSchema.optional())
    .query(({ ctx, input }) => getNumberInWordsBoardYears(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getNumberInWordsSchema)
    .query(({ ctx, input }) => getNumberInWordsById(ctx.db, input)),

  create: superAdminProcedure
    .input(createNumberInWordsSchema)
    .mutation(({ ctx, input }) => createNumberInWords(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateNumberInWordsSchema)
    .mutation(({ ctx, input }) => updateNumberInWords(ctx.db, input, ctx.session?.user?.id)),

  toggleActive: superAdminProcedure
    .input(toggleNumberInWordsActiveSchema)
    .mutation(({ ctx, input }) => toggleNumberInWordsActive(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteNumberInWordsSchema)
    .mutation(({ ctx, input }) => deleteNumberInWords(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteNumberInWordsSchema)
    .mutation(({ ctx, input }) => bulkDeleteNumberInWords(ctx.db, input)),

  import: superAdminProcedure
    .input(importNumberInWordsSchema)
    .mutation(({ ctx, input }) => importNumberInWords(ctx.db, input, ctx.session?.user?.id)),
})

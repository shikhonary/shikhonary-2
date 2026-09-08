import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createPunctuationSchema,
  deletePunctuationSchema,
  getPunctuationSchema,
  listPunctuationSchema,
  updatePunctuationSchema,
  bulkDeletePunctuationSchema,
  importPunctuationSchema,
  punctuationStatsSchema,
} from "./punctuation.schema"
import {
  createPunctuation,
  deletePunctuation,
  getPunctuationById,
  listPunctuations,
  updatePunctuation,
  bulkDeletePunctuations,
  importPunctuations,
  getPunctuationsStats,
} from "./punctuation.service"

export const punctuationRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listPunctuationSchema)
    .query(({ ctx, input }) => listPunctuations(ctx.db, input)),

  stats: superAdminProcedure
    .input(punctuationStatsSchema.optional())
    .query(({ ctx, input }) => getPunctuationsStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getPunctuationSchema)
    .query(({ ctx, input }) => getPunctuationById(ctx.db, input)),

  create: superAdminProcedure
    .input(createPunctuationSchema)
    .mutation(({ ctx, input }) => createPunctuation(ctx.db, input)),

  update: superAdminProcedure
    .input(updatePunctuationSchema)
    .mutation(({ ctx, input }) => updatePunctuation(ctx.db, input)),

  delete: superAdminProcedure
    .input(deletePunctuationSchema)
    .mutation(({ ctx, input }) => deletePunctuation(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeletePunctuationSchema)
    .mutation(({ ctx, input }) => bulkDeletePunctuations(ctx.db, input)),

  import: superAdminProcedure
    .input(importPunctuationSchema)
    .mutation(({ ctx, input }) => importPunctuations(ctx.db, input)),
})


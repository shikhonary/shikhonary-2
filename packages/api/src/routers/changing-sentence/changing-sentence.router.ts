import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createChangingSentenceSchema,
  deleteChangingSentenceSchema,
  getChangingSentenceSchema,
  listChangingSentencesSchema,
  updateChangingSentenceSchema,
  bulkDeleteChangingSentencesSchema,
  importChangingSentencesSchema,
  changingSentencesStatsSchema,
} from "./changing-sentence.schema"
import {
  createChangingSentence,
  deleteChangingSentence,
  getChangingSentenceById,
  listChangingSentences,
  updateChangingSentence,
  bulkDeleteChangingSentences,
  importChangingSentences,
  getChangingSentencesStats,
} from "./changing-sentence.service"

export const changingSentenceRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listChangingSentencesSchema)
    .query(({ ctx, input }) => listChangingSentences(ctx.db, input)),

  stats: superAdminProcedure
    .input(changingSentencesStatsSchema.optional())
    .query(({ ctx, input }) => getChangingSentencesStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getChangingSentenceSchema)
    .query(({ ctx, input }) => getChangingSentenceById(ctx.db, input)),

  create: superAdminProcedure
    .input(createChangingSentenceSchema)
    .mutation(({ ctx, input }) => createChangingSentence(ctx.db, input)),

  update: superAdminProcedure
    .input(updateChangingSentenceSchema)
    .mutation(({ ctx, input }) => updateChangingSentence(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteChangingSentenceSchema)
    .mutation(({ ctx, input }) => deleteChangingSentence(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteChangingSentencesSchema)
    .mutation(({ ctx, input }) => bulkDeleteChangingSentences(ctx.db, input)),

  import: superAdminProcedure
    .input(importChangingSentencesSchema)
    .mutation(({ ctx, input }) => importChangingSentences(ctx.db, input)),
})

import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createMakeSentencesSchema,
  deleteMakeSentencesSchema,
  getMakeSentencesSchema,
  listMakeSentencesSchema,
  updateMakeSentencesSchema,
  bulkDeleteMakeSentencesSchema,
  importMakeSentencesSchema,
  makeSentencesStatsSchema,
} from "./make-sentences.schema"
import {
  createMakeSentences,
  deleteMakeSentences,
  getMakeSentencesById,
  listMakeSentences,
  updateMakeSentences,
  bulkDeleteMakeSentences,
  importMakeSentences,
  getMakeSentencesStats,
} from "./make-sentences.service"

export const makeSentencesRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listMakeSentencesSchema)
    .query(({ ctx, input }) => listMakeSentences(ctx.db, input)),

  stats: superAdminProcedure
    .input(makeSentencesStatsSchema.optional())
    .query(({ ctx, input }) => getMakeSentencesStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getMakeSentencesSchema)
    .query(({ ctx, input }) => getMakeSentencesById(ctx.db, input)),

  create: superAdminProcedure
    .input(createMakeSentencesSchema)
    .mutation(({ ctx, input }) => createMakeSentences(ctx.db, input)),

  update: superAdminProcedure
    .input(updateMakeSentencesSchema)
    .mutation(({ ctx, input }) => updateMakeSentences(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteMakeSentencesSchema)
    .mutation(({ ctx, input }) => deleteMakeSentences(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteMakeSentencesSchema)
    .mutation(({ ctx, input }) => bulkDeleteMakeSentences(ctx.db, input)),

  import: superAdminProcedure
    .input(importMakeSentencesSchema)
    .mutation(({ ctx, input }) => importMakeSentences(ctx.db, input)),
})

import { z } from "zod"
import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createMakeSentencesSchema,
  deleteMakeSentencesSchema,
  getMakeSentencesSchema,
  listMakeSentencesSchema,
  updateMakeSentencesSchema,
  bulkDeleteMakeSentencesSchema,
  toggleMakeSentencesActiveSchema,
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
  toggleMakeSentencesActive,
  getBoardYears,
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
    .mutation(({ ctx, input }) => createMakeSentences(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateMakeSentencesSchema)
    .mutation(({ ctx, input }) => updateMakeSentences(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deleteMakeSentencesSchema)
    .mutation(({ ctx, input }) => deleteMakeSentences(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteMakeSentencesSchema)
    .mutation(({ ctx, input }) => bulkDeleteMakeSentences(ctx.db, input)),

  toggleActive: superAdminProcedure
    .input(toggleMakeSentencesActiveSchema)
    .mutation(({ ctx, input }) => toggleMakeSentencesActive(ctx.db, input, ctx.session?.user?.id)),

  boardYears: superAdminProcedure
    .input(
      z.object({
        subjectId: z.string(),
        chapterId: z.string().optional(),
        academicChapterId: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => getBoardYears(ctx.db, input)),

  import: superAdminProcedure
    .input(importMakeSentencesSchema)
    .mutation(({ ctx, input }) => importMakeSentences(ctx.db, input, ctx.session?.user?.id)),
})

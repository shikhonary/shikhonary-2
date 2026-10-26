import { z } from "zod"
import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createMakeQuestionSchema,
  deleteMakeQuestionSchema,
  getMakeQuestionSchema,
  listMakeQuestionSchema,
  updateMakeQuestionSchema,
  bulkDeleteMakeQuestionSchema,
  toggleMakeQuestionActiveSchema,
  importMakeQuestionSchema,
  makeQuestionStatsSchema,
} from "./make-question.schema"
import {
  createMakeQuestion,
  deleteMakeQuestion,
  getMakeQuestionById,
  listMakeQuestion,
  updateMakeQuestion,
  bulkDeleteMakeQuestion,
  toggleMakeQuestionActive,
  getBoardYears,
  importMakeQuestion,
  getMakeQuestionStats,
} from "./make-question.service"

export const makeQuestionRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listMakeQuestionSchema)
    .query(({ ctx, input }) => listMakeQuestion(ctx.db, input)),

  stats: superAdminProcedure
    .input(makeQuestionStatsSchema.optional())
    .query(({ ctx, input }) => getMakeQuestionStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getMakeQuestionSchema)
    .query(({ ctx, input }) => getMakeQuestionById(ctx.db, input)),

  create: superAdminProcedure
    .input(createMakeQuestionSchema)
    .mutation(({ ctx, input }) => createMakeQuestion(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateMakeQuestionSchema)
    .mutation(({ ctx, input }) => updateMakeQuestion(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deleteMakeQuestionSchema)
    .mutation(({ ctx, input }) => deleteMakeQuestion(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteMakeQuestionSchema)
    .mutation(({ ctx, input }) => bulkDeleteMakeQuestion(ctx.db, input)),

  toggleActive: superAdminProcedure
    .input(toggleMakeQuestionActiveSchema)
    .mutation(({ ctx, input }) => toggleMakeQuestionActive(ctx.db, input, ctx.session?.user?.id)),

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
    .input(importMakeQuestionSchema)
    .mutation(({ ctx, input }) => importMakeQuestion(ctx.db, input, ctx.session?.user?.id)),
})

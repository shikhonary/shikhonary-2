import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import { z } from "zod"
import {
  createMathQuestionSchema,
  deleteMathQuestionSchema,
  getMathQuestionSchema,
  listMathQuestionSchema,
  updateMathQuestionSchema,
  bulkDeleteMathQuestionSchema,
  importMathQuestionSchema,
  mathQuestionStatsSchema,
  toggleMathQuestionActiveSchema,
} from "./math-question.schema"
import {
  createMathQuestion,
  deleteMathQuestion,
  getMathQuestionById,
  listMathQuestion,
  updateMathQuestion,
  bulkDeleteMathQuestion,
  importMathQuestion,
  getMathQuestionStats,
  getBoardYears,
  toggleMathQuestionActive,
} from "./math-question.service"

export const mathQuestionRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listMathQuestionSchema)
    .query(({ ctx, input }) => listMathQuestion(ctx.db, input)),

  stats: superAdminProcedure
    .input(mathQuestionStatsSchema.optional())
    .query(({ ctx, input }) => getMathQuestionStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getMathQuestionSchema)
    .query(({ ctx, input }) => getMathQuestionById(ctx.db, input)),

  boardYears: superAdminProcedure
    .input(
      z.object({
        subjectId: z.string(),
        chapterId: z.string().optional(),
        academicChapterId: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => getBoardYears(ctx.db, input)),

  create: superAdminProcedure
    .input(createMathQuestionSchema)
    .mutation(({ ctx, input }) => createMathQuestion(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateMathQuestionSchema)
    .mutation(({ ctx, input }) => updateMathQuestion(ctx.db, input, ctx.session?.user?.id)),

  toggleActive: superAdminProcedure
    .input(toggleMathQuestionActiveSchema)
    .mutation(({ ctx, input }) => toggleMathQuestionActive(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteMathQuestionSchema)
    .mutation(({ ctx, input }) => deleteMathQuestion(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteMathQuestionSchema)
    .mutation(({ ctx, input }) => bulkDeleteMathQuestion(ctx.db, input)),

  import: superAdminProcedure
    .input(importMathQuestionSchema)
    .mutation(({ ctx, input }) => importMathQuestion(ctx.db, input, ctx.session?.user?.id)),
})

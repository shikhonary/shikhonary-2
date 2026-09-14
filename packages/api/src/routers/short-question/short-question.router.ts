import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createShortQuestionSchema,
  deleteShortQuestionSchema,
  getShortQuestionSchema,
  listShortQuestionsSchema,
  updateShortQuestionSchema,
  bulkDeleteShortQuestionsSchema,
  importShortQuestionsSchema,
  shortQuestionStatsSchema,
} from "./short-question.schema"
import {
  createShortQuestion,
  deleteShortQuestion,
  getShortQuestionById,
  listShortQuestions,
  updateShortQuestion,
  bulkDeleteShortQuestions,
  importShortQuestions,
  getShortQuestionStats,
} from "./short-question.service"

export const shortQuestionRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listShortQuestionsSchema)
    .query(({ ctx, input }) => listShortQuestions(ctx.db, input)),

  stats: superAdminProcedure
    .input(shortQuestionStatsSchema.optional())
    .query(({ ctx, input }) => getShortQuestionStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getShortQuestionSchema)
    .query(({ ctx, input }) => getShortQuestionById(ctx.db, input)),

  create: superAdminProcedure
    .input(createShortQuestionSchema)
    .mutation(({ ctx, input }) => createShortQuestion(ctx.db, input)),

  update: superAdminProcedure
    .input(updateShortQuestionSchema)
    .mutation(({ ctx, input }) => updateShortQuestion(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteShortQuestionSchema)
    .mutation(({ ctx, input }) => deleteShortQuestion(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteShortQuestionsSchema)
    .mutation(({ ctx, input }) => bulkDeleteShortQuestions(ctx.db, input)),

  import: superAdminProcedure
    .input(importShortQuestionsSchema)
    .mutation(({ ctx, input }) => importShortQuestions(ctx.db, input)),
})

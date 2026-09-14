import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createDescriptiveQuestionSchema,
  deleteDescriptiveQuestionSchema,
  getDescriptiveQuestionSchema,
  listDescriptiveQuestionsSchema,
  updateDescriptiveQuestionSchema,
  bulkDeleteDescriptiveQuestionsSchema,
  importDescriptiveQuestionsSchema,
  descriptiveQuestionStatsSchema,
} from "./descriptive-question.schema"
import {
  createDescriptiveQuestion,
  deleteDescriptiveQuestion,
  getDescriptiveQuestionById,
  listDescriptiveQuestions,
  updateDescriptiveQuestion,
  bulkDeleteDescriptiveQuestions,
  importDescriptiveQuestions,
  getDescriptiveQuestionStats,
} from "./descriptive-question.service"

export const descriptiveQuestionRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listDescriptiveQuestionsSchema)
    .query(({ ctx, input }) => listDescriptiveQuestions(ctx.db, input)),

  stats: superAdminProcedure
    .input(descriptiveQuestionStatsSchema.optional())
    .query(({ ctx, input }) => getDescriptiveQuestionStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getDescriptiveQuestionSchema)
    .query(({ ctx, input }) => getDescriptiveQuestionById(ctx.db, input)),

  create: superAdminProcedure
    .input(createDescriptiveQuestionSchema)
    .mutation(({ ctx, input }) => createDescriptiveQuestion(ctx.db, input)),

  update: superAdminProcedure
    .input(updateDescriptiveQuestionSchema)
    .mutation(({ ctx, input }) => updateDescriptiveQuestion(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteDescriptiveQuestionSchema)
    .mutation(({ ctx, input }) => deleteDescriptiveQuestion(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteDescriptiveQuestionsSchema)
    .mutation(({ ctx, input }) => bulkDeleteDescriptiveQuestions(ctx.db, input)),

  import: superAdminProcedure
    .input(importDescriptiveQuestionsSchema)
    .mutation(({ ctx, input }) => importDescriptiveQuestions(ctx.db, input)),
})

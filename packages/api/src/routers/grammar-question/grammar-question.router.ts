import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createGrammarQuestionSchema,
  deleteGrammarQuestionSchema,
  getGrammarQuestionSchema,
  listGrammarQuestionSchema,
  updateGrammarQuestionSchema,
  bulkDeleteGrammarQuestionSchema,
  importGrammarQuestionSchema,
  grammarQuestionStatsSchema,
} from "./grammar-question.schema"
import {
  createGrammarQuestion,
  deleteGrammarQuestion,
  getGrammarQuestionById,
  listGrammarQuestion,
  updateGrammarQuestion,
  bulkDeleteGrammarQuestion,
  importGrammarQuestion,
  getGrammarQuestionStats,
} from "./grammar-question.service"

export const grammarQuestionRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listGrammarQuestionSchema)
    .query(({ ctx, input }) => listGrammarQuestion(ctx.db, input)),

  stats: superAdminProcedure
    .input(grammarQuestionStatsSchema.optional())
    .query(({ ctx, input }) => getGrammarQuestionStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getGrammarQuestionSchema)
    .query(({ ctx, input }) => getGrammarQuestionById(ctx.db, input)),

  create: superAdminProcedure
    .input(createGrammarQuestionSchema)
    .mutation(({ ctx, input }) => createGrammarQuestion(ctx.db, input, ctx.session?.user?.id)),

  update: superAdminProcedure
    .input(updateGrammarQuestionSchema)
    .mutation(({ ctx, input }) => updateGrammarQuestion(ctx.db, input, ctx.session?.user?.id)),

  delete: superAdminProcedure
    .input(deleteGrammarQuestionSchema)
    .mutation(({ ctx, input }) => deleteGrammarQuestion(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteGrammarQuestionSchema)
    .mutation(({ ctx, input }) => bulkDeleteGrammarQuestion(ctx.db, input)),

  import: superAdminProcedure
    .input(importGrammarQuestionSchema)
    .mutation(({ ctx, input }) => importGrammarQuestion(ctx.db, input, ctx.session?.user?.id)),
})

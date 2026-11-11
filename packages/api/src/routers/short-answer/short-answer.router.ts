import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  listShortAnswersSchema,
  shortAnswerStatsSchema,
  shortAnswerBoardYearsSchema,
  getShortAnswerSchema,
  createShortAnswerSchema,
  updateShortAnswerSchema,
  deleteShortAnswerSchema,
  bulkDeleteShortAnswersSchema,
  toggleShortAnswerActiveSchema,
  resolveShortAnswerReportSchema,
  assignShortAnswerReportSchema,
  importShortAnswersSchema,
} from "./short-answer.schema"
import {
  listShortAnswers,
  getShortAnswerById,
  createShortAnswer,
  updateShortAnswer,
  deleteShortAnswer,
  bulkDeleteShortAnswers,
  toggleShortAnswerActive,
  getShortAnswerStats,
  getShortAnswerBoardYears,
  resolveShortAnswerReport,
  assignShortAnswerReport,
  importShortAnswers,
} from "./short-answer.service"

export const shortAnswerRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listShortAnswersSchema)
    .query(({ ctx, input }) => listShortAnswers(ctx.db, input)),

  stats: superAdminProcedure
    .input(shortAnswerStatsSchema.optional())
    .query(({ ctx, input }) => getShortAnswerStats(ctx.db, input ?? {})),

  boardYears: superAdminProcedure
    .input(shortAnswerBoardYearsSchema.optional())
    .query(({ ctx, input }) => getShortAnswerBoardYears(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getShortAnswerSchema)
    .query(({ ctx, input }) => getShortAnswerById(ctx.db, input)),

  create: superAdminProcedure
    .input(createShortAnswerSchema)
    .mutation(({ ctx, input }) => createShortAnswer(ctx.db, input)),

  update: superAdminProcedure
    .input(updateShortAnswerSchema)
    .mutation(({ ctx, input }) => updateShortAnswer(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteShortAnswerSchema)
    .mutation(({ ctx, input }) => deleteShortAnswer(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteShortAnswersSchema)
    .mutation(({ ctx, input }) => bulkDeleteShortAnswers(ctx.db, input)),

  toggleActive: superAdminProcedure
    .input(toggleShortAnswerActiveSchema)
    .mutation(({ ctx, input }) => toggleShortAnswerActive(ctx.db, input)),

  import: superAdminProcedure
    .input(importShortAnswersSchema)
    .mutation(({ ctx, input }) => importShortAnswers(ctx.db, input)),

  resolveReport: superAdminProcedure
    .input(resolveShortAnswerReportSchema)
    .mutation(({ ctx, input }) =>
      resolveShortAnswerReport(ctx.db, input, ctx.session?.user?.id)
    ),

  assignReport: superAdminProcedure
    .input(assignShortAnswerReportSchema)
    .mutation(({ ctx, input }) =>
      assignShortAnswerReport(ctx.db, input, ctx.session?.user?.id)
    ),
})

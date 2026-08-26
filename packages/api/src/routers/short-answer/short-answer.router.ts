import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import { z } from "zod"
import {
  listShortAnswersSchema,
  shortAnswerStatsSchema,
  getShortAnswerSchema,
  createShortAnswerSchema,
  updateShortAnswerSchema,
  deleteShortAnswerSchema,
  bulkDeleteShortAnswersSchema,
  toggleShortAnswerActiveSchema,
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
  importShortAnswers,
} from "./short-answer.service"

export const shortAnswerRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listShortAnswersSchema)
    .query(async ({ ctx, input }) => {
      return listShortAnswers(ctx.db, input)
    }),

  byId: superAdminProcedure
    .input(getShortAnswerSchema)
    .query(async ({ ctx, input }) => {
      return getShortAnswerById(ctx.db, input)
    }),

  create: superAdminProcedure
    .input(createShortAnswerSchema)
    .mutation(async ({ ctx, input }) => {
      return createShortAnswer(ctx.db, input)
    }),

  update: superAdminProcedure
    .input(updateShortAnswerSchema)
    .mutation(async ({ ctx, input }) => {
      return updateShortAnswer(ctx.db, input)
    }),

  delete: superAdminProcedure
    .input(deleteShortAnswerSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteShortAnswer(ctx.db, input)
    }),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteShortAnswersSchema)
    .mutation(async ({ ctx, input }) => {
      return bulkDeleteShortAnswers(ctx.db, input)
    }),

  toggleActive: superAdminProcedure
    .input(toggleShortAnswerActiveSchema)
    .mutation(async ({ ctx, input }) => {
      return toggleShortAnswerActive(ctx.db, input)
    }),

  stats: superAdminProcedure
    .input(shortAnswerStatsSchema)
    .query(async ({ ctx, input }) => {
      return getShortAnswerStats(ctx.db, input)
    }),

  boardYears: superAdminProcedure
    .input(
      z.object({
        subjectId: z.string().optional(),
        chapterId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return getShortAnswerBoardYears(ctx.db, input)
    }),

  import: superAdminProcedure
    .input(importShortAnswersSchema)
    .mutation(async ({ ctx, input }) => {
      return importShortAnswers(ctx.db, input)
    }),
})

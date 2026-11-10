import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createLetterSchema,
  deleteLetterSchema,
  getLetterSchema,
  listLettersSchema,
  updateLetterSchema,
  bulkDeleteLettersSchema,
  importLettersSchema,
  letterStatsSchema,
  letterBoardYearsSchema,
  toggleLetterActiveSchema,
  resolveLetterReportSchema,
  assignLetterReportSchema,
} from "./letter.schema"
import {
  createLetter,
  deleteLetter,
  getLetterById,
  listLetters,
  updateLetter,
  bulkDeleteLetters,
  importLetters,
  getLetterStats,
  getBoardYears,
  toggleLetterActive,
  resolveLetterReport,
  assignLetterReport,
} from "./letter.service"

export const letterRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listLettersSchema)
    .query(({ ctx, input }) => listLetters(ctx.db, input)),

  stats: superAdminProcedure
    .input(letterStatsSchema.optional())
    .query(({ ctx, input }) => getLetterStats(ctx.db, input ?? {})),

  boardYears: superAdminProcedure
    .input(letterBoardYearsSchema.optional())
    .query(({ ctx, input }) => getBoardYears(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getLetterSchema)
    .query(({ ctx, input }) => getLetterById(ctx.db, input)),

  create: superAdminProcedure
    .input(createLetterSchema)
    .mutation(({ ctx, input }) => createLetter(ctx.db, input)),

  update: superAdminProcedure
    .input(updateLetterSchema)
    .mutation(({ ctx, input }) => updateLetter(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteLetterSchema)
    .mutation(({ ctx, input }) => deleteLetter(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteLettersSchema)
    .mutation(({ ctx, input }) => bulkDeleteLetters(ctx.db, input)),

  toggleActive: superAdminProcedure
    .input(toggleLetterActiveSchema)
    .mutation(({ ctx, input }) => toggleLetterActive(ctx.db, input)),

  import: superAdminProcedure
    .input(importLettersSchema)
    .mutation(({ ctx, input }) => importLetters(ctx.db, input)),

  resolveReport: superAdminProcedure
    .input(resolveLetterReportSchema)
    .mutation(({ ctx, input }) =>
      resolveLetterReport(ctx.db, input, ctx.session?.user?.id)
    ),

  assignReport: superAdminProcedure
    .input(assignLetterReportSchema)
    .mutation(({ ctx, input }) =>
      assignLetterReport(ctx.db, input, ctx.session?.user?.id)
    ),
})

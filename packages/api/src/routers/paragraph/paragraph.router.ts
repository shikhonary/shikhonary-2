import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createParagraphSchema,
  deleteParagraphSchema,
  getParagraphSchema,
  listParagraphsSchema,
  updateParagraphSchema,
  bulkDeleteParagraphsSchema,
  importParagraphsSchema,
  paragraphStatsSchema,
  paragraphBoardYearsSchema,
  toggleParagraphActiveSchema,
  resolveParagraphReportSchema,
  assignParagraphReportSchema,
} from "./paragraph.schema"
import {
  createParagraph,
  deleteParagraph,
  getParagraphById,
  listParagraphs,
  updateParagraph,
  bulkDeleteParagraphs,
  importParagraphs,
  getParagraphStats,
  getBoardYears,
  toggleParagraphActive,
  resolveParagraphReport,
  assignParagraphReport,
} from "./paragraph.service"

export const paragraphRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listParagraphsSchema)
    .query(({ ctx, input }) => listParagraphs(ctx.db, input)),

  stats: superAdminProcedure
    .input(paragraphStatsSchema.optional())
    .query(({ ctx, input }) => getParagraphStats(ctx.db, input ?? {})),

  byId: superAdminProcedure
    .input(getParagraphSchema)
    .query(({ ctx, input }) => getParagraphById(ctx.db, input)),

  boardYears: superAdminProcedure
    .input(paragraphBoardYearsSchema.optional())
    .query(({ ctx, input }) => getBoardYears(ctx.db, input ?? {})),

  create: superAdminProcedure
    .input(createParagraphSchema)
    .mutation(({ ctx, input }) => createParagraph(ctx.db, input)),

  update: superAdminProcedure
    .input(updateParagraphSchema)
    .mutation(({ ctx, input }) => updateParagraph(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteParagraphSchema)
    .mutation(({ ctx, input }) => deleteParagraph(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteParagraphsSchema)
    .mutation(({ ctx, input }) => bulkDeleteParagraphs(ctx.db, input)),

  toggleActive: superAdminProcedure
    .input(toggleParagraphActiveSchema)
    .mutation(({ ctx, input }) => toggleParagraphActive(ctx.db, input)),

  import: superAdminProcedure
    .input(importParagraphsSchema)
    .mutation(({ ctx, input }) => importParagraphs(ctx.db, input)),

  resolveReport: superAdminProcedure
    .input(resolveParagraphReportSchema)
    .mutation(({ ctx, input }) => resolveParagraphReport(ctx.db, input, ctx.session?.user?.id)),

  assignReport: superAdminProcedure
    .input(assignParagraphReportSchema)
    .mutation(({ ctx, input }) => assignParagraphReport(ctx.db, input, ctx.session?.user?.id)),
})

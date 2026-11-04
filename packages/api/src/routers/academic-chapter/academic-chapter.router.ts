import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createAcademicChapterSchema,
  deleteAcademicChapterSchema,
  getAcademicChapterSchema,
  listAcademicChaptersSchema,
  updateAcademicChapterSchema,
  chapterStatsSchema,
  bulkDeleteAcademicChaptersSchema,
} from "./academic-chapter.schema"
import {
  createAcademicChapter,
  deleteAcademicChapter,
  getAcademicChapterById,
  listAcademicChapters,
  updateAcademicChapter,
  toggleAcademicChapterStatus,
  getAcademicChapterStats,
  bulkDeleteAcademicChapters,
} from "./academic-chapter.service"

export const academicChapterRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listAcademicChaptersSchema)
    .query(({ ctx, input }) => listAcademicChapters(ctx.db, input)),

  stats: superAdminProcedure
    .input(chapterStatsSchema)
    .query(({ ctx, input }) => getAcademicChapterStats(ctx.db, input)),

  byId: superAdminProcedure
    .input(getAcademicChapterSchema)
    .query(({ ctx, input }) => getAcademicChapterById(ctx.db, input)),

  create: superAdminProcedure
    .input(createAcademicChapterSchema)
    .mutation(({ ctx, input }) => createAcademicChapter(ctx.db, input)),

  update: superAdminProcedure
    .input(updateAcademicChapterSchema)
    .mutation(({ ctx, input }) => updateAcademicChapter(ctx.db, input)),

  toggleStatus: superAdminProcedure
    .input(getAcademicChapterSchema)
    .mutation(({ ctx, input }) => toggleAcademicChapterStatus(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteAcademicChapterSchema)
    .mutation(({ ctx, input }) => deleteAcademicChapter(ctx.db, input)),

  bulkDelete: superAdminProcedure
    .input(bulkDeleteAcademicChaptersSchema)
    .mutation(({ ctx, input }) => bulkDeleteAcademicChapters(ctx.db, input)),
})

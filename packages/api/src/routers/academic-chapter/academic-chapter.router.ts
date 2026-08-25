import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createAcademicChapterSchema,
  deleteAcademicChapterSchema,
  getAcademicChapterSchema,
  listAcademicChaptersSchema,
  updateAcademicChapterSchema,
} from "./academic-chapter.schema"
import {
  createAcademicChapter,
  deleteAcademicChapter,
  getAcademicChapterById,
  listAcademicChapters,
  updateAcademicChapter,
  toggleAcademicChapterStatus,
} from "./academic-chapter.service"

export const academicChapterRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listAcademicChaptersSchema)
    .query(({ ctx, input }) => listAcademicChapters(ctx.db, input)),

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
})

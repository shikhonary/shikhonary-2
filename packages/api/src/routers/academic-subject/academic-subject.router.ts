import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createAcademicSubjectSchema,
  deleteAcademicSubjectSchema,
  getAcademicSubjectSchema,
  listAcademicSubjectsSchema,
  updateAcademicSubjectSchema,
  saveSubjectQuestionTypesSchema,
} from "./academic-subject.schema"
import {
  createAcademicSubject,
  deleteAcademicSubject,
  getAcademicSubjectById,
  listAcademicSubjects,
  updateAcademicSubject,
  toggleAcademicSubjectStatus,
  saveSubjectQuestionTypes,
} from "./academic-subject.service"

export const academicSubjectRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listAcademicSubjectsSchema)
    .query(({ ctx, input }) => listAcademicSubjects(ctx.db, input)),

  byId: superAdminProcedure
    .input(getAcademicSubjectSchema)
    .query(({ ctx, input }) => getAcademicSubjectById(ctx.db, input)),

  create: superAdminProcedure
    .input(createAcademicSubjectSchema)
    .mutation(({ ctx, input }) => createAcademicSubject(ctx.db, input)),

  update: superAdminProcedure
    .input(updateAcademicSubjectSchema)
    .mutation(({ ctx, input }) => updateAcademicSubject(ctx.db, input)),

  toggleStatus: superAdminProcedure
    .input(getAcademicSubjectSchema)
    .mutation(({ ctx, input }) => toggleAcademicSubjectStatus(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteAcademicSubjectSchema)
    .mutation(({ ctx, input }) => deleteAcademicSubject(ctx.db, input)),

  saveQuestionTypes: superAdminProcedure
    .input(saveSubjectQuestionTypesSchema)
    .mutation(({ ctx, input }) => saveSubjectQuestionTypes(ctx.db, input)),
})

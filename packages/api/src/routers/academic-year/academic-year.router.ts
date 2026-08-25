import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createAcademicYearSchema,
  deleteAcademicYearSchema,
  getAcademicYearSchema,
  listAcademicYearsSchema,
  updateAcademicYearSchema,
} from "./academic-year.schema"
import {
  createAcademicYear,
  deleteAcademicYear,
  getAcademicYearById,
  listAcademicYears,
  updateAcademicYear,
  toggleAcademicYearStatus,
} from "./academic-year.service"

export const academicYearRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listAcademicYearsSchema)
    .query(({ ctx, input }) => listAcademicYears(ctx.db, input)),

  byId: superAdminProcedure
    .input(getAcademicYearSchema)
    .query(({ ctx, input }) => getAcademicYearById(ctx.db, input)),

  create: superAdminProcedure
    .input(createAcademicYearSchema)
    .mutation(({ ctx, input }) => createAcademicYear(ctx.db, input)),

  update: superAdminProcedure
    .input(updateAcademicYearSchema)
    .mutation(({ ctx, input }) => updateAcademicYear(ctx.db, input)),

  toggleStatus: superAdminProcedure
    .input(getAcademicYearSchema)
    .mutation(({ ctx, input }) => toggleAcademicYearStatus(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteAcademicYearSchema)
    .mutation(({ ctx, input }) => deleteAcademicYear(ctx.db, input)),
})

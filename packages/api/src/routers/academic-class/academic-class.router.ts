import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createAcademicClassSchema,
  deleteAcademicClassSchema,
  getAcademicClassSchema,
  listAcademicClassesSchema,
  updateAcademicClassSchema,
  classStatsSchema,
} from "./academic-class.schema"
import {
  createAcademicClass,
  deleteAcademicClass,
  getAcademicClassById,
  listAcademicClasses,
  updateAcademicClass,
  toggleAcademicClassStatus,
  getAcademicClassStats,
} from "./academic-class.service"

export const academicClassRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listAcademicClassesSchema)
    .query(({ ctx, input }) => listAcademicClasses(ctx.db, input)),

  stats: superAdminProcedure
    .input(classStatsSchema.optional())
    .query(({ ctx, input }) => getAcademicClassStats(ctx.db, input)),

  byId: superAdminProcedure
    .input(getAcademicClassSchema)
    .query(({ ctx, input }) => getAcademicClassById(ctx.db, input)),

  create: superAdminProcedure
    .input(createAcademicClassSchema)
    .mutation(({ ctx, input }) => createAcademicClass(ctx.db, input)),

  update: superAdminProcedure
    .input(updateAcademicClassSchema)
    .mutation(({ ctx, input }) => updateAcademicClass(ctx.db, input)),

  toggleStatus: superAdminProcedure
    .input(getAcademicClassSchema)
    .mutation(({ ctx, input }) => toggleAcademicClassStatus(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteAcademicClassSchema)
    .mutation(({ ctx, input }) => deleteAcademicClass(ctx.db, input)),
})

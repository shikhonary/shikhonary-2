/**
 * Academic Class sub-router.
 *
 * Thin tRPC layer — validates input with Zod schemas, then delegates
 * business logic to `academic-class.service.ts`. No raw DB calls here.
 *
 * All procedures are protected (require an authenticated session).
 */
import { db } from "@workspace/db/main"
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  teacherProcedure,
} from "../../trpc"
import {
  academicClassForSelectionSchema,
  createAcademicClassSchema,
  deleteAcademicClassSchema,
  getAcademicClassSchema,
  listAcademicClassesSchema,
  updateAcademicClassSchema,
} from "./academic-class.schema"
import {
  createAcademicClass,
  deleteAcademicClass,
  getAcademicClassById,
  getAcademicClassesForSelection,
  getAcademicClassStats,
  listAcademicClasses,
  updateAcademicClass,
} from "./academic-class.service"

export const academicClassRouter = createTRPCRouter({
  /**
   * Fetch summary statistics for academic classes (total count, active levels count).
   */
  stats: teacherProcedure.query(() => getAcademicClassStats(db)),

  /**
   * List academic classes with pagination, level filtering, and search query.
   */
  list: teacherProcedure
    .input(listAcademicClassesSchema)
    .query(({ input }) => listAcademicClasses(db, input)),

  /**
   * Fetch a single academic class by id.
   */
  byId: teacherProcedure
    .input(getAcademicClassSchema)
    .query(({ input }) => getAcademicClassById(db, input)),

  /**
   * Fetch academic classes formatted for select inputs/dropdowns.
   */
  forSelection: protectedProcedure
    .input(academicClassForSelectionSchema)
    .query(({ input }) => getAcademicClassesForSelection(db, input)),

  /**
   * Create a new academic class record.
   */
  create: adminProcedure
    .input(createAcademicClassSchema)
    .mutation(({ input }) => createAcademicClass(db, input)),

  /**
   * Update an existing academic class.
   */
  update: adminProcedure
    .input(updateAcademicClassSchema)
    .mutation(({ input }) => updateAcademicClass(db, input)),

  /**
   * Permanently delete an academic class record.
   */
  delete: adminProcedure
    .input(deleteAcademicClassSchema)
    .mutation(({ input }) => deleteAcademicClass(db, input)),
})

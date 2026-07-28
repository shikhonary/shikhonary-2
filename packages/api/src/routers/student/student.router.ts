/**
 * Student sub-router.
 *
 * Validates input with Zod schemas and delegates business logic to `student.service.ts`.
 */
import { db } from "@workspace/db/main"
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  teacherProcedure,
} from "../../trpc"
import {
  completeStudentOnboardingSchema,
  updateStudentProfileSchema,
  listStudentsSchema,
  getStudentSchema,
  createStudentSchema,
  updateStudentAdminSchema,
  deleteStudentSchema,
} from "./student.schema"
import {
  completeStudentOnboarding,
  getStudentByUserId,
  updateStudentProfile,
  listStudents,
  getStudentStats,
  getStudentByIdAdmin,
  createStudent,
  updateStudentAdmin,
  deleteStudentAdmin,
} from "./student.service"

export const studentRouter = createTRPCRouter({
  /**
   * Fetch current authenticated user's student profile (if onboarded).
   */
  getProfile: protectedProcedure.query(({ ctx }) => {
    return getStudentByUserId(db, ctx.session.user.id)
  }),

  /**
   * Complete student onboarding / save profile info.
   */
  completeOnboarding: protectedProcedure
    .input(completeStudentOnboardingSchema)
    .mutation(({ ctx, input }) => {
      return completeStudentOnboarding(db, ctx.session.user.id, input)
    }),

  /**
   * Update student profile.
   */
  updateProfile: protectedProcedure
    .input(updateStudentProfileSchema)
    .mutation(({ ctx, input }) => {
      return updateStudentProfile(db, ctx.session.user.id, input)
    }),

  /**
   * Fetch summary statistics for students.
   */
  stats: teacherProcedure.query(() => getStudentStats(db)),

  /**
   * List students with filtering, search query, and pagination.
   */
  list: teacherProcedure
    .input(listStudentsSchema)
    .query(({ input }) => listStudents(db, input)),

  /**
   * Fetch a single student profile by ID.
   */
  byId: teacherProcedure
    .input(getStudentSchema)
    .query(({ input }) => getStudentByIdAdmin(db, input)),

  /**
   * Create a new student profile (admin procedure).
   */
  create: adminProcedure
    .input(createStudentSchema)
    .mutation(({ input }) => createStudent(db, input)),

  /**
   * Update student profile from admin panel.
   */
  update: adminProcedure
    .input(updateStudentAdminSchema)
    .mutation(({ input }) => updateStudentAdmin(db, input)),

  /**
   * Delete student profile from admin panel.
   */
  delete: adminProcedure
    .input(deleteStudentSchema)
    .mutation(({ input }) => deleteStudentAdmin(db, input)),
})

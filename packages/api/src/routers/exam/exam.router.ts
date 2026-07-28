/**
 * Exam sub-router (admin-facing).
 *
 * Thin tRPC layer — validates input with Zod schemas, then delegates
 * business logic to `exam.service.ts`. No raw DB calls here.
 *
 * All procedures are protected (require an authenticated session).
 */
import { db } from "@workspace/db/main"
import { createTRPCRouter, protectedProcedure } from "../../trpc"
import {
  addExamSubjectsSchema,
  bulkDeleteExamsSchema,
  createExamSchema,
  deleteExamSchema,
  examStatsSchema,
  getExamSchema,
  listExamsSchema,
  removeExamSubjectSchema,
  toggleExamStatusSchema,
  updateExamSchema,
  updateExamSubjectMcqsSchema,
  mcqsForAssignmentSchema,
} from "./exam.schema"
import {
  addExamSubjects,
  bulkDeleteExams,
  createExam,
  deleteExam,
  getExamById,
  getExamStats,
  listExams,
  removeExamSubject,
  toggleExamStatus,
  updateExam,
  updateExamSubjectMcqs,
  getMcqsForAssignment,
} from "./exam.service"

export const examRouter = createTRPCRouter({
  /**
   * Fetch summary statistics for exams (counts by status, type).
   */
  stats: protectedProcedure
    .input(examStatsSchema.optional())
    .query(({ input }) => getExamStats(db, input)),

  /**
   * List exams with pagination, status/type/academicClass filtering, and search query.
   */
  list: protectedProcedure
    .input(listExamsSchema)
    .query(({ input }) => listExams(db, input)),

  /**
   * Fetch a single exam by id (including subjects, academic class, and attempt count).
   */
  byId: protectedProcedure
    .input(getExamSchema)
    .query(({ input }) => getExamById(db, input)),

  /**
   * Create a new exam with subject and academic class links.
   */
  create: protectedProcedure
    .input(createExamSchema)
    .mutation(({ input }) => createExam(db, input)),

  /**
   * Update an existing exam.
   */
  update: protectedProcedure
    .input(updateExamSchema)
    .mutation(({ input }) => updateExam(db, input)),

  /**
   * Permanently delete a single exam.
   */
  delete: protectedProcedure
    .input(deleteExamSchema)
    .mutation(({ input }) => deleteExam(db, input)),

  /**
   * Permanently delete multiple exams by IDs.
   */
  bulkDelete: protectedProcedure
    .input(bulkDeleteExamsSchema)
    .mutation(({ input }) => bulkDeleteExams(db, input)),

  /**
   * Change the status of an exam (Pending → Published → Archived).
   */
  toggleStatus: protectedProcedure
    .input(toggleExamStatusSchema)
    .mutation(({ input }) => toggleExamStatus(db, input)),

  /**
   * Add subjects to an existing exam.
   */
  addSubjects: protectedProcedure
    .input(addExamSubjectsSchema)
    .mutation(({ input }) => addExamSubjects(db, input)),

  /**
   * Remove a subject from an exam.
   */
  removeSubject: protectedProcedure
    .input(removeExamSubjectSchema)
    .mutation(({ input }) => removeExamSubject(db, input)),

  /**
   * Update assigned MCQ IDs for an exam subject.
   */
  updateSubjectMcqs: protectedProcedure
    .input(updateExamSubjectMcqsSchema)
    .mutation(({ input }) => updateExamSubjectMcqs(db, input)),

  /**
   * Fetch MCQs for assignment, supporting search, assignment status filtering, type filtering, and pagination.
   */
  mcqsForAssignment: protectedProcedure
    .input(mcqsForAssignmentSchema)
    .query(({ input }) => getMcqsForAssignment(db, input)),
})

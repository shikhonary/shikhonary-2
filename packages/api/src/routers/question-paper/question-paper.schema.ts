import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const listQuestionPapersSchema = paginationSchema.extend({
  classId: z.string().optional(),
  status: z.enum(["Draft", "Published"]).optional(),
  isTemplate: z.boolean().optional(),
  search: z.string().optional(),
})

export type ListQuestionPapersInput = z.infer<typeof listQuestionPapersSchema>

export const getQuestionPaperSchema = idSchema

export type GetQuestionPaperInput = z.infer<typeof getQuestionPaperSchema>

// ---------------------------------------------------------------------------
// Mutations - Question Paper CRUD
// ---------------------------------------------------------------------------

export const createQuestionPaperSchema = z.object({
  title: z.string().min(1, "Title is required"),
  examName: z.string().min(1, "Exam name is required"),
  description: z.string().optional(),
  classId: z.string().min(1, "Class ID is required"),
  className: z.string().min(1, "Class name is required"),
  settings: z.record(z.any()).optional().default({}),
  instructions: z.array(z.any()).optional().default([]),
  isTemplate: z.boolean().optional().default(false),
})

export type CreateQuestionPaperInput = z.infer<typeof createQuestionPaperSchema>

export const updateQuestionPaperSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  examName: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  classId: z.string().min(1).optional(),
  className: z.string().min(1).optional(),
  settings: z.record(z.any()).optional(),
  instructions: z.array(z.any()).optional(),
  status: z.enum(["Draft", "Published"]).optional(),
  isTemplate: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export type UpdateQuestionPaperInput = z.infer<typeof updateQuestionPaperSchema>

export const deleteQuestionPaperSchema = idSchema

export type DeleteQuestionPaperInput = z.infer<typeof deleteQuestionPaperSchema>

export const duplicateQuestionPaperSchema = idSchema

export type DuplicateQuestionPaperInput = z.infer<typeof duplicateQuestionPaperSchema>

// ---------------------------------------------------------------------------
// Mutations - Sections
// ---------------------------------------------------------------------------

export const upsertQuestionPaperSectionSchema = z.object({
  id: z.string().optional(),
  questionPaperId: z.string().min(1),
  title: z.string().min(1, "Section title is required"),
  titleBn: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  orderIndex: z.number().int().optional().default(0),
})

export type UpsertQuestionPaperSectionInput = z.infer<typeof upsertQuestionPaperSectionSchema>

export const deleteQuestionPaperSectionSchema = z.object({
  questionPaperId: z.string().min(1),
  id: z.string().min(1),
})

export type DeleteQuestionPaperSectionInput = z.infer<typeof deleteQuestionPaperSectionSchema>

// ---------------------------------------------------------------------------
// Mutations - Subjects
// ---------------------------------------------------------------------------

export const upsertQuestionPaperSubjectSchema = z.object({
  id: z.string().optional(),
  questionPaperId: z.string().min(1),
  subjectId: z.string().min(1),
  subjectName: z.string().min(1),
  subjectTotal: z.number().optional().default(0),
})

export type UpsertQuestionPaperSubjectInput = z.infer<typeof upsertQuestionPaperSubjectSchema>

export const deleteQuestionPaperSubjectSchema = z.object({
  questionPaperId: z.string().min(1),
  id: z.string().min(1),
})

export type DeleteQuestionPaperSubjectInput = z.infer<typeof deleteQuestionPaperSubjectSchema>

// ---------------------------------------------------------------------------
// Mutations - Mark Distributions
// ---------------------------------------------------------------------------

export const upsertQuestionPaperDistributionSchema = z.object({
  id: z.string().optional(),
  paperSubjectId: z.string().min(1),
  questionTypeId: z.string().min(1),
  questionTypeName: z.string().min(1),
  marksPerQuestion: z.number().positive(),
  questionCount: z.number().int().nonnegative(),
  questionsToAttempt: z.number().int().positive().optional().nullable(),
  orderIndex: z.number().int().optional().default(0),
})

export type UpsertQuestionPaperDistributionInput = z.infer<typeof upsertQuestionPaperDistributionSchema>

export const deleteQuestionPaperDistributionSchema = z.object({
  questionPaperId: z.string().min(1),
  id: z.string().min(1),
})

export type DeleteQuestionPaperDistributionInput = z.infer<typeof deleteQuestionPaperDistributionSchema>

// ---------------------------------------------------------------------------
// Mutations - Questions Junction
// ---------------------------------------------------------------------------

export const addQuestionPaperQuestionSchema = z.object({
  questionPaperId: z.string().min(1),
  mcqId: z.string().optional().nullable(),
  cqId: z.string().optional().nullable(),
  shortAnswerId: z.string().optional().nullable(),
  distributionId: z.string().min(1),
  sectionId: z.string().optional().nullable(),
  orderIndex: z.number().int().optional().default(0),
  assignedMarks: z.number().optional().nullable(),
  overrides: z.record(z.any()).optional().default({}),
})

export type AddQuestionPaperQuestionInput = z.infer<typeof addQuestionPaperQuestionSchema>

export const removeQuestionPaperQuestionSchema = z.object({
  questionPaperId: z.string().min(1),
  questionId: z.string().min(1),
  questionType: z.enum(["MCQ", "CQ", "SHORT"]),
})

export type RemoveQuestionPaperQuestionInput = z.infer<typeof removeQuestionPaperQuestionSchema>

export const reorderQuestionPaperQuestionsSchema = z.object({
  questionPaperId: z.string().min(1),
  questionOrders: z.array(
    z.object({
      id: z.string().min(1),
      orderIndex: z.number().int(),
    })
  ),
})

export type ReorderQuestionPaperQuestionsInput = z.infer<typeof reorderQuestionPaperQuestionsSchema>

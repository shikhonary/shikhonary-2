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
  page: z.number().int().min(1).optional(),
  sort: z.string().optional(),
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
  timeInMinutes: z.number().int().nonnegative().optional().default(0),
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
  timeInMinutes: z.number().int().nonnegative().optional(),
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
// Mutations - Sub-Sections
// ---------------------------------------------------------------------------

export const upsertQuestionPaperSubSectionSchema = z.object({
  id: z.string().optional(),
  sectionId: z.string().min(1),
  title: z.string().min(1, "Sub-section title is required"),
  titleBn: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  orderIndex: z.number().int().optional().default(0),
})

export type UpsertQuestionPaperSubSectionInput = z.infer<typeof upsertQuestionPaperSubSectionSchema>

export const deleteQuestionPaperSubSectionSchema = z.object({
  sectionId: z.string().min(1),
  id: z.string().min(1),
})

export type DeleteQuestionPaperSubSectionInput = z.infer<typeof deleteQuestionPaperSubSectionSchema>

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
  questionTypeLabel: z.string().optional().nullable(),
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
  questionType: z.enum(["MCQ", "CQ", "SA", "PARAGRAPH", "AMPLIFICATION"]),
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

// ---------------------------------------------------------------------------
// Builder Specific Queries & Mutations
// ---------------------------------------------------------------------------

export const getDistributionStatusesSchema = z.object({
  questionPaperId: z.string().min(1),
})

export type GetDistributionStatusesInput = z.infer<typeof getDistributionStatusesSchema>

export const getAvailableQuestionsSchema = z.object({
  subjectId: z.string().min(1),
  chapterId: z.string().optional(),
  questionTypeId: z.string().optional(),
  category: z.enum(["MCQ", "CQ", "SA", "PARAGRAPH", "AMPLIFICATION"]).optional(),
  difficulty: z.string().optional(),
  search: z.string().optional(),
  board: z.string().optional(),
  year: z.number().int().optional(),
  excludePaperId: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
})

export type GetAvailableQuestionsInput = z.infer<typeof getAvailableQuestionsSchema>

export const bulkAssignQuestionsSchema = z.object({
  questionPaperId: z.string().min(1),
  distributionId: z.string().min(1),
  sectionId: z.string().optional().nullable(),
  mcqIds: z.array(z.string()).optional(),
  cqIds: z.array(z.string()).optional(),
  shortAnswerIds: z.array(z.string()).optional(),
  paragraphIds: z.array(z.string()).optional(),
  amplificationIds: z.array(z.string()).optional(),
})

export type BulkAssignQuestionsInput = z.infer<typeof bulkAssignQuestionsSchema>

export const bulkRemoveQuestionsSchema = z.object({
  questionPaperId: z.string().min(1),
  questionIds: z.array(z.string().min(1)),
})

export type BulkRemoveQuestionsInput = z.infer<typeof bulkRemoveQuestionsSchema>

export const updateQuestionPaperSettingsSchema = z.object({
  id: z.string().min(1),
  settings: z.record(z.any()),
})

export type UpdateQuestionPaperSettingsInput = z.infer<typeof updateQuestionPaperSettingsSchema>

export const generatePaperSetsSchema = z.object({
  sourcePaperId: z.string().min(1),
  setCodes: z.array(z.string()).min(1),
  shuffleQuestions: z.boolean().default(true),
  shuffleOptions: z.boolean().default(true),
})

export type GeneratePaperSetsInput = z.infer<typeof generatePaperSetsSchema>


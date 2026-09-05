import { z } from "zod"
import { QUESTION_TYPE_CODES } from "@workspace/utils"
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

export const createQuestionPaperFullSchema = z.object({
  title: z.string().min(1, "Title is required"),
  examName: z.string().min(1, "Exam name is required"),
  description: z.string().optional(),
  classId: z.string().min(1, "Class ID is required"),
  className: z.string().min(1, "Class name is required"),
  settings: z.record(z.any()).optional().default({}),
  instructions: z.array(z.any()).optional().default([]),
  isTemplate: z.boolean().optional().default(false),
  timeInMinutes: z.number().int().nonnegative().optional().default(0),
  subjects: z.array(z.object({
    subjectId: z.string().min(1),
    subjectName: z.string().min(1),
    orderIndex: z.number().int().optional().default(0),
    questionTypeIds: z.array(z.string()).optional(),
    distributions: z.array(z.object({
      questionTypeId: z.string().min(1),
      questionTypeName: z.string().min(1),
      questionTypeLabel: z.string().optional().nullable(),
      marksPerQuestion: z.number().positive(),
      markDistribution: z.any().optional().nullable(),
      questionCount: z.number().int().nonnegative(),
      questionsToAttempt: z.number().int().positive().optional().nullable(),
      orderIndex: z.number().int().optional().default(0),
    })),
  })).optional().default([]),
})

export type CreateQuestionPaperFullInput = z.infer<typeof createQuestionPaperFullSchema>

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
  sectionId: z.string().optional(),
  title: z.string().optional(),
  titleBn: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  questionsToAttempt: z.number().int().nonnegative().optional().nullable(),
  orderIndex: z.number().int().optional(),
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
  orderIndex: z.number().int().optional(),
  subjectTotal: z.number().optional().default(0),
  questionTypeIds: z.array(z.string()).optional(),
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
  markDistribution: z.any().optional().nullable(),
  questionCount: z.number().int().nonnegative(),
  questionsToAttempt: z.number().int().positive().optional().nullable(),
  orderIndex: z.number().int().optional().default(0),
  sectionId: z.string().optional().nullable(),
  subSectionId: z.string().optional().nullable(),
  subSectionIds: z.array(z.string()).optional().nullable(),
})

export type UpsertQuestionPaperDistributionInput = z.infer<typeof upsertQuestionPaperDistributionSchema>

export const deleteQuestionPaperDistributionSchema = z.object({
  questionPaperId: z.string().min(1),
  id: z.string().min(1),
})

export type DeleteQuestionPaperDistributionInput = z.infer<typeof deleteQuestionPaperDistributionSchema>

export const updateDistributionLabelSchema = z.object({
  questionPaperId: z.string().min(1),
  id: z.string().min(1),
  questionTypeLabel: z.string().nullable(),
})

export type UpdateDistributionLabelInput = z.infer<typeof updateDistributionLabelSchema>

// ---------------------------------------------------------------------------
// Mutations - Questions Junction
// ---------------------------------------------------------------------------

export const addQuestionPaperQuestionSchema = z.object({
  questionPaperId: z.string().min(1),
  mcqId: z.string().optional().nullable(),
  cqId: z.string().optional().nullable(),
  csId: z.string().optional().nullable(),
  shortAnswerId: z.string().optional().nullable(),
  paragraphId: z.string().optional().nullable(),
  amplificationId: z.string().optional().nullable(),
  letterId: z.string().optional().nullable(),
  applicationId: z.string().optional().nullable(),
  summaryId: z.string().optional().nullable(),
  essenceId: z.string().optional().nullable(),
  essayId: z.string().optional().nullable(),
  newsReportId: z.string().optional().nullable(),
  distributionId: z.string().min(1),
  sectionId: z.string().optional().nullable(),
  subSectionId: z.string().optional().nullable(),
  orderIndex: z.number().int().optional().default(0),
  assignedMarks: z.number().optional().nullable(),
  overrides: z.record(z.any()).optional().default({}),
})

export type AddQuestionPaperQuestionInput = z.infer<typeof addQuestionPaperQuestionSchema>

export const questionTypeCategorySchema = z.enum([
  QUESTION_TYPE_CODES.MCQ,
  QUESTION_TYPE_CODES.CQ,
  QUESTION_TYPE_CODES.CS,
  QUESTION_TYPE_CODES.SA,
  QUESTION_TYPE_CODES.PARAGRAPH,
  QUESTION_TYPE_CODES.AMPLIFICATION,
  QUESTION_TYPE_CODES.LETTER,
  QUESTION_TYPE_CODES.APPLICATION,
  QUESTION_TYPE_CODES.SUMMARY,
  QUESTION_TYPE_CODES.ESSENCE,
  QUESTION_TYPE_CODES.NEWS_REPORT,
  QUESTION_TYPE_CODES.ESSAY,
])

export const removeQuestionPaperQuestionSchema = z.object({
  questionPaperId: z.string().min(1),
  questionId: z.string().min(1),
  questionType: questionTypeCategorySchema,
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
// Alternative / "OR" Question Schemas
// ---------------------------------------------------------------------------

export const addAlternativeQuestionSchema = z.object({
  questionPaperId: z.string().min(1),
  parentQuestionId: z.string().min(1),
  questionId: z.string().min(1),
  questionType: questionTypeCategorySchema,
  distributionId: z.string().optional(),
  orLabel: z.string().optional().default("অথবা"),
})

export type AddAlternativeQuestionInput = z.infer<typeof addAlternativeQuestionSchema>

export const removeAlternativeQuestionSchema = z.object({
  questionPaperId: z.string().min(1),
  alternativeQuestionId: z.string().min(1),
})

export type RemoveAlternativeQuestionInput = z.infer<typeof removeAlternativeQuestionSchema>

export const swapAlternativeQuestionSchema = z.object({
  questionPaperId: z.string().min(1),
  parentQuestionId: z.string().min(1),
  alternativeQuestionId: z.string().min(1),
})

export type SwapAlternativeQuestionInput = z.infer<typeof swapAlternativeQuestionSchema>

export const updateAlternativeQuestionSchema = z.object({
  questionPaperId: z.string().min(1),
  alternativeQuestionId: z.string().min(1),
  orLabel: z.string().min(1).optional(),
})

export type UpdateAlternativeQuestionInput = z.infer<typeof updateAlternativeQuestionSchema>

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
  category: questionTypeCategorySchema.optional(),
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
  subSectionId: z.string().optional().nullable(),
  mcqIds: z.array(z.string()).optional(),
  cqIds: z.array(z.string()).optional(),
  csIds: z.array(z.string()).optional(),
  shortAnswerIds: z.array(z.string()).optional(),
  paragraphIds: z.array(z.string()).optional(),
  amplificationIds: z.array(z.string()).optional(),
  letterIds: z.array(z.string()).optional(),
  applicationIds: z.array(z.string()).optional(),
  summaryIds: z.array(z.string()).optional(),
  essenceIds: z.array(z.string()).optional(),
  essayIds: z.array(z.string()).optional(),
  newsReportIds: z.array(z.string()).optional(),
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


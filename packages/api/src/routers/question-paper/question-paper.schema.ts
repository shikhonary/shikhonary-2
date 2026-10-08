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
      questionTypeNameBn: z.string().optional().nullable(),
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
  questionTypeNameBn: z.string().optional().nullable(),
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
  pbqId: z.string().optional().nullable(),
  paragraphId: z.string().optional().nullable(),
  amplificationId: z.string().optional().nullable(),
  letterId: z.string().optional().nullable(),
  applicationId: z.string().optional().nullable(),
  summaryId: z.string().optional().nullable(),
  essenceId: z.string().optional().nullable(),
  poemEssenceId: z.string().optional().nullable(),
  proseEssenceId: z.string().optional().nullable(),
  poemId: z.string().optional().nullable(),
  essayId: z.string().optional().nullable(),
  newsReportId: z.string().optional().nullable(),
  partsOfSpeechId: z.string().optional().nullable(),
  rightFormOfVerbId: z.string().optional().nullable(),
  changingSentenceId: z.string().optional().nullable(),
  fillInTheBlanksWithCluesId: z.string().optional().nullable(),
  fillInTheBlanksWithoutCluesId: z.string().optional().nullable(),
  substitutionTableId: z.string().optional().nullable(),
  punctuationId: z.string().optional().nullable(),
  shortCompositionId: z.string().optional().nullable(),
  descriptiveQuestionId: z.string().optional().nullable(),
  shortQuestionId: z.string().optional().nullable(),
  makeQuestionId: z.string().optional().nullable(),
  wordMeaningId: z.string().optional().nullable(),
  juktobornoId: z.string().optional().nullable(),
  ekKothayProkashId: z.string().optional().nullable(),
  makeSentencesId: z.string().optional().nullable(),
  oppositeWordId: z.string().optional().nullable(),
  synonymId: z.string().optional().nullable(),
  sadhuToCholitoId: z.string().optional().nullable(),
  podNirnoyId: z.string().optional().nullable(),
  verbTenseId: z.string().optional().nullable(),
  formFillupId: z.string().optional().nullable(),
  shuddhoAshuddhoId: z.string().optional().nullable(),
  danBamMilkoronId: z.string().optional().nullable(),
  distributionId: z.string().min(1),
  sectionId: z.string().optional().nullable(),
  subSectionId: z.string().optional().nullable(),
  orderIndex: z.number().int().optional().default(0),
  assignedMarks: z.number().optional().nullable(),
  overrides: z.record(z.any()).optional().default({}),
})

export type AddQuestionPaperQuestionInput = z.infer<typeof addQuestionPaperQuestionSchema>

export const questionTypeCategorySchema = z.nativeEnum(QUESTION_TYPE_CODES)

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
  source: z.string().optional(),
  year: z.number().int().optional(),
  excludePaperId: z.string().optional(),
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(20).optional(),
  cursor: z.string().optional(),
  sort: z.enum(["newest", "oldest"]).optional(),
})

export type GetAvailableQuestionsInput = z.infer<typeof getAvailableQuestionsSchema>

export const getAvailableBoardYearsSchema = z.object({
  subjectId: z.string().min(1),
  chapterId: z.string().optional(),
  questionTypeId: z.string().optional(),
  category: questionTypeCategorySchema.optional(),
})

export type GetAvailableBoardYearsInput = z.infer<typeof getAvailableBoardYearsSchema>

export const getAvailableSourcesSchema = z.object({
  subjectId: z.string().min(1),
  chapterId: z.string().optional(),
  questionTypeId: z.string().optional(),
  category: questionTypeCategorySchema.optional(),
})

export type GetAvailableSourcesInput = z.infer<typeof getAvailableSourcesSchema>

export const bulkAssignQuestionsSchema = z.object({
  questionPaperId: z.string().min(1),
  distributionId: z.string().min(1),
  sectionId: z.string().optional().nullable(),
  subSectionId: z.string().optional().nullable(),
  mcqIds: z.array(z.string()).optional(),
  cqIds: z.array(z.string()).optional(),
  csIds: z.array(z.string()).optional(),
  pbqIds: z.array(z.string()).optional(),
  shortAnswerIds: z.array(z.string()).optional(),
  paragraphIds: z.array(z.string()).optional(),
  amplificationIds: z.array(z.string()).optional(),
  letterIds: z.array(z.string()).optional(),
  applicationIds: z.array(z.string()).optional(),
  summaryIds: z.array(z.string()).optional(),
  essenceIds: z.array(z.string()).optional(),
  poemEssenceIds: z.array(z.string()).optional(),
  proseEssenceIds: z.array(z.string()).optional(),
  poemIds: z.array(z.string()).optional(),
  essayIds: z.array(z.string()).optional(),
  newsReportIds: z.array(z.string()).optional(),
  partsOfSpeechIds: z.array(z.string()).optional(),
  rightFormOfVerbIds: z.array(z.string()).optional(),
  changingSentenceIds: z.array(z.string()).optional(),
  fillInTheBlanksWithCluesIds: z.array(z.string()).optional(),
  fillInTheBlanksWithoutCluesIds: z.array(z.string()).optional(),
  substitutionTableIds: z.array(z.string()).optional(),
  punctuationIds: z.array(z.string()).optional(),
  shortCompositionIds: z.array(z.string()).optional(),
  descriptiveQuestionIds: z.array(z.string()).optional(),
  shortQuestionIds: z.array(z.string()).optional(),
  makeQuestionIds: z.array(z.string()).optional(),
  wordMeaningIds: z.array(z.string()).optional(),
  juktobornoIds: z.array(z.string()).optional(),
  ekKothayProkashIds: z.array(z.string()).optional(),
  makeSentencesIds: z.array(z.string()).optional(),
  oppositeWordIds: z.array(z.string()).optional(),
  synonymIds: z.array(z.string()).optional(),
  sadhuToCholitoIds: z.array(z.string()).optional(),
  podNirnoyIds: z.array(z.string()).optional(),
  verbTenseIds: z.array(z.string()).optional(),
  formFillupIds: z.array(z.string()).optional(),
  shuddhoAshuddhoIds: z.array(z.string()).optional(),
  danBamMilkoronIds: z.array(z.string()).optional(),
})

export type BulkAssignQuestionsInput = z.infer<typeof bulkAssignQuestionsSchema>

export const bulkRemoveQuestionsSchema = z.object({
  questionPaperId: z.string().min(1),
  questionIds: z.array(z.string().min(1)),
})

export type BulkRemoveQuestionsInput = z.infer<typeof bulkRemoveQuestionsSchema>

export const autoFillDistributionSchema = z.object({
  questionPaperId: z.string().min(1),
  distributionId: z.string().min(1),
  count: z.number().int().positive().optional(),
  chapterId: z.string().optional(),
  difficulty: z.string().optional(),
  board: z.string().optional(),
  source: z.string().optional(),
})

export type AutoFillDistributionInput = z.infer<typeof autoFillDistributionSchema>

export const replaceQuestionSchema = z.object({
  questionPaperId: z.string().min(1),
  questionPaperQuestionId: z.string().min(1),
  chapterId: z.string().optional(),
  difficulty: z.string().optional(),
})

export type ReplaceQuestionInput = z.infer<typeof replaceQuestionSchema>

export const updateQuestionPaperSettingsSchema = z.object({
  id: z.string().min(1),
  settings: z.record(z.any()),
})

export type UpdateQuestionPaperSettingsInput = z.infer<typeof updateQuestionPaperSettingsSchema>

export const patchQuestionPaperSettingsSchema = z.object({
  id: z.string().min(1),
  patch: z
    .object({
      paperSize: z.enum(["A4", "Letter", "Legal", "A5"]).optional(),
      paperOrientation: z.enum(["portrait", "landscape"]).optional(),
      margins: z
        .object({
          top: z.number().optional(),
          bottom: z.number().optional(),
          left: z.number().optional(),
          right: z.number().optional(),
        })
        .optional(),
      columns: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
      showColumnDivider: z.boolean().optional(),
      bookletMode: z.boolean().optional(),
      bookFoldLayout: z.boolean().optional(),
      twoPagesPerSheet: z.boolean().optional(),
      headerTemplate: z.enum(["classic", "modern", "minimal", "left-aligned"]).optional(),
      optionStyle: z.enum(["parentheses", "dot", "circle", "round"]).optional(),
      fontFamily: z.string().optional(),
      fontSize: z.number().optional(),
      fontWeight: z.enum(["normal", "medium", "semibold", "bold"]).optional(),
      lineHeight: z.number().optional(),
      textAlign: z.enum(["left", "center", "right", "justify"]).optional(),
      showLogo: z.boolean().optional(),
      logoUrl: z.string().optional(),
      showAddress: z.boolean().optional(),
      address: z.string().optional(),
      showWatermark: z.boolean().optional(),
      watermark: z.string().optional(),
      showClassName: z.boolean().optional(),
      showSubjectName: z.boolean().optional(),
      showChapterName: z.boolean().optional(),
      showSetCode: z.boolean().optional(),
      showExamName: z.boolean().optional(),
      showTime: z.boolean().optional(),
      showTotalMarks: z.boolean().optional(),
      showInstructions: z.boolean().optional(),
      showNoMarkingNote: z.boolean().optional(),
      showReference: z.boolean().optional(),
      institutionName: z.string().optional(),
      className: z.string().optional(),
      subjectName: z.string().optional(),
      chapterName: z.string().optional(),
      setCode: z.string().optional(),
      examName: z.string().optional(),
      time: z.string().optional(),
      totalMarks: z.union([z.string(), z.number()]).optional(),
      instructions: z.string().optional(),
      showOMRSheet: z.boolean().optional(),
      omrSettings: z
        .object({
          columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
          includeRollNumber: z.boolean().optional(),
        })
        .optional(),
      dismissedSectionIds: z.array(z.string()).optional(),
      dismissedSubSectionIds: z.array(z.string()).optional(),
    })
    .passthrough(),
})

export type PatchQuestionPaperSettingsInput = z.infer<typeof patchQuestionPaperSettingsSchema>

export const generatePaperSetsSchema = z.object({
  sourcePaperId: z.string().min(1),
  setCodes: z.array(z.string()).min(1),
  shuffleQuestions: z.boolean().default(true),
  shuffleOptions: z.boolean().default(true),
})

export type GeneratePaperSetsInput = z.infer<typeof generatePaperSetsSchema>



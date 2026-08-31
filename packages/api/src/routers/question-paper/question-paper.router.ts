import { createTRPCRouter, tenantMemberProcedure, publicTenantProcedure } from "../../trpc"
import {
  listQuestionPapersSchema,
  getQuestionPaperSchema,
  createQuestionPaperSchema,
  updateQuestionPaperSchema,
  deleteQuestionPaperSchema,
  duplicateQuestionPaperSchema,
  addQuestionPaperQuestionSchema,
  removeQuestionPaperQuestionSchema,
  reorderQuestionPaperQuestionsSchema,
  upsertQuestionPaperSectionSchema,
  deleteQuestionPaperSectionSchema,
  upsertQuestionPaperSubSectionSchema,
  deleteQuestionPaperSubSectionSchema,
  upsertQuestionPaperSubjectSchema,
  deleteQuestionPaperSubjectSchema,
  upsertQuestionPaperDistributionSchema,
  deleteQuestionPaperDistributionSchema,
  getDistributionStatusesSchema,
  getAvailableQuestionsSchema,
  bulkAssignQuestionsSchema,
  bulkRemoveQuestionsSchema,
  updateQuestionPaperSettingsSchema,
  generatePaperSetsSchema,
} from "./question-paper.schema"
import {
  listQuestionPapers,
  getQuestionPaperById,
  createQuestionPaper,
  updateQuestionPaper,
  deleteQuestionPaper,
  duplicateQuestionPaper,
  addQuestionPaperQuestion,
  removeQuestionPaperQuestion,
  reorderQuestionPaperQuestions,
  upsertQuestionPaperSection,
  deleteQuestionPaperSection,
  upsertQuestionPaperSubSection,
  deleteQuestionPaperSubSection,
  upsertQuestionPaperSubject,
  deleteQuestionPaperSubject,
  upsertQuestionPaperDistribution,
  deleteQuestionPaperDistribution,
  getQuestionPaperHistory,
  getQuestionPaperDistributionStatuses,
  getAvailableQuestions,
  bulkAssignQuestions,
  bulkRemoveQuestions,
  updateQuestionPaperSettings,
  generatePaperSets,
} from "./question-paper.service"

export const questionPaperRouter = createTRPCRouter({
  // Queries
  list: tenantMemberProcedure
    .input(listQuestionPapersSchema)
    .query(({ ctx, input }) => listQuestionPapers(ctx.tenantDb, input)),

  byId: publicTenantProcedure
    .input(getQuestionPaperSchema)
    .query(({ ctx, input }) => getQuestionPaperById(ctx.db, ctx.tenantDb, input)),

  history: tenantMemberProcedure
    .input(getQuestionPaperSchema)
    .query(({ ctx, input }) => getQuestionPaperHistory(ctx.tenantDb, input)),

  getDistributionStatuses: tenantMemberProcedure
    .input(getDistributionStatusesSchema)
    .query(({ ctx, input }) =>
      getQuestionPaperDistributionStatuses(ctx.db, ctx.tenantDb, input)
    ),

  getAvailableQuestions: tenantMemberProcedure
    .input(getAvailableQuestionsSchema)
    .query(({ ctx, input }) =>
      getAvailableQuestions(ctx.db, ctx.tenantDb, input)
    ),

  // Mutations
  create: tenantMemberProcedure
    .input(createQuestionPaperSchema)
    .mutation(({ ctx, input }) =>
      createQuestionPaper(ctx.tenantDb, input, ctx.session.user.id)
    ),

  update: tenantMemberProcedure
    .input(updateQuestionPaperSchema)
    .mutation(({ ctx, input }) =>
      updateQuestionPaper(ctx.db, ctx.tenantDb, input, ctx.session.user.id)
    ),

  updateSettings: tenantMemberProcedure
    .input(updateQuestionPaperSettingsSchema)
    .mutation(({ ctx, input }) =>
      updateQuestionPaperSettings(ctx.tenantDb, input, ctx.session.user.id)
    ),

  delete: tenantMemberProcedure
    .input(deleteQuestionPaperSchema)
    .mutation(({ ctx, input }) =>
      deleteQuestionPaper(ctx.tenantDb, input, ctx.session.user.id)
    ),

  duplicate: tenantMemberProcedure
    .input(duplicateQuestionPaperSchema)
    .mutation(({ ctx, input }) =>
      duplicateQuestionPaper(ctx.db, ctx.tenantDb, input, ctx.session.user.id)
    ),

  generateSets: tenantMemberProcedure
    .input(generatePaperSetsSchema)
    .mutation(({ ctx, input }) =>
      generatePaperSets(ctx.db, ctx.tenantDb, input, ctx.session.user.id)
    ),

  addQuestion: tenantMemberProcedure
    .input(addQuestionPaperQuestionSchema)
    .mutation(({ ctx, input }) =>
      addQuestionPaperQuestion(ctx.db, ctx.tenantDb, input, ctx.session.user.id)
    ),

  removeQuestion: tenantMemberProcedure
    .input(removeQuestionPaperQuestionSchema)
    .mutation(({ ctx, input }) =>
      removeQuestionPaperQuestion(ctx.tenantDb, input, ctx.session.user.id)
    ),

  bulkAssignQuestions: tenantMemberProcedure
    .input(bulkAssignQuestionsSchema)
    .mutation(({ ctx, input }) =>
      bulkAssignQuestions(ctx.db, ctx.tenantDb, input, ctx.session.user.id)
    ),

  bulkRemoveQuestions: tenantMemberProcedure
    .input(bulkRemoveQuestionsSchema)
    .mutation(({ ctx, input }) =>
      bulkRemoveQuestions(ctx.tenantDb, input, ctx.session.user.id)
    ),

  reorderQuestions: tenantMemberProcedure
    .input(reorderQuestionPaperQuestionsSchema)
    .mutation(({ ctx, input }) =>
      reorderQuestionPaperQuestions(ctx.tenantDb, input, ctx.session.user.id)
    ),

  upsertSection: tenantMemberProcedure
    .input(upsertQuestionPaperSectionSchema)
    .mutation(({ ctx, input }) =>
      upsertQuestionPaperSection(ctx.tenantDb, input, ctx.session.user.id)
    ),

  deleteSection: tenantMemberProcedure
    .input(deleteQuestionPaperSectionSchema)
    .mutation(({ ctx, input }) =>
      deleteQuestionPaperSection(ctx.tenantDb, input, ctx.session.user.id)
    ),

  upsertSubSection: tenantMemberProcedure
    .input(upsertQuestionPaperSubSectionSchema)
    .mutation(({ ctx, input }) =>
      upsertQuestionPaperSubSection(ctx.tenantDb, input)
    ),

  deleteSubSection: tenantMemberProcedure
    .input(deleteQuestionPaperSubSectionSchema)
    .mutation(({ ctx, input }) =>
      deleteQuestionPaperSubSection(ctx.tenantDb, input)
    ),

  upsertSubject: tenantMemberProcedure
    .input(upsertQuestionPaperSubjectSchema)
    .mutation(({ ctx, input }) =>
      upsertQuestionPaperSubject(ctx.db, ctx.tenantDb, input, ctx.session.user.id)
    ),

  deleteSubject: tenantMemberProcedure
    .input(deleteQuestionPaperSubjectSchema)
    .mutation(({ ctx, input }) =>
      deleteQuestionPaperSubject(ctx.tenantDb, input, ctx.session.user.id)
    ),

  upsertDistribution: tenantMemberProcedure
    .input(upsertQuestionPaperDistributionSchema)
    .mutation(({ ctx, input }) =>
      upsertQuestionPaperDistribution(ctx.db, ctx.tenantDb, input, ctx.session.user.id)
    ),

  deleteDistribution: tenantMemberProcedure
    .input(deleteQuestionPaperDistributionSchema)
    .mutation(({ ctx, input }) =>
      deleteQuestionPaperDistribution(ctx.tenantDb, input, ctx.session.user.id)
    ),
})


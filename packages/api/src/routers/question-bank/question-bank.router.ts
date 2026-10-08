import { createTRPCRouter, tenantMemberProcedure } from "../../trpc"
import {
  listQuestionBankSchema,
  getQuestionDetailsSchema,
  getQuestionBankStatsSchema,
  getFilterOptionsSchema,
  getClassDetailsSchema,
  getSubjectDetailsSchema,
} from "./question-bank.schema"
import {
  listQuestions,
  getQuestionStats,
  getQuestionDetails,
  getFilterOptions,
  getClassesWithStats,
  getClassDetails,
  getSubjectDetails,
} from "./question-bank.service"

export const questionBankRouter = createTRPCRouter({
  getClasses: tenantMemberProcedure.query(({ ctx }) =>
    getClassesWithStats(ctx.db)
  ),

  classDetails: tenantMemberProcedure
    .input(getClassDetailsSchema)
    .query(({ ctx, input }) => getClassDetails(ctx.db, input)),

  subjectDetails: tenantMemberProcedure
    .input(getSubjectDetailsSchema)
    .query(({ ctx, input }) => getSubjectDetails(ctx.db, input)),

  list: tenantMemberProcedure
    .input(listQuestionBankSchema)
    .query(({ ctx, input }) => listQuestions(ctx.db, input)),

  stats: tenantMemberProcedure
    .input(getQuestionBankStatsSchema.optional())
    .query(({ ctx, input }) => getQuestionStats(ctx.db, input ?? {})),

  byId: tenantMemberProcedure
    .input(getQuestionDetailsSchema)
    .query(({ ctx, input }) => getQuestionDetails(ctx.db, input)),

  filterOptions: tenantMemberProcedure
    .input(getFilterOptionsSchema.optional())
    .query(({ ctx, input }) => getFilterOptions(ctx.db, input ?? {})),
})



import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  getGlobalSummarySchema,
  getSubjectPipelineSchema,
  getMissingAttachmentsSchema,
  updateAttachmentUrlSchema,
  toggleQuestionActiveSchema,
  getQualityQueueSchema,
  resolveReportSchema,
} from "./content-tracker.schema"
import {
  getGlobalSummary,
  getSubjectPipeline,
  getMissingAttachments,
  updateAttachmentUrl,
  toggleQuestionActive,
  getQualityQueue,
  resolveReport,
} from "./content-tracker.service"

export const contentTrackerRouter = createTRPCRouter({
  getGlobalSummary: superAdminProcedure
    .input(getGlobalSummarySchema.optional())
    .query(({ ctx, input }) => getGlobalSummary(ctx.db, input ?? {})),

  getSubjectPipeline: superAdminProcedure
    .input(getSubjectPipelineSchema)
    .query(({ ctx, input }) => getSubjectPipeline(ctx.db, input)),

  getMissingAttachments: superAdminProcedure
    .input(getMissingAttachmentsSchema)
    .query(({ ctx, input }) => getMissingAttachments(ctx.db, input)),

  updateAttachmentUrl: superAdminProcedure
    .input(updateAttachmentUrlSchema)
    .mutation(({ ctx, input }) => updateAttachmentUrl(ctx.db, input)),

  toggleQuestionActive: superAdminProcedure
    .input(toggleQuestionActiveSchema)
    .mutation(({ ctx, input }) =>
      toggleQuestionActive(ctx.db, input, ctx.session?.user?.id),
    ),

  getQualityQueue: superAdminProcedure
    .input(getQualityQueueSchema)
    .query(({ ctx, input }) => getQualityQueue(ctx.db, input)),

  resolveReport: superAdminProcedure
    .input(resolveReportSchema)
    .mutation(({ ctx, input }) =>
      resolveReport(ctx.db, input, ctx.session?.user?.id),
    ),
})

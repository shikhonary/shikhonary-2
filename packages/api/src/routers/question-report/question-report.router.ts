import { db } from "@workspace/db/main"
import { createTRPCRouter, protectedProcedure } from "../../trpc"
import { createQuestionReportSchema } from "./question-report.schema"
import { createQuestionReport } from "./question-report.service"

export const questionReportRouter = createTRPCRouter({
  createReport: protectedProcedure
    .input(createQuestionReportSchema)
    .mutation(({ ctx, input }) =>
      createQuestionReport(db, input, ctx.session?.user?.id)
    ),
})

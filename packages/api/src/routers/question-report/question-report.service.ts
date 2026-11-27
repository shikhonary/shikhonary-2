import { TRPCError } from "@trpc/server"
import type { PrismaClient } from "@workspace/db/main"
import type { CreateQuestionReportInput } from "./question-report.schema"

export async function createQuestionReport(
  db: PrismaClient,
  input: CreateQuestionReportInput,
  userId?: string
) {
  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "রিপোর্ট করতে হলে লগইন করা আবশ্যক",
    })
  }

  // Check if this user already reported this question and it's still pending
  const existingPendingReport = await db.questionReport.findFirst({
    where: {
      entityType: input.entityType,
      entityId: input.entityId,
      reportedById: userId,
      status: "PENDING",
    },
  })

  if (existingPendingReport) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "আপনি ইতিমধ্যে এই প্রশ্নটিতে একটি রিপোর্ট জমা দিয়েছেন। আমাদের টিম এটি পর্যালোচনা করছে।",
    })
  }

  const report = await db.questionReport.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      reportType: input.reportType,
      description: input.description.trim(),
      status: "PENDING",
      reportedById: userId,
    },
  })

  return {
    success: true,
    reportId: report.id,
    message: "আপনার রিপোর্ট সফলভাবে জমা হয়েছে। ধন্যবাদ!",
  }
}

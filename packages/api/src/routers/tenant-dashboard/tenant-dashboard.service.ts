import type { TenantPrismaClient } from "@workspace/db/tenant"
import type { PrismaClient } from "@workspace/db/main"

export async function getTenantDashboardStats(
  tenantDb: TenantPrismaClient,
  db: PrismaClient,
  tenantId: string,
) {
  const [
    totalPapers,
    publishedPapers,
    draftPapers,
    totalQuestionsCount,
    recentPapers,
    classGroupedPapers,
    recentHistory,
    tenantWithSubscription,
  ] = await Promise.all([
    // 1. Total Question Papers
    tenantDb.questionPaper.count({
      where: { deletedAt: null },
    }),

    // 2. Published Papers
    tenantDb.questionPaper.count({
      where: { deletedAt: null, status: "Published" },
    }),

    // 3. Draft Papers
    tenantDb.questionPaper.count({
      where: { deletedAt: null, status: "Draft" },
    }),

    // 4. Total Questions across active papers
    tenantDb.questionPaperQuestion.count({
      where: {
        questionPaper: { deletedAt: null },
      },
    }),

    // 5. Recent 6 Question Papers
    tenantDb.questionPaper.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: {
        subjects: {
          select: {
            id: true,
            subjectName: true,
            subjectTotal: true,
          },
        },
        _count: {
          select: {
            questions: true,
            subjects: true,
          },
        },
      },
    }),

    // 6. Question papers grouped by class
    tenantDb.questionPaper.groupBy({
      by: ["classId", "className"],
      where: { deletedAt: null },
      _count: {
        id: true,
      },
    }),

    // 7. Recent 5 audit history logs
    tenantDb.questionPaperHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        questionPaper: {
          select: {
            id: true,
            title: true,
            examName: true,
          },
        },
      },
    }),

    // 8. Main DB: Tenant credit & subscription details
    db.tenant.findUnique({
      where: { id: tenantId },
      select: {
        creditBalance: true,
        totalCreditsUsed: true,
        subscription: {
          select: {
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            plan: {
              select: {
                name: true,
                displayName: true,
              },
            },
          },
        },
      },
    }),
  ])

  // Process class distribution list
  const classDistribution = (classGroupedPapers as Array<{ classId: string; className: string | null; _count: { id: number } }>).map((c) => ({
    classId: c.classId,
    className: c.className || "অনির্দিষ্ট",
    count: c._count.id,
  }))

  return {
    metrics: {
      totalPapers,
      publishedPapers,
      draftPapers,
      totalQuestions: totalQuestionsCount,
      creditBalance: tenantWithSubscription?.creditBalance ?? 0,
      lifetimeCreditsSpent: tenantWithSubscription?.totalCreditsUsed ?? 0,
    },
    recentPapers: recentPapers.map((p: any) => ({
      id: p.id,
      title: p.title,
      examName: p.examName,
      className: p.className,
      status: p.status,
      total: p.total,
      timeInMinutes: p.timeInMinutes,
      questionCount: p._count.questions,
      subjectCount: p._count.subjects,
      subjects: p.subjects,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    classDistribution,
    recentHistory: recentHistory.map((h: any) => ({
      id: h.id,
      action: h.action,
      actorType: h.actorType,
      createdAt: h.createdAt,
      paperTitle: h.questionPaper?.title || h.questionPaper?.examName || "প্রশ্নপত্র",
      paperId: h.questionPaper?.id || null,
    })),
    subscription: tenantWithSubscription?.subscription
      ? {
          status: tenantWithSubscription.subscription.status,
          planName: tenantWithSubscription.subscription.plan.displayName || tenantWithSubscription.subscription.plan.name,
          currentPeriodEnd: tenantWithSubscription.subscription.currentPeriodEnd,
        }
      : null,
  }
}

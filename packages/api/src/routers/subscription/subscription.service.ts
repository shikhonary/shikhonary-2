import type { PrismaClient } from "@workspace/db/main"
import { conflict, notFound } from "../../utils/errors"
import type {
  CancelSubscriptionInput,
  ChangeSubscriptionPlanInput,
  CreateSubscriptionInput,
  DeleteSubscriptionInput,
  GetSubscriptionByTenantInput,
  GetSubscriptionInput,
  ListSubscriptionsInput,
  RequestPlanChangeInput,
  UpdateSubscriptionInput,
} from "./subscription.schema"

export async function listSubscriptions(
  db: PrismaClient,
  input: ListSubscriptionsInput,
) {
  const where: any = {}
  if (input.tenantId) where.tenantId = input.tenantId
  if (input.planId) where.planId = input.planId
  if (input.status) where.status = input.status

  const subscriptions = await db.subscription.findMany({
    where,
    take: input.limit,
    skip: input.cursor ? 1 : 0,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      plan: true,
      tenant: {
        select: { id: true, name: true, slug: true },
      },
    },
  })

  const nextCursor =
    subscriptions.length === input.limit
      ? subscriptions[subscriptions.length - 1]?.id
      : undefined

  return { subscriptions, nextCursor }
}

export async function getSubscriptionById(
  db: PrismaClient,
  input: GetSubscriptionInput,
) {
  const subscription = await db.subscription.findUnique({
    where: { id: input.id },
    include: {
      plan: true,
      tenant: true,
      history: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })
  if (!subscription) throw notFound("Subscription")
  return subscription
}

export async function getSubscriptionByTenantId(
  db: PrismaClient,
  input: GetSubscriptionByTenantInput,
) {
  const subscription = await db.subscription.findUnique({
    where: { tenantId: input.tenantId },
    include: {
      plan: true,
      history: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })
  if (!subscription) throw notFound("Subscription for this tenant")
  return subscription
}

export async function createSubscription(
  db: PrismaClient,
  input: CreateSubscriptionInput,
) {
  const existing = await db.subscription.findUnique({
    where: { tenantId: input.tenantId },
  })
  if (existing) {
    throw conflict("Tenant already has an active subscription.")
  }

  const plan = await db.subscriptionPlan.findUnique({
    where: { id: input.planId },
  })
  if (!plan) throw notFound("Subscription Plan")

  return db.$transaction(async (tx) => {
    const sub = await tx.subscription.create({
      data: input,
      include: { plan: true },
    })

    await tx.subscriptionHistory.create({
      data: {
        subscriptionId: sub.id,
        event: "CREATED",
        toPlanId: plan.id,
        toStatus: sub.status,
        reason: "Initial subscription creation",
      },
    })

    return sub
  })
}

export async function updateSubscription(
  db: PrismaClient,
  input: UpdateSubscriptionInput,
) {
  const { id, ...data } = input
  const existing = await db.subscription.findUnique({
    where: { id },
  })
  if (!existing) throw notFound("Subscription")

  return db.subscription.update({
    where: { id },
    data,
    include: { plan: true },
  })
}

export async function changeSubscriptionPlan(
  db: PrismaClient,
  input: ChangeSubscriptionPlanInput,
) {
  const existing = await db.subscription.findUnique({
    where: { id: input.id },
    include: { plan: true },
  })
  if (!existing) throw notFound("Subscription")

  const newPlan = await db.subscriptionPlan.findUnique({
    where: { id: input.planId },
  })
  if (!newPlan) throw notFound("Subscription Plan")

  return db.$transaction(async (tx) => {
    const updated = await tx.subscription.update({
      where: { id: input.id },
      data: {
        planId: newPlan.id,
        billingCycle: input.billingCycle,
        pricePerMonth: newPlan.monthlyPriceBDT,
        pricePerYear: newPlan.yearlyPriceBDT,
      },
      include: { plan: true },
    })

    await tx.subscriptionHistory.create({
      data: {
        subscriptionId: updated.id,
        event: "PLAN_CHANGED",
        fromPlanId: existing.planId,
        toPlanId: newPlan.id,
        reason: input.reason || "Plan updated by admin",
      },
    })

    return updated
  })
}

export async function cancelSubscription(
  db: PrismaClient,
  input: CancelSubscriptionInput,
) {
  const existing = await db.subscription.findUnique({
    where: { id: input.id },
  })
  if (!existing) throw notFound("Subscription")

  return db.$transaction(async (tx) => {
    const updated = await tx.subscription.update({
      where: { id: input.id },
      data: {
        status: input.cancelAtPeriodEnd ? existing.status : "CANCELED",
        cancelAtPeriodEnd: input.cancelAtPeriodEnd,
        canceledAt: new Date(),
        cancelReason: input.cancelReason || null,
      },
    })

    await tx.subscriptionHistory.create({
      data: {
        subscriptionId: updated.id,
        event: "CANCELED",
        fromStatus: existing.status,
        toStatus: updated.status,
        reason: input.cancelReason || "Subscription canceled",
      },
    })

    return updated
  })
}

export async function deleteSubscription(
  db: PrismaClient,
  input: DeleteSubscriptionInput,
) {
  const existing = await db.subscription.findUnique({
    where: { id: input.id },
  })
  if (!existing) throw notFound("Subscription")

  await db.subscription.delete({ where: { id: input.id } })
  return { success: true }
}

export async function getSubscriptionStats(db: PrismaClient) {
  const [total, active, trialing, pastDue, canceled] = await Promise.all([
    db.subscription.count(),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.subscription.count({ where: { status: "TRIALING" } }),
    db.subscription.count({ where: { status: "PAST_DUE" } }),
    db.subscription.count({ where: { status: "CANCELED" } }),
  ])

  return { total, active, trialing, pastDue, canceled }
}

export async function getTenantSubscriptionDetails(
  db: PrismaClient,
  tenantId: string,
  tenantDb?: any
) {
  let subscription = await db.subscription.findUnique({
    where: { tenantId },
    include: {
      plan: true,
      history: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })

  // If tenant has no subscription, auto-assign teacher plan (or active cheapest)
  if (!subscription) {
    const defaultPlan =
      (await db.subscriptionPlan.findFirst({
        where: { name: "teacher", isActive: true },
      })) ||
      (await db.subscriptionPlan.findFirst({
        where: { isActive: true },
        orderBy: { monthlyPriceBDT: "asc" },
      }))

    if (defaultPlan) {
      const now = new Date()
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
      subscription = await db.subscription.create({
        data: {
          tenantId,
          planId: defaultPlan.id,
          status: "ACTIVE",
          billingCycle: "YEARLY",
          currentPeriodStart: now,
          currentPeriodEnd: endOfYear,
          pricePerMonth: defaultPlan.monthlyPriceBDT,
          pricePerYear: defaultPlan.yearlyPriceBDT,
        },
        include: {
          plan: true,
          history: true,
        },
      })
    }
  }

  // Calculate remaining days
  const now = new Date()
  const currentPeriodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : now
  const remainingDays = Math.max(
    0,
    Math.ceil((currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  )

  const isYearly = subscription?.billingCycle === "YEARLY"
  const qbFeatures = (subscription?.plan?.features as any)?.questionPaperBuilder || {}

  // Resolve plan limits
  const paperLimit = isYearly
    ? (qbFeatures.paperLimitYearly ?? subscription?.plan.defaultExamLimit ?? 600)
    : (qbFeatures.paperLimitMonthly ?? 50)

  const aiChatbotLimit = isYearly
    ? (qbFeatures.aiChatbotPaperLimitYearly ?? 60)
    : (qbFeatures.aiChatbotPaperLimitMonthly ?? 5)

  const omrLimit = isYearly
    ? (qbFeatures.omrSheetsYearly ?? 1200)
    : (qbFeatures.omrSheetsMonthly ?? 100)

  const onlineExamLimit = isYearly
    ? (qbFeatures.onlineExamsYearly ?? 60)
    : (qbFeatures.onlineExamsMonthly ?? 5)

  const creditRefreshQuota = isYearly
    ? (qbFeatures.creditsYearly ?? 6000)
    : (qbFeatures.creditsMonthly ?? 500)

  // Query actual QuestionPaper usage if tenantDb is available
  let papersUsed = 0
  let aiChatbotPapersUsed = 0
  if (tenantDb?.questionPaper) {
    try {
      const periodStart = subscription?.currentPeriodStart ?? now
      papersUsed = await tenantDb.questionPaper.count({
        where: {
          createdAt: { gte: periodStart },
          deletedAt: null,
        },
      })
    } catch {
      papersUsed = 0
    }
  }

  // Query tenant credit balance & total usage from main db
  const [tenantRecord, lastCreditTransaction] = await Promise.all([
    db.tenant.findUnique({
      where: { id: tenantId },
      select: { creditBalance: true, totalCreditsUsed: true },
    }),
    db.creditTransaction.findFirst({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      select: { balance: true },
    }),
  ])

  const creditBalance =
    tenantRecord?.creditBalance ?? lastCreditTransaction?.balance ?? subscription?.plan.defaultCreditLimit ?? 500
  const totalCreditsUsed = tenantRecord?.totalCreditsUsed ?? 0

  // Estimated / Mocked counts for upcoming features (OMR & Online Exams)
  const omrSheetsUsed = 0
  const onlineExamsUsed = 0

  const buildQuota = (used: number, limit: number, unit: string) => ({
    used,
    limit,
    remaining: Math.max(0, limit - used),
    percentage: limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0,
    unit,
  })

  return {
    subscription,
    remainingDays,
    quotas: {
      papers: buildQuota(papersUsed, paperLimit, "টি"),
      aiChatbotPapers: buildQuota(aiChatbotPapersUsed, aiChatbotLimit, "টি"),
      omrSheets: buildQuota(omrSheetsUsed, omrLimit, "টি খাতা"),
      onlineExams: buildQuota(onlineExamsUsed, onlineExamLimit, "টি পরীক্ষা"),
      credits: {
        balance: creditBalance,
        usedTotal: totalCreditsUsed,
        monthlyRefresh: creditRefreshQuota,
      },
    },
    usage: {
      teachers: 1,
      students: 0,
      exams: papersUsed,
      storageMB: 25,
      credits: creditBalance,
    },
  }
}

export async function getTenantInvoices(db: PrismaClient, tenantId: string) {
  return db.invoice.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  })
}

export async function tenantChangeSubscriptionPlan(
  db: PrismaClient,
  tenantId: string,
  userId: string,
  input: RequestPlanChangeInput
) {
  const subscription = await db.subscription.findUnique({
    where: { tenantId },
    include: { plan: true },
  })
  if (!subscription) throw notFound("Subscription for this tenant")

  const newPlan = await db.subscriptionPlan.findUnique({
    where: { id: input.planId },
  })
  if (!newPlan) throw notFound("Subscription Plan")

  return db.$transaction(async (tx) => {
    const isYearly = input.billingCycle === "YEARLY"
    const now = new Date()
    const periodEnd = isYearly
      ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
      : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

    const updated = await tx.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: newPlan.id,
        billingCycle: input.billingCycle,
        pricePerMonth: newPlan.monthlyPriceBDT,
        pricePerYear: newPlan.yearlyPriceBDT,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      include: { plan: true },
    })

    await tx.subscriptionHistory.create({
      data: {
        subscriptionId: updated.id,
        event: "PLAN_CHANGED",
        fromPlanId: subscription.planId,
        toPlanId: newPlan.id,
        createdBy: userId,
        reason: input.reason || "Plan updated by tenant admin",
      },
    })

    // ── Auto-Trigger Credit Allocation ──────────────────────────────────
    const qbFeatures = (newPlan.features as any)?.questionPaperBuilder || {}
    const creditsToAdd = isYearly
      ? (qbFeatures.creditsYearly ?? newPlan.defaultCreditLimit * 12)
      : (qbFeatures.creditsMonthly ?? newPlan.defaultCreditLimit)

    const tenant = await tx.tenant.findUnique({
      where: { id: tenantId },
      select: { creditBalance: true },
    })

    const newBalance = (tenant?.creditBalance || 0) + creditsToAdd

    await tx.tenant.update({
      where: { id: tenantId },
      data: { creditBalance: newBalance },
    })

    await tx.creditTransaction.create({
      data: {
        tenantId,
        type: "SUBSCRIPTION_REFRESH",
        amount: creditsToAdd,
        balance: newBalance,
        description: `${newPlan.displayName} (${isYearly ? "বার্ষিক" : "মাসিক"}) সাবস্ক্রিপশন বাবদ ${creditsToAdd} ক্রেডিট স্বয়ংক্রিয়ভাবে যোগ হয়েছে`,
        metadata: {
          planId: newPlan.id,
          planName: newPlan.name,
          billingCycle: input.billingCycle,
          creditsAdded: creditsToAdd,
        },
      },
    })

    return updated
  })
}


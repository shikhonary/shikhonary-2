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

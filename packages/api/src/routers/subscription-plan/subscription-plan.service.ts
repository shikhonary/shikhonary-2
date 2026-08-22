import type { PrismaClient } from "@workspace/db/main"
import { conflict, notFound } from "../../utils/errors"
import type {
  CreateSubscriptionPlanInput,
  DeleteSubscriptionPlanInput,
  GetSubscriptionPlanInput,
  ListSubscriptionPlansInput,
  UpdateSubscriptionPlanInput,
} from "./subscription-plan.schema"

export async function listSubscriptionPlans(
  db: PrismaClient,
  input: ListSubscriptionPlansInput,
) {
  const where: any = {}
  if (input.isActive !== undefined) where.isActive = input.isActive

  const plans = await db.subscriptionPlan.findMany({
    where,
    take: input.limit,
    skip: input.cursor ? 1 : 0,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    orderBy: { monthlyPriceBDT: "asc" },
  })

  const nextCursor =
    plans.length === input.limit ? plans[plans.length - 1]?.id : undefined

  return { plans, nextCursor }
}

export async function getSubscriptionPlanById(
  db: PrismaClient,
  input: GetSubscriptionPlanInput,
) {
  const plan = await db.subscriptionPlan.findUnique({
    where: { id: input.id },
    include: {
      _count: { select: { subscriptions: true } },
    },
  })
  if (!plan) throw notFound("Subscription Plan")
  return plan
}

export async function createSubscriptionPlan(
  db: PrismaClient,
  input: CreateSubscriptionPlanInput,
) {
  const existing = await db.subscriptionPlan.findUnique({
    where: { name: input.name },
  })
  if (existing) {
    throw conflict(`Subscription plan with name "${input.name}" already exists.`)
  }

  const { features, ...rest } = input
  return db.subscriptionPlan.create({
    data: {
      ...rest,
      features: (features as any) ?? {},
    },
  })
}

export async function updateSubscriptionPlan(
  db: PrismaClient,
  input: UpdateSubscriptionPlanInput,
) {
  const { id, features, ...data } = input
  const existing = await db.subscriptionPlan.findUnique({
    where: { id },
  })
  if (!existing) throw notFound("Subscription Plan")

  return db.subscriptionPlan.update({
    where: { id },
    data: {
      ...data,
      ...(features !== undefined ? { features: features as any } : {}),
    },
  })
}

export async function deleteSubscriptionPlan(
  db: PrismaClient,
  input: DeleteSubscriptionPlanInput,
) {
  const existing = await db.subscriptionPlan.findUnique({
    where: { id: input.id },
    include: { _count: { select: { subscriptions: true } } },
  })
  if (!existing) throw notFound("Subscription Plan")

  if (existing._count.subscriptions > 0) {
    throw conflict("Cannot delete a subscription plan that has active subscriptions.")
  }

  await db.subscriptionPlan.delete({ where: { id: input.id } })
  return { success: true }
}

export async function listSelectionSubscriptionPlans(db: PrismaClient) {
  return db.subscriptionPlan.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      displayName: true,
      description: true,
      monthlyPriceBDT: true,
      yearlyPriceBDT: true,
      isPopular: true,
      defaultStudentLimit: true,
      defaultStaffLimit: true,
      defaultCertificateLimit: true,
      defaultStorageLimit: true,
    },
    orderBy: { monthlyPriceBDT: "asc" },
  })
}

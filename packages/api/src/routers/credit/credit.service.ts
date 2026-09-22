import type { PrismaClient } from "@workspace/db/main"
import { notFound } from "../../utils/errors"
import type { EstimatePaperCostInput, ListCreditTransactionsInput } from "./credit.schema"

export async function getTenantCreditBalance(db: PrismaClient, tenantId: string) {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
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
              defaultCreditLimit: true,
            },
          },
        },
      },
    },
  })

  if (!tenant) throw notFound("Tenant")

  return {
    tenantId: tenant.id,
    creditBalance: tenant.creditBalance,
    totalCreditsUsed: tenant.totalCreditsUsed,
    subscriptionStatus: tenant.subscription?.status ?? "INACTIVE",
    planName: tenant.subscription?.plan?.displayName ?? "Free Plan",
    defaultCreditLimit: tenant.subscription?.plan?.defaultCreditLimit ?? 0,
    currentPeriodEnd: tenant.subscription?.currentPeriodEnd ?? null,
  }
}

export async function listTenantCreditTransactions(
  db: PrismaClient,
  tenantId: string,
  input: ListCreditTransactionsInput
) {
  const where: any = { tenantId }
  if (input.type) {
    where.type = input.type
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [transactions, totalItems] = await Promise.all([
    db.creditTransaction.findMany({
      where,
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    db.creditTransaction.count({ where }),
  ])

  const nextCursor =
    transactions.length === limit ? transactions[transactions.length - 1]?.id : undefined

  return {
    transactions,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
    nextCursor,
  }
}

export async function getQuestionTypePricing(db: PrismaClient) {
  return db.questionType.findMany({
    where: { isActive: true },
    select: {
      id: true,
      nameEn: true,
      nameBn: true,
      label: true,
      mark: true,
      creditCost: true,
      position: true,
    },
    orderBy: { position: "asc" },
  })
}

export async function estimatePaperCost(
  db: PrismaClient,
  input: EstimatePaperCostInput
) {
  const typeIds = input.questionTypeCounts.map((q) => q.questionTypeId)
  const questionTypes = await db.questionType.findMany({
    where: { id: { in: typeIds } },
    select: { id: true, nameEn: true, nameBn: true, creditCost: true },
  })

  const typeMap = new Map(questionTypes.map((qt) => [qt.id, qt]))
  let totalCredits = 0

  const breakdown = input.questionTypeCounts.map((item) => {
    const qt = typeMap.get(item.questionTypeId)
    const costPerUnit = (qt as any)?.creditCost ?? 1
    const subtotal = item.count * costPerUnit
    totalCredits += subtotal

    return {
      questionTypeId: item.questionTypeId,
      nameEn: qt?.nameEn ?? "Unknown",
      nameBn: qt?.nameBn ?? "অজানা",
      count: item.count,
      costPerUnit,
      subtotal,
    }
  })

  return {
    totalCredits,
    breakdown,
  }
}

import { TRPCError } from "@trpc/server"
import type { PrismaClient } from "@workspace/db/main"

export interface ChargeCreditsParams {
  tenantId: string
  amount: number
  description: string
  metadata?: Record<string, any>
}

export interface RefundCreditsParams {
  tenantId: string
  amount: number
  description: string
  metadata?: Record<string, any>
}

/**
 * Fetch the credit cost of a given question type. Defaults to 1 if not found.
 */
export async function getQuestionTypeCreditCost(
  db: PrismaClient,
  questionTypeId?: string | null
): Promise<number> {
  if (!questionTypeId) return 1

  const qType = await db.questionType.findUnique({
    where: { id: questionTypeId },
    select: { creditCost: true },
  })

  return (qType as any)?.creditCost ?? 1
}

/**
 * Batch resolve credit costs for multiple question type IDs.
 */
export async function getQuestionTypesCreditCosts(
  db: PrismaClient,
  questionTypeIds: string[]
): Promise<Map<string, number>> {
  const uniqueIds = Array.from(new Set(questionTypeIds.filter(Boolean)))
  if (uniqueIds.length === 0) return new Map()

  const qTypes = await db.questionType.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, creditCost: true },
  })

  const costMap = new Map<string, number>()
  for (const qt of qTypes) {
    costMap.set(qt.id, (qt as any).creditCost ?? 1)
  }
  return costMap
}

/**
 * Charge credits atomically from tenant balance.
 * Throws TRPCError BAD_REQUEST if tenant has insufficient balance.
 */
export async function chargeTenantCredits(
  db: PrismaClient,
  params: ChargeCreditsParams
): Promise<{ success: boolean; newBalance: number }> {
  if (params.amount <= 0) return { success: true, newBalance: 0 }

  return db.$transaction(async (tx) => {
    const tenant = await tx.tenant.findUnique({
      where: { id: params.tenantId },
      select: { id: true, creditBalance: true, totalCreditsUsed: true, name: true },
    })

    if (!tenant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tenant not found.",
      })
    }

    if (tenant.creditBalance < params.amount) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Insufficient credit balance. You need ${params.amount} credit(s), but your current balance is ${tenant.creditBalance} credit(s). Please upgrade your subscription or contact administration.`,
      })
    }

    const newBalance = tenant.creditBalance - params.amount
    const newTotalUsed = tenant.totalCreditsUsed + params.amount

    await tx.tenant.update({
      where: { id: params.tenantId },
      data: {
        creditBalance: newBalance,
        totalCreditsUsed: newTotalUsed,
      },
    })

    await tx.creditTransaction.create({
      data: {
        tenantId: params.tenantId,
        type: "USAGE",
        amount: -params.amount,
        balance: newBalance,
        description: params.description,
        metadata: (params.metadata ?? {}) as any,
      },
    })

    return { success: true, newBalance }
  })
}

/**
 * Refund credits atomically to tenant balance when questions are removed.
 */
export async function refundTenantCredits(
  db: PrismaClient,
  params: RefundCreditsParams
): Promise<{ success: boolean; newBalance: number }> {
  if (params.amount <= 0) return { success: true, newBalance: 0 }

  return db.$transaction(async (tx) => {
    const tenant = await tx.tenant.findUnique({
      where: { id: params.tenantId },
      select: { id: true, creditBalance: true, totalCreditsUsed: true },
    })

    if (!tenant) return { success: false, newBalance: 0 }

    const newBalance = tenant.creditBalance + params.amount
    const newTotalUsed = Math.max(0, tenant.totalCreditsUsed - params.amount)

    await tx.tenant.update({
      where: { id: params.tenantId },
      data: {
        creditBalance: newBalance,
        totalCreditsUsed: newTotalUsed,
      },
    })

    await tx.creditTransaction.create({
      data: {
        tenantId: params.tenantId,
        type: "REFUND",
        amount: params.amount,
        balance: newBalance,
        description: params.description,
        metadata: (params.metadata ?? {}) as any,
      },
    })

    return { success: true, newBalance }
  })
}

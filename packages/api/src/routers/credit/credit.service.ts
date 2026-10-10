import type { PrismaClient } from "@workspace/db/main"
import { notFound } from "../../utils/errors"
import type {
  CreditPackItem,
  EstimatePaperCostInput,
  ListCreditTransactionsInput,
} from "./credit.schema"

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

export async function listCreditPacks(db?: PrismaClient): Promise<CreditPackItem[]> {
  if (db && (db as any).creditPack) {
    try {
      const dbPacks = await (db as any).creditPack.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      })
      if (dbPacks.length > 0) {
        return dbPacks.map((p: any) => ({
          id: p.id,
          name: p.name,
          displayName: p.displayName,
          description: p.description,
          credits: p.credits,
          bonusCredits: p.bonusCredits,
          totalCredits: p.credits + p.bonusCredits,
          priceBDT: p.priceBDT,
          isPopular: p.isPopular,
          badge: p.bonusCredits > 0 ? `+${p.bonusCredits} বোনাস` : undefined,
        }))
      }
    } catch {
      // Fallback to static definitions
    }
  }

  const { DEFAULT_CREDIT_PACKS } = await import("./credit.schema")
  return DEFAULT_CREDIT_PACKS
}

export async function purchaseCreditPack(
  db: PrismaClient,
  tenantId: string,
  input: { packId: string; paymentMethod?: string; paymentReference?: string }
) {
  const packs = await listCreditPacks(db)
  const pack = packs.find((p: CreditPackItem) => p.id === input.packId || p.name === input.packId)
  if (!pack) {
    throw notFound("Credit pack")
  }

  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true, creditBalance: true },
  })
  if (!tenant) throw notFound("Tenant")

  const totalCreditsToAdd = pack.totalCredits
  const newBalance = tenant.creditBalance + totalCreditsToAdd

  return db.$transaction(async (tx) => {
    // 1. Update Tenant balance
    await tx.tenant.update({
      where: { id: tenantId },
      data: { creditBalance: newBalance },
    })

    // 2. Create Credit Transaction
    const txRecord = await tx.creditTransaction.create({
      data: {
        tenantId,
        type: "PURCHASE",
        amount: totalCreditsToAdd,
        balance: newBalance,
        description: `${pack.displayName} (${totalCreditsToAdd} ক্রেডিট) ক্রয় সফল হয়েছে`,
        metadata: {
          packId: pack.id,
          packName: pack.name,
          baseCredits: pack.credits,
          bonusCredits: pack.bonusCredits,
          priceBDT: pack.priceBDT,
          paymentMethod: input.paymentMethod || "BKASH",
          paymentReference: input.paymentReference || null,
        },
      },
    })

    // 3. Create Invoice Record
    const now = new Date()
    const invoiceNumber = `INV-CR-${Date.now().toString().slice(-6)}`
    await tx.invoice.create({
      data: {
        tenantId,
        invoiceNumber,
        amount: pack.priceBDT,
        currency: "BDT",
        status: "PAID",
        periodStart: now,
        periodEnd: now,
        paidAt: now,
        paymentMethod: input.paymentMethod || "BKASH",
        paymentReference: input.paymentReference || null,
        description: `ক্রেডিট টপ-আপ: ${pack.displayName} (${totalCreditsToAdd} ক্রেডিট)`,
      },
    })

    return {
      success: true,
      pack,
      creditsAdded: totalCreditsToAdd,
      newBalance,
      transactionId: txRecord.id,
    }
  })
}

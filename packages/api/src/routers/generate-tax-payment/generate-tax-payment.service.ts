import type { TenantPrismaClient } from "@workspace/db/tenant"
import { notFound } from "../../utils/errors"
import type {
  ExecuteTaxGenerationInput,
  GenerationStatsInput,
  PreviewTaxGenerationInput,
} from "./generate-tax-payment.schema"

export async function previewTaxGeneration(
  tenantDb: TenantPrismaClient,
  input: PreviewTaxGenerationInput,
) {
  // Verify fiscal year exists
  const fiscalYear = await tenantDb.fiscalYear.findUnique({
    where: { id: input.fiscalYearId },
  })
  if (!fiscalYear) throw notFound("FiscalYear")

  const where: any = {}

  if (input.wardId && input.wardId !== "all") {
    where.wardId = input.wardId
  }

  if (input.search && input.search.trim() !== "") {
    const query = input.search.trim()
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { holding: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
      { village: { contains: query, mode: "insensitive" } },
    ]
  }

  // Fetch all taxpayers matching criteria
  const taxPayers = await tenantDb.taxPayer.findMany({
    where,
    include: {
      ward: true,
    },
    orderBy: [{ ward: { name: "asc" } }, { holding: "asc" }],
  })

  // Fetch existing payments for this fiscal year
  const existingPayments = await tenantDb.taxPayment.findMany({
    where: {
      fiscalYearId: input.fiscalYearId,
      taxPayerId: { in: taxPayers.map((tp) => tp.id) },
    },
    select: {
      taxPayerId: true,
      amount: true,
      receiptNo: true,
      paymentDate: true,
    },
  })

  const existingMap = new Map(
    existingPayments.map((p) => [p.taxPayerId, p]),
  )

  let totalTaxPayers = taxPayers.length
  let alreadyGeneratedCount = 0
  let pendingCount = 0
  let totalEstimatedAmount = 0
  let alreadyCollectedAmount = 0

  const items = taxPayers.map((tp) => {
    const existingPayment = existingMap.get(tp.id)
    const alreadyGenerated = !!existingPayment

    if (alreadyGenerated) {
      alreadyGeneratedCount++
      alreadyCollectedAmount += existingPayment.amount
    } else {
      pendingCount++
      totalEstimatedAmount += tp.tax
    }

    return {
      id: tp.id,
      name: tp.name,
      fatherName: tp.fatherName,
      holding: tp.holding,
      phone: tp.phone,
      village: tp.village,
      wardId: tp.wardId,
      wardName: tp.ward?.nameBn || tp.ward?.name || "N/A",
      annualTax: tp.tax,
      alreadyGenerated,
      existingReceiptNo: existingPayment?.receiptNo ?? null,
      existingPaymentDate: existingPayment?.paymentDate ?? null,
    }
  })

  return {
    fiscalYear,
    summary: {
      totalTaxPayers,
      alreadyGeneratedCount,
      pendingCount,
      totalEstimatedAmount,
      alreadyCollectedAmount,
    },
    items,
  }
}

export async function executeTaxGeneration(
  tenantDb: TenantPrismaClient,
  input: ExecuteTaxGenerationInput,
) {
  // 1. Check Fiscal Year
  const fiscalYear = await tenantDb.fiscalYear.findUnique({
    where: { id: input.fiscalYearId },
  })
  if (!fiscalYear) throw notFound("FiscalYear")

  // 2. Find existing payments to avoid duplicate creation
  const existingPayments = await tenantDb.taxPayment.findMany({
    where: {
      fiscalYearId: input.fiscalYearId,
      taxPayerId: { in: input.taxPayerIds },
    },
    select: { taxPayerId: true },
  })

  const existingSet = new Set(existingPayments.map((p) => p.taxPayerId))
  const eligibleIds = input.taxPayerIds.filter((id) => !existingSet.has(id))

  if (eligibleIds.length === 0) {
    return {
      success: true,
      generatedCount: 0,
      skippedCount: input.taxPayerIds.length,
      totalAmount: 0,
    }
  }

  // 3. Fetch tax payers detail for eligible IDs
  const taxPayers = await tenantDb.taxPayer.findMany({
    where: {
      id: { in: eligibleIds },
    },
    select: {
      id: true,
      tax: true,
    },
  })

  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const paymentDate = new Date()

  let totalAmount = 0
  const recordsToCreate = taxPayers
    .filter((tp) => tp.tax > 0)
    .map((tp, idx) => {
      totalAmount += tp.tax
      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      const receiptNo = `TR-${todayStr}-${randomSuffix}-${idx + 1}`
      return {
        taxPayerId: tp.id,
        fiscalYearId: input.fiscalYearId,
        amount: tp.tax,
        receiptNo,
        paymentDate,
        paymentMethod: null,
        note: input.note || "কর ধার্য (অপরিশোধিত)",
      }
    })

  if (recordsToCreate.length > 0) {
    await tenantDb.taxPayment.createMany({
      data: recordsToCreate,
    })
  }

  const generatedCount = recordsToCreate.length
  const skippedCount = input.taxPayerIds.length - generatedCount

  return {
    success: true,
    generatedCount,
    skippedCount,
    totalAmount,
  }
}

export async function getGenerationStats(
  tenantDb: TenantPrismaClient,
  input: GenerationStatsInput,
) {
  let fiscalYearId = input.fiscalYearId

  if (!fiscalYearId) {
    const currentFY = await tenantDb.fiscalYear.findFirst({
      where: { isCurrent: true },
    })
    fiscalYearId = currentFY?.id
  }

  if (!fiscalYearId) {
    return {
      totalTaxPayers: 0,
      generatedCount: 0,
      pendingCount: 0,
      totalAmountCollected: 0,
      totalAmountPending: 0,
    }
  }

  const [totalTaxPayers, totalTaxAmountAgg, generatedPayments] = await Promise.all([
    tenantDb.taxPayer.count(),
    tenantDb.taxPayer.aggregate({ _sum: { tax: true } }),
    tenantDb.taxPayment.findMany({
      where: { fiscalYearId },
      select: { amount: true },
    }),
  ])

  const generatedCount = generatedPayments.length
  const totalAmountCollected = generatedPayments.reduce((acc, p) => acc + p.amount, 0)
  const pendingCount = Math.max(0, totalTaxPayers - generatedCount)
  const totalTaxAmount = totalTaxAmountAgg._sum.tax ?? 0
  const totalAmountPending = Math.max(0, totalTaxAmount - totalAmountCollected)

  return {
    totalTaxPayers,
    generatedCount,
    pendingCount,
    totalAmountCollected,
    totalAmountPending,
  }
}

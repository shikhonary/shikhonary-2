import type { TenantPrismaClient } from "@workspace/db/tenant"
import { notFound } from "../../utils/errors"
import type {
  CreateTaxPaymentInput,
  DeleteTaxPaymentInput,
  GetPaymentByReceiptNoInput,
  GetTaxPaymentInput,
  ListTaxPaymentsInput,
  TaxPaymentStatsInput,
  UpdateTaxPaymentInput,
} from "./tax-payment.schema"

export async function listTaxPayments(
  tenantDb: TenantPrismaClient,
  input: ListTaxPaymentsInput,
) {
  const where: any = {}

  if (input.status === "paid") {
    where.paymentMethod = { not: null }
  } else if (input.status === "unpaid") {
    where.paymentMethod = null
  }

  if (input.search && input.search.trim() !== "") {
    const query = input.search.trim()
    where.OR = [
      { receiptNo: { contains: query, mode: "insensitive" } },
      { note: { contains: query, mode: "insensitive" } },
      { taxPayer: { name: { contains: query, mode: "insensitive" } } },
      { taxPayer: { holding: { contains: query, mode: "insensitive" } } },
      { taxPayer: { phone: { contains: query, mode: "insensitive" } } },
      { taxPayer: { village: { contains: query, mode: "insensitive" } } },
      { taxPayer: { nid: { contains: query, mode: "insensitive" } } },
    ]
  }

  if (input.taxPayerId) {
    where.taxPayerId = input.taxPayerId
  }

  if (input.fiscalYearId) {
    where.fiscalYearId = input.fiscalYearId
  }

  if (input.wardId) {
    where.taxPayer = { ...where.taxPayer, wardId: input.wardId }
  }

  if (input.startDate || input.endDate) {
    where.paymentDate = {}
    if (input.startDate) where.paymentDate.gte = input.startDate
    if (input.endDate) where.paymentDate.lte = input.endDate
  }

  let orderBy: any = { createdAt: "desc" }
  if (input.sort) {
    switch (input.sort) {
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "amount_asc":
        orderBy = { amount: "asc" }
        break
      case "amount_desc":
        orderBy = { amount: "desc" }
        break
      default:
        orderBy = { createdAt: "desc" }
    }
  }

  const payments = await tenantDb.taxPayment.findMany({
    where,
    include: {
      taxPayer: { include: { ward: true } },
      fiscalYear: true,
    },
    take: input.limit,
    skip: input.cursor ? 1 : 0,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    orderBy,
  })

  const nextCursor =
    payments.length === input.limit
      ? payments[payments.length - 1]?.id
      : undefined

  return { payments, nextCursor }
}

export async function getTaxPaymentById(
  tenantDb: TenantPrismaClient,
  input: GetTaxPaymentInput,
) {
  const payment = await tenantDb.taxPayment.findUnique({
    where: { id: input.id },
    include: {
      taxPayer: { include: { ward: true } },
      fiscalYear: true,
    },
  })
  if (!payment) throw notFound("TaxPayment")
  return payment
}

export async function getPaymentByReceiptNo(
  tenantDb: TenantPrismaClient,
  input: GetPaymentByReceiptNoInput,
) {
  const payment = await tenantDb.taxPayment.findFirst({
    where: { receiptNo: input.receiptNo },
    include: {
      taxPayer: { include: { ward: true } },
      fiscalYear: true,
    },
  })
  if (!payment) throw notFound("TaxPayment")
  return payment
}

export async function getTaxPaymentStats(
  tenantDb: TenantPrismaClient,
  input: TaxPaymentStatsInput,
) {
  const baseWhere: any = {}
  if (input.fiscalYearId) {
    baseWhere.fiscalYearId = input.fiscalYearId
  }
  if (input.wardId) {
    baseWhere.taxPayer = { wardId: input.wardId }
  }

  const paidWhere = { ...baseWhere, paymentMethod: { not: null } }
  const unpaidWhere = { ...baseWhere, paymentMethod: null }

  const [
    totalCount,
    paidCount,
    unpaidCount,
    paidAggregate,
    unpaidAggregate,
    methodDistributionRaw,
  ] = await Promise.all([
    tenantDb.taxPayment.count({ where: baseWhere }),
    tenantDb.taxPayment.count({ where: paidWhere }),
    tenantDb.taxPayment.count({ where: unpaidWhere }),
    tenantDb.taxPayment.aggregate({
      where: paidWhere,
      _sum: { amount: true },
      _avg: { amount: true },
    }),
    tenantDb.taxPayment.aggregate({
      where: unpaidWhere,
      _sum: { amount: true },
    }),
    tenantDb.taxPayment.groupBy({
      by: ["paymentMethod"],
      where: paidWhere,
      _count: { id: true },
      _sum: { amount: true },
    }),
  ])

  const methodDistribution = methodDistributionRaw.map((item) => ({
    paymentMethod: item.paymentMethod,
    count: item._count.id,
    totalAmount: item._sum.amount ?? 0,
  }))

  return {
    totalCount,
    paidCount,
    unpaidCount,
    totalCollectedAmount: paidAggregate._sum.amount ?? 0,
    totalPendingAmount: unpaidAggregate._sum.amount ?? 0,
    averagePaymentAmount: Math.round(paidAggregate._avg.amount ?? 0),
    methodDistribution,
  }
}

export async function createTaxPayment(
  tenantDb: TenantPrismaClient,
  input: CreateTaxPaymentInput,
) {
  // Verify the taxpayer exists
  const taxPayer = await tenantDb.taxPayer.findUnique({
    where: { id: input.taxPayerId },
    select: { id: true },
  })
  if (!taxPayer) throw notFound("TaxPayer")

  // Verify the fiscal year exists
  const fiscalYear = await tenantDb.fiscalYear.findUnique({
    where: { id: input.fiscalYearId },
    select: { id: true },
  })
  if (!fiscalYear) throw notFound("FiscalYear")

  // Generate receiptNo if not provided
  let receiptNo = input.receiptNo
  if (!receiptNo) {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    receiptNo = `TR-${todayStr}-${randomSuffix}`
  }

  const paymentMethod = input.paymentMethod || "নগদ"
  const paymentDate = input.paymentDate || new Date()

  // Check if an unpaid tax demand (paymentMethod: null) already exists for this taxpayer & fiscal year
  const existingUnpaid = await tenantDb.taxPayment.findFirst({
    where: {
      taxPayerId: input.taxPayerId,
      fiscalYearId: input.fiscalYearId,
      paymentMethod: null,
    },
  })

  if (existingUnpaid) {
    // Update existing unpaid demand record to mark it as PAID!
    return tenantDb.taxPayment.update({
      where: { id: existingUnpaid.id },
      data: {
        amount: input.amount,
        receiptNo: receiptNo || existingUnpaid.receiptNo,
        paymentDate,
        paymentMethod,
        note: input.note || "কর পরিশোধিত",
      },
      include: {
        taxPayer: { include: { ward: true } },
        fiscalYear: true,
      },
    })
  }

  return tenantDb.taxPayment.create({
    data: {
      ...input,
      paymentMethod,
      paymentDate,
      receiptNo,
    },
    include: {
      taxPayer: { include: { ward: true } },
      fiscalYear: true,
    },
  })
}

export async function updateTaxPayment(
  tenantDb: TenantPrismaClient,
  input: UpdateTaxPaymentInput,
) {
  const { id, ...data } = input
  const existing = await tenantDb.taxPayment.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw notFound("TaxPayment")

  return tenantDb.taxPayment.update({
    where: { id },
    data,
    include: {
      taxPayer: { include: { ward: true } },
      fiscalYear: true,
    },
  })
}

export async function deleteTaxPayment(
  tenantDb: TenantPrismaClient,
  input: DeleteTaxPaymentInput,
) {
  const existing = await tenantDb.taxPayment.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("TaxPayment")

  await tenantDb.taxPayment.delete({ where: { id: input.id } })
  return { success: true }
}

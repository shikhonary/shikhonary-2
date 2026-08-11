import type { TenantPrismaClient } from "@workspace/db/tenant"
import { TenantPrisma } from "@workspace/db/tenant"
import { notFound } from "../../utils/errors"
import type {
  BulkCreateTaxPayerInput,
  CreateTaxPayerInput,
  DeleteTaxPayerInput,
  GetTaxPayerByHoldingInput,
  GetTaxPayerInput,
  ListTaxPayersInput,
  TaxPayerStatsInput,
  UpdateTaxPayerInput,
} from "./tax-payer.schema"

export async function listTaxPayers(
  tenantDb: TenantPrismaClient,
  input: ListTaxPayersInput,
) {
  const where: TenantPrisma.TaxPayerWhereInput = {}

  if (input.search && input.search.trim() !== "") {
    const query = input.search.trim()
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { holding: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
      { nid: { contains: query, mode: "insensitive" } },
      { village: { contains: query, mode: "insensitive" } },
      { fatherName: { contains: query, mode: "insensitive" } },
    ]
  }

  if (input.wardId) {
    where.wardId = input.wardId
  }

  if (input.unpaidOnly) {
    if (input.fiscalYearId) {
      where.payments = {
        none: {
          fiscalYearId: input.fiscalYearId,
          paymentMethod: { not: null },
        },
      }
    } else {
      where.payments = {
        none: {
          paymentMethod: { not: null },
        },
      }
    }
  }

  let orderBy: TenantPrisma.TaxPayerOrderByWithRelationInput = { createdAt: "desc" }
  if (input.sort) {
    switch (input.sort) {
      case "name_asc":
        orderBy = { name: "asc" }
        break
      case "name_desc":
        orderBy = { name: "desc" }
        break
      case "holding_asc":
        orderBy = { holding: "asc" }
        break
      case "holding_desc":
        orderBy = { holding: "desc" }
        break
      case "tax_asc":
        orderBy = { tax: "asc" }
        break
      case "tax_desc":
        orderBy = { tax: "desc" }
        break
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      default:
        orderBy = { createdAt: "desc" }
    }
  }

  const taxPayers = await tenantDb.taxPayer.findMany({
    where,
    include: {
      ward: true,
      payments: {
        select: {
          id: true,
          paymentMethod: true,
        },
      },
    },
    take: input.limit,
    skip: input.cursor ? 1 : 0,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    orderBy,
  })

  const nextCursor =
    taxPayers.length === input.limit
      ? taxPayers[taxPayers.length - 1]?.id
      : undefined

  return { taxPayers, nextCursor }
}

export async function getTaxPayerById(
  tenantDb: TenantPrismaClient,
  input: GetTaxPayerInput,
) {
  const [taxPayer, currentFiscalYear] = await Promise.all([
    tenantDb.taxPayer.findUnique({
      where: { id: input.id },
      include: {
        ward: true,
        payments: {
          include: { fiscalYear: true },
          orderBy: { paymentDate: "desc" },
        },
      },
    }),
    tenantDb.fiscalYear.findFirst({
      where: { isCurrent: true },
    }),
  ])

  if (!taxPayer) throw notFound("TaxPayer")

  const totalPaid = taxPayer.payments.reduce((acc, p) => acc + (p.amount || 0), 0)

  const currentYearPayment = currentFiscalYear
    ? taxPayer.payments.find((p) => p.fiscalYearId === currentFiscalYear.id)
    : undefined

  const isCurrentYearPaid = !!currentYearPayment
  const currentYearPaidAmount = currentYearPayment?.amount || 0
  const dueAmount = Math.max(0, taxPayer.tax - currentYearPaidAmount)

  return {
    ...taxPayer,
    currentFiscalYear,
    totalPaid,
    isCurrentYearPaid,
    currentYearPaidAmount,
    dueAmount,
  }
}

export async function getTaxPayerByHolding(
  tenantDb: TenantPrismaClient,
  input: GetTaxPayerByHoldingInput,
) {
  const where: TenantPrisma.TaxPayerWhereInput = { holding: input.holding }
  if (input.wardId) {
    where.wardId = input.wardId
  }

  const taxPayer = await tenantDb.taxPayer.findFirst({
    where,
    include: {
      ward: true,
      payments: {
        include: { fiscalYear: true },
        orderBy: { paymentDate: "desc" },
      },
    },
  })
  if (!taxPayer) throw notFound("TaxPayer")
  return taxPayer
}

export async function getTaxPayerStats(
  tenantDb: TenantPrismaClient,
  input: TaxPayerStatsInput,
) {
  const where: TenantPrisma.TaxPayerWhereInput = {}
  if (input.wardId) {
    where.wardId = input.wardId
  }

  const [totalCount, aggregateTax, wardDistributionRaw] = await Promise.all([
    tenantDb.taxPayer.count({ where }),
    tenantDb.taxPayer.aggregate({
      where,
      _sum: { tax: true },
      _avg: { tax: true },
    }),
    tenantDb.taxPayer.groupBy({
      by: ["wardId"],
      where,
      _count: { id: true },
      _sum: { tax: true },
    }),
  ])

  const wardDistribution = wardDistributionRaw.map((item) => ({
    wardId: item.wardId,
    count: item._count.id,
    totalTax: item._sum.tax ?? 0,
  }))

  return {
    totalCount,
    totalExpectedTax: aggregateTax._sum.tax ?? 0,
    averageTax: Math.round(aggregateTax._avg.tax ?? 0),
    wardDistribution,
  }

}

export async function createTaxPayer(
  tenantDb: TenantPrismaClient,
  input: CreateTaxPayerInput,
) {
  // Validate ward exists
  const ward = await tenantDb.ward.findUnique({
    where: { id: input.wardId },
    select: { id: true },
  })
  if (!ward) throw notFound("Ward")

  return tenantDb.taxPayer.create({
    data: input,
    include: { ward: true },
  })
}

export async function bulkCreateTaxPayers(
  tenantDb: TenantPrismaClient,
  input: BulkCreateTaxPayerInput,
) {
  const created = await tenantDb.$transaction(
    input.items.map((item) =>
      tenantDb.taxPayer.create({
        data: item,
        include: { ward: true },
      }),
    ),
  )
  return { count: created.length, created }
}

export async function updateTaxPayer(
  tenantDb: TenantPrismaClient,
  input: UpdateTaxPayerInput,
) {
  const { id, ...data } = input
  const existing = await tenantDb.taxPayer.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw notFound("TaxPayer")

  if (data.wardId) {
    const ward = await tenantDb.ward.findUnique({
      where: { id: data.wardId },
      select: { id: true },
    })
    if (!ward) throw notFound("Ward")
  }

  return tenantDb.taxPayer.update({
    where: { id },
    data,
    include: { ward: true },
  })
}

export async function deleteTaxPayer(
  tenantDb: TenantPrismaClient,
  input: DeleteTaxPayerInput,
) {
  const existing = await tenantDb.taxPayer.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("TaxPayer")

  await tenantDb.taxPayer.delete({ where: { id: input.id } })
  return { success: true }
}

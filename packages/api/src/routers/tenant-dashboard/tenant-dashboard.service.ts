import type { TenantPrismaClient } from "@workspace/db/tenant"

export async function getTenantDashboardStats(tenantDb: TenantPrismaClient) {
  // 1. Get current fiscal year
  const currentFiscalYear = await tenantDb.fiscalYear.findFirst({
    where: { isCurrent: true },
    orderBy: { startDate: "desc" },
  })

  // 2. Get all wards for name mapping
  const wards = await tenantDb.ward.findMany({ orderBy: { name: "asc" } })

  // 3. All taxpayer aggregates & ward distribution
  const [taxPayerCount, taxPayerAggregate, wardDistributionRaw] =
    await Promise.all([
      tenantDb.taxPayer.count(),
      tenantDb.taxPayer.aggregate({ _sum: { tax: true } }),
      tenantDb.taxPayer.groupBy({
        by: ["wardId"],
        _count: { id: true },
        _sum: { tax: true },
      }),
    ])

  // 4. Payment stats scoped to current fiscal year (paid payments only)
  const paymentFilter = {
    paymentMethod: { not: null as string | null },
    ...(currentFiscalYear ? { fiscalYearId: currentFiscalYear.id } : {}),
  }

  const [collectedAggregate, paidPaymentCount, recentPayments, wardPaymentsRaw] =
    await Promise.all([
      tenantDb.taxPayment.aggregate({
        where: paymentFilter,
        _sum: { amount: true },
      }),
      tenantDb.taxPayment.count({ where: paymentFilter }),
      tenantDb.taxPayment.findMany({
        where: paymentFilter,
        take: 10,
        orderBy: { paymentDate: "desc" },
        include: {
          taxPayer: { include: { ward: true } },
          fiscalYear: true,
        },
      }),
      // All paid payments to compute per-ward collection
      tenantDb.taxPayment.findMany({
        where: paymentFilter,
        select: {
          amount: true,
          taxPayer: { select: { wardId: true } },
        },
      }),
    ])

  // 5. Build per-ward collected map
  const wardCollectedMap: Record<string, number> = {}
  for (const payment of wardPaymentsRaw) {
    const wardId = payment.taxPayer.wardId
    wardCollectedMap[wardId] = (wardCollectedMap[wardId] ?? 0) + payment.amount
  }

  // 6. Combine into ward breakdown (only wards that have taxpayers)
  const wardBreakdown = wards
    .map((ward) => {
      const assessed = wardDistributionRaw.find((w) => w.wardId === ward.id)
      return {
        wardId: ward.id,
        wardName: ward.nameBn || ward.name,
        taxPayerCount: assessed?._count.id ?? 0,
        assessedAmount: assessed?._sum.tax ?? 0,
        collectedAmount: wardCollectedMap[ward.id] ?? 0,
      }
    })
    .filter((w) => w.taxPayerCount > 0)

  const totalAssessedTax = taxPayerAggregate._sum.tax ?? 0
  const totalCollectedTax = collectedAggregate._sum.amount ?? 0
  const collectionRate =
    totalAssessedTax > 0
      ? Math.round((totalCollectedTax / totalAssessedTax) * 100)
      : 0

  return {
    currentFiscalYear,
    totalTaxPayers: taxPayerCount,
    totalAssessedTax,
    totalCollectedTax,
    paidPaymentCount,
    collectionRate,
    recentPayments,
    wardBreakdown,
  }
}

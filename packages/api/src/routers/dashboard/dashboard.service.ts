import type { PrismaClient } from "@workspace/db/main"

export async function getAdminStats(db: PrismaClient) {
  const [totalUsers, totalSubscriptions, activeSubscriptions, totalFiscalYears] =
    await Promise.all([
      db.user.count(),
      db.subscription.count(),
      db.subscription.count({ where: { status: "ACTIVE" } }),
      db.fiscalYear.count(),
    ])

  return {
    totalUsers,
    totalSubscriptions,
    activeSubscriptions,
    totalFiscalYears,
  }
}

export async function getSubscriptionStatusDistribution(db: PrismaClient) {
  const statusGroup = await db.subscription.groupBy({
    by: ["status"],
    _count: { id: true },
  })

  const total = statusGroup.reduce((sum, item) => sum + item._count.id, 0)

  const statusColors: Record<string, string> = {
    ACTIVE: "#1e9e6b",
    TRIALING: "#2563eb",
    PAST_DUE: "#b9791f",
    CANCELED: "#8f6f6c",
    EXPIRED: "#ba1a1a",
  }

  if (total === 0) {
    return []
  }

  return statusGroup.map((item) => ({
    name: item.status,
    value: Math.round((item._count.id / total) * 100),
    count: item._count.id,
    color: statusColors[item.status] || "#2b6485",
  }))
}

export async function getRecentSubscriptions(db: PrismaClient) {
  const subscriptions = await db.subscription.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      plan: true,
      tenant: { select: { name: true } },
    },
  })

  return subscriptions.map((s) => ({
    id: s.id,
    tenantId: s.tenantId,
    tenantName: s.tenant?.name || s.tenantId,
    planName: s.plan?.displayName || s.planId,
    status: s.status,
    startDate: s.currentPeriodStart,
    endDate: s.currentPeriodEnd,
    price: s.pricePerYear ?? s.pricePerMonth,
    billingCycle: s.billingCycle,
  }))
}

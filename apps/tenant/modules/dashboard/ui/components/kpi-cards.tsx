"use client"

import { Users, Banknote, TrendingUp } from "lucide-react"

interface KpiCardsProps {
  totalTaxPayers: number
  paidPaymentCount: number
  totalAssessedTax: number
  totalCollectedTax: number
  collectionRate: number
  currentFiscalYear: any
  formatFullTaka: (amount: number) => string
}

export function KpiCards({
  totalTaxPayers,
  paidPaymentCount,
  totalAssessedTax,
  totalCollectedTax,
  collectionRate,
  currentFiscalYear,
  formatFullTaka,
}: KpiCardsProps) {
  const kpiStats = [
    {
      label: "মোট নিবন্ধিত করদাতা",
      value: `${totalTaxPayers.toLocaleString()} জন`,
      sub: `${paidPaymentCount} জন পরিশোধ করেছেন`,
      icon: Users,
      iconBg: "bg-primary/10 text-primary",
    },
    {
      label: "প্রাক্কলিত বাৎসরিক ধার্যকৃত কর",
      value: formatFullTaka(totalAssessedTax),
      sub: "সকল হোল্ডিংয়ের মোট ধার্যকৃত কর",
      icon: Banknote,
      iconBg: "bg-emerald-500/10 text-emerald-600",
      valueColor: "text-emerald-600",
    },
    {
      label: currentFiscalYear ? `${currentFiscalYear.year} অর্থবছরে মোট আদায়` : "মোট আদায়কৃত কর",
      value: formatFullTaka(totalCollectedTax),
      sub: `আদায় হার: ${collectionRate}%`,
      icon: TrendingUp,
      iconBg: "bg-blue-500/10 text-blue-600",
      valueColor: "text-blue-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 font-body">
      {kpiStats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm"
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${stat.iconBg}`}>
            <stat.icon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            <h3 className={`text-2xl font-bold ${stat.valueColor ?? "text-foreground"}`}>
              {stat.value}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

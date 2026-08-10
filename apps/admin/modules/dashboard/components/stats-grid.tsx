"use client"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Users, CreditCard, CheckCircle2, Calendar } from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function StatsGrid() {
  const { data: stats, isLoading } = useQuery(trpc.dashboard.getStats.queryOptions())

  const displayStats = {
    totalUsers: stats?.totalUsers ?? 0,
    totalSubscriptions: stats?.totalSubscriptions ?? 0,
    activeSubscriptions: stats?.activeSubscriptions ?? 0,
    totalFiscalYears: stats?.totalFiscalYears ?? 0,
  }

  const cards = [
    {
      label: "Total Users",
      sub: "Platform users",
      value: displayStats.totalUsers.toLocaleString(),
      icon: Users,
    },
    {
      label: "Subscriptions",
      sub: "All plans",
      value: displayStats.totalSubscriptions.toString(),
      icon: CreditCard,
    },
    {
      label: "Active Subscriptions",
      sub: "Currently active",
      value: displayStats.activeSubscriptions.toString(),
      icon: CheckCircle2,
    },
    {
      label: "Fiscal Years",
      sub: "Configured periods",
      value: displayStats.totalFiscalYears.toString(),
      icon: Calendar,
    },
  ]

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-5">
      {cards.map(({ label, sub, value, icon: Icon }) => (
        <div
          key={label}
          className="bg-card text-card-foreground border border-border rounded-xl p-3 sm:p-5 shadow-level-1 hover:shadow-level-2 transition-shadow duration-200 group flex items-center gap-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-muted-foreground truncate leading-none">
              {label}
            </p>
            {isLoading ? (
              <Skeleton className="h-6 sm:h-8 lg:h-9 w-20 sm:w-28 mt-1" />
            ) : (
              <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground mt-1 leading-none font-mono group-hover:text-primary transition-colors duration-150 tabular-nums">
                {value}
              </p>
            )}
            <p className="hidden sm:block text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</p>
          </div>
          <div className="hidden sm:flex shrink-0 ml-3 h-11 w-11 rounded-xl bg-primary/10 text-primary items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      ))}
    </div>
  )
}

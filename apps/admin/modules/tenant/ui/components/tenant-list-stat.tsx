"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { Building2, CheckCircle2, Clock, Ban } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"

export function TenantListStat() {
  const { data: statsData, isLoading } = useQuery(
    trpc.tenant.stats.queryOptions()
  )

  const total = statsData?.total ?? 0
  const active = statsData?.active ?? 0
  const suspended = statsData?.suspended ?? 0
  const inactive = Math.max(0, total - active - suspended)

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 sm:hidden">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-md bg-surface-container-high animate-pulse" />
          ))}
        </div>
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl bg-surface-container-high animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      {/* Mobile View (< sm): Direct Shadcn UI Badges */}
      <div className="flex flex-wrap items-center gap-2 sm:hidden">
        <Badge variant="outline" className="rounded-md border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary normal-case tracking-normal">
          Total: {total}
        </Badge>
        <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 normal-case tracking-normal">
          Active: {active}
        </Badge>
        <Badge variant="outline" className="rounded-md border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 normal-case tracking-normal">
          Inactive: {inactive}
        </Badge>
        <Badge variant="outline" className="rounded-md border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 normal-case tracking-normal">
          Suspended: {suspended}
        </Badge>
      </div>

      {/* Desktop & Tablet View (>= sm): Full Cards matched 1:1 with User module */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Porishods */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Total Porishods
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface">
              {total}
            </h3>
            <p className="text-[10px] text-outline mt-0.5">
              Registered Portals
            </p>
          </div>
        </div>

        {/* Active Porishods */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Active Portals
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-emerald-600">
              {active}
            </h3>
            <p className="text-[10px] text-outline mt-0.5">
              Live & Accessible
            </p>
          </div>
        </div>

        {/* Inactive Porishods */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Inactive Portals
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-amber-600">
              {inactive}
            </h3>
            <p className="text-[10px] text-outline mt-0.5">
              Pending Activation
            </p>
          </div>
        </div>

        {/* Suspended Porishods */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 shrink-0">
            <Ban className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Suspended
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-rose-600">
              {suspended}
            </h3>
            <p className="text-[10px] text-outline mt-0.5">
              Access Restricted
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

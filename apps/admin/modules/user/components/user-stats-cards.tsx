"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { Progress, ProgressIndicator, ProgressTrack } from "@workspace/ui/components/progress"
import { Users, CheckCircle2, AlertCircle, Activity } from "lucide-react"

interface UserStatsCardsProps {
  totalUsers?: number
  totalUsersChange?: string
  verifiedTeachers?: number
  pendingRequests?: number
  systemHealth?: number
  isLoading?: boolean
}

export function UserStatsCards({
  totalUsers = 0,
  totalUsersChange = "+0%",
  verifiedTeachers = 0,
  pendingRequests = 0,
  systemHealth = 100,
  isLoading = false,
}: UserStatsCardsProps) {
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
          Total: {totalUsers}
        </Badge>
        <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 normal-case tracking-normal">
          Teachers: {verifiedTeachers}
        </Badge>
        <Badge variant="outline" className="rounded-md border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 normal-case tracking-normal">
          Pending: {pendingRequests}
        </Badge>
        <Badge variant="outline" className="rounded-md border-teal-500/20 bg-teal-500/10 px-3 py-1.5 text-xs font-bold text-teal-600 normal-case tracking-normal">
          Health: {systemHealth}%
        </Badge>
      </div>

      {/* Desktop & Tablet View (>= sm): Full Cards */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Users */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Total Users
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="font-headline-md text-2xl font-bold text-on-surface">
                {totalUsers}
              </h3>
              <span className="font-body-md text-emerald-600 text-xs font-semibold">
                {totalUsersChange}
              </span>
            </div>
            <p className="text-[10px] text-outline mt-0.5">
              All Portal Accounts
            </p>
          </div>
        </div>

        {/* Verified Teachers */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Verified Teachers
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-emerald-600">
              {verifiedTeachers}
            </h3>
            <p className="text-[10px] text-outline mt-0.5">
              Faculty / Active Roles
            </p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Pending Requests
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-amber-600">
              {pendingRequests}
            </h3>
            <p className="text-[10px] text-outline mt-0.5">
              Verification Queue
            </p>
          </div>
        </div>

        {/* System Health */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 shrink-0">
            <Activity className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              System Health
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-2 flex-1 bg-surface-container-highest rounded-full overflow-hidden">
                <Progress value={systemHealth} className="h-full w-full bg-transparent gap-0">
                  <ProgressTrack className="h-full w-full bg-surface-container-highest rounded-full">
                    <ProgressIndicator
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${systemHealth}%` }}
                    />
                  </ProgressTrack>
                </Progress>
              </div>
              <span className="font-body-md text-on-surface font-semibold text-xs shrink-0">
                {systemHealth}%
              </span>
            </div>
            <p className="text-[10px] text-outline mt-0.5">
              Verified Accounts
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

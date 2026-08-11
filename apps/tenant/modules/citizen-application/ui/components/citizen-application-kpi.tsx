"use client"

import { ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react"

interface CitizenApplicationKpiProps {
  totalCount: number
  pendingCount: number
  approvedCount: number
  rejectedCount: number
}

export function CitizenApplicationKpi({
  totalCount,
  pendingCount,
  approvedCount,
  rejectedCount,
}: CitizenApplicationKpiProps) {
  return (
    <div className="mb-6 font-body">
      {/* Mobile View (< sm): Compact Badges */}
      <div className="flex flex-wrap items-center gap-2 sm:hidden">
        <div className="px-3 py-1.5 text-xs font-bold rounded-md border border-primary/20 bg-primary/10 text-primary">
          মোট আবেদন: {totalCount}
        </div>
        <div className="px-3 py-1.5 text-xs font-bold rounded-md border border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-450">
          পেন্ডিং: {pendingCount}
        </div>
        <div className="px-3 py-1.5 text-xs font-bold rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450">
          অনুমোদিত: {approvedCount}
        </div>
        <div className="px-3 py-1.5 text-xs font-bold rounded-md border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-450">
          প্রত্যাখ্যাত: {rejectedCount}
        </div>
      </div>

      {/* Desktop & Tablet View (>= sm): Cards Layout */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Applications */}
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              মোট আবেদন
            </p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">
              {totalCount} টি
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              সকল নাগরিক আবেদনপত্র
            </p>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-450 shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              পেন্ডিং আবেদন
            </p>
            <h3 className="text-2xl font-bold text-yellow-600 mt-0.5">
              {pendingCount} টি
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              যাচাইকরণের অপেক্ষায় রয়েছে
            </p>
          </div>
        </div>

        {/* Approved Applications */}
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              অনুমোদিত আবেদন
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">
              {approvedCount} টি
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              অনুমোদন ও নিবন্ধন সম্পন্ন
            </p>
          </div>
        </div>

        {/* Rejected Applications */}
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 shrink-0">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              প্রত্যাখ্যাত আবেদন
            </p>
            <h3 className="text-2xl font-bold text-rose-500 mt-0.5">
              {rejectedCount} টি
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              যথাযথ কারণে বাতিলকৃত
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

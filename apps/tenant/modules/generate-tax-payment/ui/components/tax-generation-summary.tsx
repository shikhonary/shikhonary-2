"use client"

import React from "react"
import { Badge } from "@workspace/ui/components/badge"
import { Users, CheckCircle2, Clock, Coins, Building2 } from "lucide-react"

interface TaxGenerationSummaryProps {
  summary?: {
    totalTaxPayers: number
    alreadyGeneratedCount: number
    pendingCount: number
    totalEstimatedAmount: number
    alreadyCollectedAmount: number
  }
  isLoading?: boolean
}

export function TaxGenerationSummary({ summary, isLoading }: TaxGenerationSummaryProps) {
  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-card/60 animate-pulse border border-border/50 p-4"
            />
          ))}
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD").format(amount) + " ৳"
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("bn-BD").format(num)
  }

  return (
    <div className="mb-6">
      {/* Mobile View (< sm): Compact Badges (Matched with Tax Payer module) */}
      <div className="flex flex-wrap items-center gap-2 sm:hidden">
        <Badge
          variant="outline"
          className="rounded-md border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary normal-case tracking-normal"
        >
          মোট করদাতা: {formatNumber(summary?.totalTaxPayers ?? 0)} জন
        </Badge>
        <Badge
          variant="outline"
          className="rounded-md border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 normal-case tracking-normal"
        >
          জেনারেশন বাকি: {formatNumber(summary?.pendingCount ?? 0)} জন
        </Badge>
        <Badge
          variant="outline"
          className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 normal-case tracking-normal"
        >
          ইতিমধ্যে জেনারেটকৃত: {formatNumber(summary?.alreadyGeneratedCount ?? 0)} জন
        </Badge>
        <Badge
          variant="outline"
          className="rounded-md border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 normal-case tracking-normal"
        >
          সম্ভাব্য ধার্যকৃত কর: {formatCurrency(summary?.totalEstimatedAmount ?? 0)}
        </Badge>
      </div>

      {/* Desktop & Tablet View (>= sm): Cards matching Tax Payer Module Stats */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Taxpayers */}
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              মোট নিবন্ধিত করদাতা
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-foreground">
                {formatNumber(summary?.totalTaxPayers ?? 0)} জন
              </h3>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              তালিকাভুক্ত সকল হোল্ডিং মালিক
            </p>
          </div>
        </div>

        {/* Pending Generation */}
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              কর জেনারেশন বাকি
            </p>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatNumber(summary?.pendingCount ?? 0)} জন
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              বাৎসরিক কর ধার্য বাকি
            </p>
          </div>
        </div>

        {/* Already Generated */}
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              কর জেনারেট সম্পন্ন
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatNumber(summary?.alreadyGeneratedCount ?? 0)} জন
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              ইতিমধ্যে ধার্যকৃত করদাতা
            </p>
          </div>
        </div>

        {/* Total Estimated Amount */}
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              সম্ভাব্য ধার্যকৃত কর (বাকি)
            </p>
            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(summary?.totalEstimatedAmount ?? 0)}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              বাৎসরিক সম্ভাব্য রাজস্ব আয়
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

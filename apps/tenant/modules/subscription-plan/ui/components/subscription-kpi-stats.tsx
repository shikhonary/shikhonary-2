"use client"

import React from "react"
import {
  Sparkles,
  Coins,
  FileSpreadsheet,
  Users,
  HardDrive,
  Clock,
  Zap,
  CheckCircle2,
} from "lucide-react"
import { toBengaliDigits, formatBengaliPrice } from "@/modules/subscription-plan/utils"
import type { TenantSubscriptionDetails } from "@/modules/subscription-plan/types"

interface SubscriptionKpiStatsProps {
  subscriptionDetails?: TenantSubscriptionDetails | null
  isLoading?: boolean
  onOpenRechargeModal?: () => void
}

export const SubscriptionKpiStats: React.FC<SubscriptionKpiStatsProps> = ({
  subscriptionDetails,
  isLoading,
  onOpenRechargeModal,
}) => {
  const sub = subscriptionDetails?.subscription
  const plan = sub?.plan
  const remainingDays = subscriptionDetails?.remainingDays ?? 0
  const quotas = subscriptionDetails?.quotas

  const creditBalance =
    quotas?.credits?.balance ?? subscriptionDetails?.usage?.credits ?? plan?.defaultCreditLimit ?? 500

  const paperRemaining = quotas?.papers?.remaining ?? 50
  const paperLimit = quotas?.papers?.limit ?? 50

  const onlineExamLimit = quotas?.onlineExams?.limit ?? 5
  const omrLimit = quotas?.omrSheets?.limit ?? 100

  const stats = [
    {
      title: "বর্তমান প্ল্যান ও মেয়াদ",
      value: plan?.displayName || "শিক্ষক প্যাক",
      subValue: `বাকি ${toBengaliDigits(remainingDays)} দিন • ${
        sub?.billingCycle === "YEARLY" ? "বার্ষিক বিলিং" : "মাসিক বিলিং"
      }`,
      icon: Clock,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
      border: "border-indigo-500/20",
    },
    {
      title: "এআই ও প্রশ্ন ক্রেডিট ওয়ালেট",
      value: `${toBengaliDigits(creditBalance)} ক্রেডিট`,
      subValue: `মাসিক অটো রিফ্রেশ: ${toBengaliDigits(quotas?.credits?.monthlyRefresh ?? plan?.defaultCreditLimit ?? 500)}টি`,
      icon: Coins,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      border: "border-amber-500/20",
    },
    {
      title: "প্রশ্নপত্র তৈরি অবশিষ্ট কোটা",
      value: `${toBengaliDigits(paperRemaining)}টি বাকি`,
      subValue: `মোট নির্ধারিত কোটা: ${toBengaliDigits(paperLimit)}টি`,
      icon: FileSpreadsheet,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      border: "border-emerald-500/20",
    },
    {
      title: "অনলাইন পরীক্ষা ও ওএমআর কোটা",
      value: `${toBengaliDigits(onlineExamLimit)}টি অনলাইন পরীক্ষা`,
      subValue: `ওএমআর মূল্যায়ন: ${toBengaliDigits(omrLimit)}টি খাতা`,
      icon: Zap,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      border: "border-purple-500/20",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-card border border-border/70 p-4 sm:p-5 shadow-xs flex flex-col justify-between select-none animate-pulse space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="h-3.5 w-24 bg-muted/70 rounded-md" />
                <div className="h-6 w-32 bg-muted/90 rounded-md mt-1" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-muted/60 shrink-0" />
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
              <div className="h-3 w-36 bg-muted/50 rounded-md" />
              {i === 2 && <div className="h-4 w-12 bg-amber-500/20 rounded-md" />}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl bg-card border ${stat.border} p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-muted-foreground font-body truncate">
                  {stat.title}
                </p>
                <h3
                  className="text-lg sm:text-xl font-bold font-headline text-foreground mt-1 truncate"
                  style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                >
                  {stat.value}
                </h3>
              </div>
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 mt-3 flex items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground font-body truncate flex items-center gap-1.5 flex-1 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
                <span className="truncate">{stat.subValue}</span>
              </p>
              {idx === 1 && onOpenRechargeModal && (
                <button
                  type="button"
                  onClick={onOpenRechargeModal}
                  className="px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-500/30 shrink-0 transition-all cursor-pointer active:scale-95"
                >
                  + রিচার্জ
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

"use client"

import React from "react"
import { Sparkles, Calendar, ShieldCheck, ArrowUpRight, Zap } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { toBengaliDigits, formatBengaliDate } from "@/modules/subscription-plan/utils"
import type { TenantSubscriptionDetails } from "@/modules/subscription-plan/types"

interface SubscriptionHeaderProps {
  subscriptionDetails?: TenantSubscriptionDetails | null
  isLoading?: boolean
  onOpenUpgradeModal: () => void
}

export const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({
  subscriptionDetails,
  isLoading,
  onOpenUpgradeModal,
}) => {
  const sub = subscriptionDetails?.subscription
  const plan = sub?.plan
  const remainingDays = subscriptionDetails?.remainingDays ?? 0

  const statusLabel =
    sub?.status === "ACTIVE"
      ? "সক্রিয়"
      : sub?.status === "TRIALING"
      ? "ট্রায়াল মোড"
      : sub?.status === "EXPIRED"
      ? "মেয়াদোত্তীর্ণ"
      : "অপেক্ষমান"

  const statusColor =
    sub?.status === "ACTIVE"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
      : sub?.status === "TRIALING"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
      : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
      {/* Decorative background glow */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>প্রতিষ্ঠান সাবস্ক্রিপশন</span>
            </span>

            {isLoading ? (
              <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
            ) : (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${statusColor}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span>{statusLabel}</span>
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight leading-tight">
              {plan?.displayName || "বর্তমান সাবস্ক্রিপশন প্ল্যান"}
            </h1>
            <p className="text-indigo-100/80 text-xs sm:text-sm font-body mt-1 leading-relaxed">
              {plan?.description ||
                "আপনার প্রতিষ্ঠানের সকল ডিজিটাল কার্যক্রম, প্রশ্নব্যাংক ও এআই সুবিধার বিস্তারিত বিবরণ"}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-body text-indigo-200/90 pt-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-300" />
              <span>
                পরবর্তী বিলিং: {formatBengaliDate(sub?.currentPeriodEnd)}
              </span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                বাকি রয়েছে:{" "}
                <strong
                  className="font-solaiman font-bold text-white text-sm"
                  style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                >
                  {toBengaliDigits(remainingDays)}
                </strong>{" "}
                দিন
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={onOpenUpgradeModal}
            className="h-11 px-5 rounded-2xl bg-white hover:bg-slate-100 text-indigo-900 font-bold text-sm shadow-lg shadow-black/10 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>প্ল্যান আপগ্রেড / পরিবর্তন</span>
            <ArrowUpRight className="w-4 h-4 text-indigo-700" />
          </Button>
        </div>
      </div>
    </div>
  )
}

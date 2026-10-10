"use client"

import React from "react"
import { Check, X, Zap, Crown, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { toBengaliDigits, formatBengaliPrice } from "@/modules/subscription-plan/utils"
import type { SubscriptionPlanItem, BillingCycle } from "@/modules/subscription-plan/types"

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlanItem
  billingCycle: BillingCycle
  isCurrentPlan: boolean
  onSelectPlan: (plan: SubscriptionPlanItem) => void
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  plan,
  billingCycle,
  isCurrentPlan,
  onSelectPlan,
}) => {
  const isPopular = plan.isPopular || plan.name === "academy"
  const price = billingCycle === "YEARLY" ? plan.yearlyPriceBDT : plan.monthlyPriceBDT
  const periodLabel = billingCycle === "YEARLY" ? "/ বছর" : "/ মাস"

  const qbFeatures = (plan.features as any)?.questionPaperBuilder || {}
  const bullets: string[] = qbFeatures.bulletPointsBn || [
    "সকল শ্রেণি ও বিষয়ের সম্পূর্ণ প্রশ্নভাণ্ডার অ্যাক্সেস",
    "প্রশ্নপত্র তৈরি ও লেআউট নিয়ন্ত্রণ",
    "এআই চ্যাটবট অ্যাসিস্ট্যান্ট দিয়ে প্রশ্ন সম্পাদনা",
    "ওএমআর খাতা মূল্যায়ন ও অনলাইন পরীক্ষা",
  ]

  const creditsIncluded =
    billingCycle === "YEARLY"
      ? (qbFeatures.creditsYearly ?? plan.defaultCreditLimit * 12)
      : (qbFeatures.creditsMonthly ?? plan.defaultCreditLimit)

  const paperLimit =
    billingCycle === "YEARLY"
      ? (qbFeatures.paperLimitYearly ?? plan.defaultExamLimit)
      : (qbFeatures.paperLimitMonthly ?? Math.round(plan.defaultExamLimit / 12))

  const aiChatbotLimit =
    billingCycle === "YEARLY"
      ? (qbFeatures.aiChatbotPaperLimitYearly ?? 60)
      : (qbFeatures.aiChatbotPaperLimitMonthly ?? 5)

  const omrSheetsLimit =
    billingCycle === "YEARLY"
      ? (qbFeatures.omrSheetsYearly ?? 1200)
      : (qbFeatures.omrSheetsMonthly ?? 100)

  const onlineExamsLimit =
    billingCycle === "YEARLY"
      ? (qbFeatures.onlineExamsYearly ?? 60)
      : (qbFeatures.onlineExamsMonthly ?? 5)

  return (
    <div
      className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 transition-all duration-300 ${
        isCurrentPlan
          ? "bg-card border-2 border-indigo-600 shadow-xl ring-2 ring-indigo-500/20"
          : isPopular
          ? "bg-card border-2 border-indigo-500/60 shadow-lg hover:shadow-xl hover:border-indigo-500"
          : "bg-card border border-border/60 shadow-xs hover:shadow-md hover:border-border"
      }`}
    >
      {/* Top Badges */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {isCurrentPlan && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>বর্তমান প্ল্যান সক্রিয়</span>
          </span>
        )}
        {isPopular && !isCurrentPlan && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-linear-to-r from-indigo-600 to-indigo-700 text-white text-xs font-bold shadow-md">
            <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>সর্বাধিক জনপ্রিয়</span>
          </span>
        )}
      </div>

      <div>
        {/* Plan Header */}
        <div className="pb-5 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-headline text-foreground">
              {plan.displayName}
            </h3>
            {plan.name === "campus" && (
              <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-500/20" />
            )}
          </div>
          <p className="text-xs text-muted-foreground font-body mt-1 min-h-[32px] line-clamp-2">
            {plan.description || "ডিজিটাল প্রশ্নপত্র তৈরি, ওএমআর ও অনলাইন পরীক্ষার সম্পূর্ণ সমাধান"}
          </p>

          {/* Pricing Display */}
          <div className="mt-4 flex items-baseline gap-1.5">
            <span
              className="text-3xl sm:text-4xl font-black font-headline text-foreground tracking-tight"
              style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
            >
              {formatBengaliPrice(price)}
            </span>
            <span className="text-xs font-semibold text-muted-foreground font-body">
              {periodLabel}
            </span>
          </div>

          {billingCycle === "YEARLY" && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium font-body mt-1">
              মাসিক হিসেবে মাত্র {formatBengaliPrice(Math.round(plan.yearlyPriceBDT / 12))}/মাস (২ মাস সাশ্রয়)
            </p>
          )}

          {/* Auto Credit Badge */}
          <div className="mt-3.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 fill-amber-500/20" />
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300 font-body">
              স্বয়ংক্রিয়ভাবে{" "}
              <strong
                className="font-bold font-solaiman text-amber-900 dark:text-amber-200"
                style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
              >
                {toBengaliDigits(creditsIncluded)} ক্রেডিট
              </strong>{" "}
              ওয়ালেটে যোগ হবে
            </p>
          </div>
        </div>

        {/* Resource Limits Matrix */}
        <div className="py-4 border-b border-border/50 space-y-2 text-xs font-body">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            নির্ধারিত ব্যবহার কোটা ({billingCycle === "YEARLY" ? "বার্ষিক" : "মাসিক"})
          </p>
          <div className="grid grid-cols-2 gap-2 text-foreground pt-1">
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40">
              <span className="text-[10px] text-muted-foreground block">প্রশ্নপত্র কোটা</span>
              <strong
                className="text-sm font-bold text-foreground font-solaiman"
                style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
              >
                {toBengaliDigits(paperLimit)}টি
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40">
              <span className="text-[10px] text-muted-foreground block">এআই চ্যাটবট পেপার</span>
              <strong
                className="text-sm font-bold text-foreground font-solaiman"
                style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
              >
                {toBengaliDigits(aiChatbotLimit)}টি পেপার
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40">
              <span className="text-[10px] text-muted-foreground block">ওএমআর খাতা মূল্যায়ন</span>
              <strong
                className="text-sm font-bold text-foreground font-solaiman"
                style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
              >
                {toBengaliDigits(omrSheetsLimit)}টি খাতা
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40">
              <span className="text-[10px] text-muted-foreground block">অনলাইন পরীক্ষা</span>
              <strong
                className="text-sm font-bold text-foreground font-solaiman"
                style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
              >
                {toBengaliDigits(onlineExamsLimit)}টি পরীক্ষা
              </strong>
            </div>
          </div>
        </div>

        {/* Feature Checklist */}
        <div className="pt-4 pb-6 space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            সুবিধাসমূহ
          </p>
          <ul className="space-y-2 text-xs font-body">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5 text-foreground">
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        {isCurrentPlan ? (
          <Button
            disabled
            variant="outline"
            className="w-full h-11 rounded-2xl font-bold border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 cursor-default"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            <span>বর্তমান প্ল্যান সক্রিয়</span>
          </Button>
        ) : (
          <Button
            onClick={() => onSelectPlan(plan)}
            className={`w-full h-11 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
              isPopular
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>এই প্ল্যানটি নির্বাচন করুন</span>
          </Button>
        )}
      </div>
    </div>
  )
}

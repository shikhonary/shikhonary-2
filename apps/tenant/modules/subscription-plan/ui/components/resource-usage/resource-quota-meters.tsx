"use client"

import React from "react"
import { FileText, Sparkles, Layers, Globe, Coins, AlertCircle } from "lucide-react"
import { toBengaliDigits } from "@/modules/subscription-plan/utils"
import type { TenantSubscriptionDetails } from "@/modules/subscription-plan/types"

interface ResourceQuotaMetersProps {
  subscriptionDetails?: TenantSubscriptionDetails | null
}

export const ResourceQuotaMeters: React.FC<ResourceQuotaMetersProps> = ({
  subscriptionDetails,
}) => {
  const quotas = subscriptionDetails?.quotas
  const plan = subscriptionDetails?.subscription?.plan
  const sub = subscriptionDetails?.subscription

  // Fallbacks if quotas not yet populated
  const papers = quotas?.papers || {
    used: 0,
    limit: plan?.defaultExamLimit || 600,
    remaining: plan?.defaultExamLimit || 600,
    percentage: 0,
    unit: "টি",
  }

  const aiChatbot = quotas?.aiChatbotPapers || {
    used: 0,
    limit: 60,
    remaining: 60,
    percentage: 0,
    unit: "টি পেপার",
  }

  const omr = quotas?.omrSheets || {
    used: 0,
    limit: 1200,
    remaining: 1200,
    percentage: 0,
    unit: "টি খাতা",
  }

  const onlineExams = quotas?.onlineExams || {
    used: 0,
    limit: 60,
    remaining: 60,
    percentage: 0,
    unit: "টি পরীক্ষা",
  }

  const creditBalance = quotas?.credits?.balance ?? subscriptionDetails?.usage?.credits ?? 500

  const meters = [
    {
      title: "প্রশ্নপত্র তৈরি কোটা",
      subtitle: "প্রশ্নব্যাংক ও কাস্টম প্রশ্নপত্র তৈরি",
      icon: FileText,
      used: papers.used,
      remaining: papers.remaining,
      limit: papers.limit,
      percentage: papers.percentage,
      unit: papers.unit,
      color: "bg-indigo-600",
      textColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "এআই চ্যাটবট পেপার কোটা",
      subtitle: "এআই চ্যাটবট দিয়ে তৈরি ও বিন্যাস",
      icon: Sparkles,
      used: aiChatbot.used,
      remaining: aiChatbot.remaining,
      limit: aiChatbot.limit,
      percentage: aiChatbot.percentage,
      unit: aiChatbot.unit,
      color: "bg-purple-600",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "ওএমআর শিট খাতা মূল্যায়ন",
      subtitle: "মোবাইল স্ক্যান ও অটো মার্কিং কোটা",
      icon: Layers,
      used: omr.used,
      remaining: omr.remaining,
      limit: omr.limit,
      percentage: omr.percentage,
      unit: omr.unit,
      color: "bg-emerald-600",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "অনলাইন পরীক্ষা হোস্ট কোটা",
      subtitle: "লাইভ অনলাইন পরীক্ষা সম্পন্ন",
      icon: Globe,
      used: onlineExams.used,
      remaining: onlineExams.remaining,
      limit: onlineExams.limit,
      percentage: onlineExams.percentage,
      unit: onlineExams.unit,
      color: "bg-blue-600",
      textColor: "text-blue-600 dark:text-blue-400",
    },
  ]

  return (
    <div className="rounded-3xl bg-card border border-border/60 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/50 gap-3">
        <div>
          <h3 className="text-lg font-bold font-headline text-foreground">
            রিসোর্স কোটা ও রিয়েল-টাইম ব্যবহার ট্র্যাকিং
          </h3>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            বর্তমান বিলিং মেয়াদের আওতায় আপনার প্রতিষ্ঠানের বিভিন্ন ফিচারের ব্যবহার ও অবশিষ্ট কোটা
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300">
          <Coins className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            ওয়ালেট ক্রেডিট:{" "}
            <strong
              className="font-solaiman text-sm"
              style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
            >
              {toBengaliDigits(creditBalance)}
            </strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meters.map((meter, idx) => {
          const Icon = meter.icon

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-muted/20 border border-border/40 space-y-3.5 hover:border-border/80 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl bg-muted/60 ${meter.textColor} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-headline text-foreground">
                      {meter.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-body">
                      {meter.subtitle}
                    </p>
                  </div>
                </div>

                <span
                  className="text-xs font-bold text-muted-foreground font-solaiman px-2 py-0.5 rounded-md bg-muted/50 border border-border/30"
                  style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                >
                  {toBengaliDigits(meter.percentage)}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${meter.color}`}
                  style={{ width: `${meter.percentage}%` }}
                />
              </div>

              {/* Status Row */}
              <div className="flex items-center justify-between text-xs font-body pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                  <span className="text-muted-foreground">ব্যবহৃত: </span>
                  <strong
                    className="text-foreground font-solaiman font-bold"
                    style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                  >
                    {toBengaliDigits(meter.used)} {meter.unit}
                  </strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">অবশিষ্ট: </span>
                  <strong
                    className="text-emerald-700 dark:text-emerald-400 font-solaiman font-bold"
                    style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                  >
                    {toBengaliDigits(meter.remaining)} {meter.unit}
                  </strong>
                </div>

                <div className="text-[11px] text-muted-foreground/80">
                  (মোট {toBengaliDigits(meter.limit)})
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

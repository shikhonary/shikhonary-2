import React from "react"
import Link from "next/link"
import { Sparkles, Coins, Plus, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { toBengaliDigits } from "@/modules/subscription-plan/utils"

interface SubscriptionInfo {
  status: string
  planName: string
  badge?: string | null
  currentPeriodEnd?: Date | string | null
}

interface CreditPlanCardProps {
  creditBalance: number
  subscription: SubscriptionInfo | null
}

export const CreditPlanCard: React.FC<CreditPlanCardProps> = ({
  creditBalance,
  subscription,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Coins className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground font-headline">
              প্ল্যান ও ক্রেডিট ওয়ালেট
            </h3>
            <p className="text-[11px] text-muted-foreground font-body">
              এআই ফিচার ও ব্যবহারের স্থিতি
            </p>
          </div>
        </div>
      </div>

      {/* Credit Balance Box */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground font-headline">
            উপলব্ধ এআই ক্রেডিট
          </span>
          <Button
            asChild
            size="sm"
            className="h-7 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs font-headline flex items-center gap-1 cursor-pointer"
          >
            <Link href="/credits">
              <Plus className="h-3 w-3 stroke-[3]" />
              <span>রিচার্জ</span>
            </Link>
          </Button>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className="text-3xl font-black text-amber-900 dark:text-amber-300 font-solaiman"
            style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
          >
            {toBengaliDigits(creditBalance)}
          </span>
          <span className="text-xs font-bold text-amber-700/80 dark:text-amber-400/80 font-solaiman">
            ক্রেডিট উপলব্ধ
          </span>
        </div>
      </div>

      {/* Subscription Tier Info */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-3.5 space-y-2.5 bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground font-body">
            বর্তমান প্ল্যান
          </span>
          <Badge className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] font-bold rounded-lg font-headline">
            {subscription?.planName || "ফ্রি টায়ার"}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-white/[0.04]">
          <span className="text-muted-foreground font-body">অবস্থা</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-headline flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            {subscription?.status === "ACTIVE" ? "সক্রিয় (Active)" : "স্ট্যান্ডার্ড"}
          </span>
        </div>

        <Button
          asChild
          variant="outline"
          className="w-full h-8.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-800/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 cursor-pointer font-headline mt-1"
        >
          <Link href="/subscription" className="flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>প্ল্যান আপগ্রেড ও রিনিউ</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}

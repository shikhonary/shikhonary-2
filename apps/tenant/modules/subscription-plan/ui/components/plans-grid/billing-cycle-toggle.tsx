"use client"

import React from "react"
import { Sparkles } from "lucide-react"
import type { BillingCycle } from "@/modules/subscription-plan/types"

interface BillingCycleToggleProps {
  value: BillingCycle
  onChange: (cycle: BillingCycle) => void
}

export const BillingCycleToggle: React.FC<BillingCycleToggleProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center p-1.5 rounded-2xl bg-muted/60 dark:bg-card border border-border/60 shadow-inner">
        <button
          type="button"
          onClick={() => onChange("MONTHLY")}
          className={`relative px-5 py-2 rounded-xl text-xs sm:text-sm font-bold font-headline transition-all cursor-pointer ${
            value === "MONTHLY"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          মাসিক বিলিং
        </button>

        <button
          type="button"
          onClick={() => onChange("YEARLY")}
          className={`relative px-5 py-2 rounded-xl text-xs sm:text-sm font-bold font-headline transition-all cursor-pointer flex items-center gap-1.5 ${
            value === "YEARLY"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>বার্ষিক বিলিং</span>
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              value === "YEARLY"
                ? "bg-amber-400 text-amber-950 font-extrabold"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
            }`}
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>২০% সাশ্রয়</span>
          </span>
        </button>
      </div>
    </div>
  )
}

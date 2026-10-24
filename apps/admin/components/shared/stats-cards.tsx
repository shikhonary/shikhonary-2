"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { toBengaliDigits } from "@workspace/utils/helpers/bengali"

export interface StatCardItem {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  change?: {
    value: string
    isPositive?: boolean
  }
}

export interface StatsCardsProps {
  cards: StatCardItem[]
  isLoading?: boolean
  ariaLabel?: string
  className?: string
  formatNumber?: (val: string | number) => string
}

export function StatsCards({
  cards,
  isLoading = false,
  ariaLabel = "পরিসংখ্যান বিবরণ",
  className,
  formatNumber = (val) => (typeof val === "number" ? toBengaliDigits(val) : String(val)),
}: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className={cn("w-full mb-6", className)}>
        {/* Mobile Minimal Skeleton */}
        <div className="grid grid-cols-2 gap-2 sm:hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-2.5 border border-slate-200/80 dark:border-white/[0.06] shadow-2xs flex items-center gap-2.5 animate-pulse"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10 shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-2.5 w-14 bg-slate-200 dark:bg-white/10 rounded" />
                <div className="h-4 w-10 bg-slate-200 dark:bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Skeleton */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.06] shadow-xs flex flex-col justify-between animate-pulse select-none"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-200 dark:bg-white/10 rounded" />
                  <div className="h-7 w-24 bg-slate-200 dark:bg-white/10 rounded-md" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10" />
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <div className="h-3 w-32 bg-slate-200 dark:bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section aria-label={ariaLabel} className={cn("w-full mb-6", className)}>
      {/* ── Mobile View: Ultra Minimal Compact 2x2 Grid ── */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {cards.map((card, idx) => {
          const Icon = card.icon
          const iconColor = card.iconColor ?? "text-indigo-600 dark:text-primary"
          const iconBg = card.iconBg ?? "bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20"

          return (
            <div
              key={idx}
              className="bg-card rounded-xl p-2.5 border border-slate-200/80 dark:border-white/[0.06] shadow-2xs flex items-center gap-2.5 min-w-0"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  iconBg,
                  iconColor
                )}
              >
                <Icon className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-500 dark:text-muted-foreground truncate font-body leading-tight">
                  {card.title}
                </p>
                <p className="text-base font-bold font-headline text-slate-900 dark:text-foreground tracking-tight leading-tight mt-0.5">
                  {formatNumber(card.value)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Desktop & Tablet View: Full KPI Cards ── */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon
          const iconColor = card.iconColor ?? "text-indigo-600 dark:text-primary"
          const iconBg = card.iconBg ?? "bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20"

          return (
            <article
              key={idx}
              className="bg-card rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.06] shadow-xs hover:shadow-md transition-all duration-200 relative group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-muted-foreground font-body">
                    {card.title}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-bold font-headline text-slate-900 dark:text-foreground mt-1.5 tracking-tight">
                    {formatNumber(card.value)}
                  </h3>
                </div>
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200",
                    iconBg,
                    iconColor
                  )}
                >
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>
              </div>

              {card.subtitle && (
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-muted-foreground/80 mt-3 font-body font-normal border-t border-slate-100 dark:border-white/[0.06] pt-3 truncate">
                  <span className="truncate">{card.subtitle}</span>
                  {card.change && (
                    <span
                      className={cn(
                        "text-[11px] font-semibold shrink-0 ml-1.5 font-headline",
                        card.change.isPositive !== false
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {card.change.value}
                    </span>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

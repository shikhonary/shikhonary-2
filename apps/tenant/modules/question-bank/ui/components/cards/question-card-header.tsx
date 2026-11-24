"use client"

import React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { toBengaliDigits } from "@workspace/utils"

export interface QuestionCardHeaderProps {
  index?: number | null
  chapterName?: string | null
  typeLabel?: string | null
  rightContent?: React.ReactNode
  extraBadges?: React.ReactNode
  className?: string
}

export const QuestionCardHeader: React.FC<QuestionCardHeaderProps> = ({
  index,
  chapterName,
  typeLabel,
  rightContent,
  extraBadges,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2.5 pb-2.5 border-b border-border/40 select-none",
        className
      )}
    >
      {/* Left Side: Index & Chapter & Type */}
      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        {index !== undefined && index !== null && (
          <span className="px-2 py-0.5 bg-muted/70 text-muted-foreground font-solaiman text-[11px] font-bold rounded-md border border-border/60">
            #{toBengaliDigits(index)}
          </span>
        )}

        {chapterName && (
          <span
            className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/25 rounded-md text-[11px] font-semibold font-body truncate max-w-[150px] sm:max-w-[240px]"
            title={chapterName}
          >
            {chapterName}
          </span>
        )}

        {typeLabel && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] font-headline">
            {typeLabel}
          </span>
        )}

        {extraBadges}
      </div>

      {/* Right Side: Optional Right Content */}
      {rightContent && (
        <div className="flex items-center gap-1.5 shrink-0">
          {rightContent}
        </div>
      )}
    </div>
  )
}

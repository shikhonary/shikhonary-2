"use client"

import * as React from "react"
import { toBengaliDigits } from "@workspace/utils/helpers/bengali"
import { Calculator } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export interface QuestionCardHeaderProps {
  globalIndex: number
  academicClassName?: string | null
  subjectName?: string | null
  chapterName?: string | null
  isMath?: boolean
  className?: string
  children?: React.ReactNode
}

export function QuestionCardHeader({
  globalIndex,
  academicClassName,
  subjectName,
  chapterName,
  isMath,
  className,
  children,
}: QuestionCardHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 pl-7 md:pl-0", className)}>
      {/* Global Index Badge */}
      <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/[0.06] font-solaiman text-xs font-bold text-slate-700 dark:text-muted-foreground rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
        #{toBengaliDigits(globalIndex)}
      </span>

      {/* Academic Class Badge */}
      {academicClassName && (
        <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-muted-foreground rounded-lg text-xs font-semibold border border-slate-200/60 dark:border-white/[0.04] font-body">
          {academicClassName}
        </span>
      )}

      {/* Subject Badge */}
      {subjectName && (
        <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-primary rounded-lg text-xs font-bold border border-indigo-200/60 dark:border-primary/20 font-body">
          {subjectName}
        </span>
      )}

      {/* Chapter Badge */}
      {chapterName && (
        <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-muted-foreground rounded-lg text-xs font-semibold border border-slate-200/60 dark:border-white/[0.04] font-body">
          {chapterName}
        </span>
      )}

      {/* Math Badge */}
      {isMath && (
        <div className="flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 rounded-lg text-[11px] font-bold border border-purple-200/60 dark:border-purple-800/40 font-body">
          <Calculator className="w-3.5 h-3.5" />
          <span>গণিত</span>
        </div>
      )}

      {/* Optional Slot for Custom Badges */}
      {children}
    </div>
  )
}

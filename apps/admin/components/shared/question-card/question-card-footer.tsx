"use client"

import * as React from "react"
import { toBengaliDigits } from "@workspace/utils/helpers/bengali"
import { BookOpen, Tag } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export interface QuestionCardFooterProps {
  source?: string | null
  session?: string | null
  year?: number | null
  references?: string[] | null
  className?: string
  children?: React.ReactNode
}

export function QuestionCardFooter({
  source,
  session,
  year,
  references,
  className,
  children,
}: QuestionCardFooterProps) {
  const sessionText = session ? toBengaliDigits(session) : year ? toBengaliDigits(year) : null
  const hasSourceOrSession = Boolean(source || sessionText)
  const refList = Array.isArray(references) ? references.filter(Boolean) : []
  const hasReferences = refList.length > 0

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 border-t border-slate-200/70 dark:border-white/[0.06] pt-3",
        className
      )}
    >
      {hasSourceOrSession && (
        <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-primary rounded-lg text-[11px] font-semibold flex items-center gap-1 border border-indigo-100 dark:border-primary/20 font-body">
          <BookOpen className="w-3 h-3" />
          <span>
            {source || "পাঠ্যবই"}
            {sessionText ? ` (${sessionText})` : ""}
          </span>
        </span>
      )}

      {hasReferences ? (
        refList.map((ref, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-muted-foreground rounded-lg text-[11px] font-medium border border-slate-200/60 dark:border-white/[0.04] flex items-center gap-1 font-body"
          >
            <Tag className="w-3 h-3 text-slate-400" />
            <span>{ref}</span>
          </span>
        ))
      ) : !hasSourceOrSession ? (
        <span className="text-[11px] text-muted-foreground italic font-body">কোনো রেফারেন্স ট্যাগ নেই</span>
      ) : null}

      {children}
    </div>
  )
}

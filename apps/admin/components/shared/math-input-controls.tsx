"use client"

import * as React from "react"
import { RenderMath } from "@workspace/ui/components/render-math"
import { Sparkles } from "lucide-react"

export interface MathLivePreviewProps {
  text?: string | null
  forceShow?: boolean
  label?: string
  className?: string
}

export function MathLivePreview({
  text,
  forceShow = false,
  label = "LaTeX ম্যাথ প্রিভিউ:",
  className = "",
}: MathLivePreviewProps) {
  if (!text || typeof text !== "string" || text.trim().length === 0) return null

  // Auto-detect LaTeX math syntax ($, $$, \(, \[, \frac, \sqrt, etc.)
  const hasLatexSyntax =
    forceShow ||
    /\$[^$\n]+\$/.test(text) ||
    /\$\$[\s\S]*?\$\$/.test(text) ||
    /\\\([\s\S]*?\\\)/.test(text) ||
    /\\\[[\s\S]*?\\\]/.test(text) ||
    /\\(frac|sqrt|pm|times|div|pi|theta|alpha|beta|ge|le|ne|approx|infty|cdot|degree|circ|Delta|lambda|sigma|mu|omega)/.test(
      text
    )

  if (!hasLatexSyntax && !forceShow) return null

  return (
    <div
      className={`mt-2 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] text-xs text-foreground space-y-1 transition-all ${className}`}
    >
      <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-primary flex items-center gap-1 select-none font-headline">
        <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
        {label}
      </span>
      <div className="text-sm leading-relaxed text-foreground font-body whitespace-pre-wrap pt-0.5">
        <RenderMath text={text} isMath={true} />
      </div>
    </div>
  )
}

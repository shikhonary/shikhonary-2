"use client"

import React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "@workspace/api"

type RouterOutput = inferRouterOutputs<AppRouter>
export type QuestionBankMcqItem = RouterOutput["mcq"]["list"]["items"][number]

interface QuestionBankMcqCardProps {
  item: QuestionBankMcqItem
  index: number
}

export function QuestionBankMcqCard({
  item,
  index,
}: QuestionBankMcqCardProps) {
  const optionLetters = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"]
  const romanNumerals = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"]

  const referencesList: string[] = Array.isArray(item.reference)
    ? item.reference
    : typeof item.reference === "string" && item.reference
      ? [item.reference]
      : []

  const globalIndex = index + 1

  return (
    <div
      className={cn(
        "bg-surface-container-lowest border rounded-2xl p-6 transition-all hover:border-primary/40 hover:shadow-md relative group border-outline-variant/60 font-solaiman"
      )}
    >
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex-1 space-y-4 min-w-0 w-full">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Global Index Badge */}
            <span className="px-2 py-0.5 bg-surface-container-high font-mono text-[11px] font-bold text-on-surface-variant rounded">
              #{globalIndex}
            </span>

            {/* Subject Badge */}
            {item.subject && (
              <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded font-label-sm text-xs font-bold border border-primary/20 font-solaiman">
                {item.subject.name}
              </span>
            )}

            {/* Chapter Badge */}
            {item.chapter && (
              <span className="px-2.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded font-label-sm text-xs font-semibold font-solaiman">
                {item.chapter.name}
              </span>
            )}

            {/* Type Badge */}
            {item.type && (
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded font-label-sm text-[11px] font-bold border border-blue-100 uppercase">
                {item.type}
              </span>
            )}

            {/* Math Badge */}
            {item.isMath && (
              <div className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded font-label-sm text-[11px] font-bold border border-amber-200">
                <span className="material-symbols-outlined text-[14px]">functions</span>
                <span>Math</span>
              </div>
            )}
          </div>

          {/* Context / Passage (If Present) */}
          {item.context && (
            <div className="rounded-xl border border-secondary/20 bg-secondary-container/10 p-3.5 text-xs text-on-surface-variant leading-relaxed">
              <div className="font-bold text-secondary flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">article</span>
                Context / Passage:
              </div>
              <div className="whitespace-pre-wrap font-solaiman">
                <RenderMath text={item.context} isMath={item.isMath} />
              </div>
            </div>
          )}

          {/* Question Text */}
          <div className="block font-headline-md text-base font-bold text-on-surface leading-snug group-hover:text-primary transition-colors font-solaiman">
            <RenderMath text={item.question} isMath={item.isMath} />
          </div>

          {/* Statements / Sub-questions (If Present) */}
          {Array.isArray(item.statements) && item.statements.length > 0 && (
            <div className="space-y-1.5 pl-3 border-l-2 border-primary/40 py-1 bg-surface-container-low/40 rounded-r-lg p-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">
                Statements:
              </span>
              {item.statements.map((stmt, sIdx) => (
                <div key={sIdx} className="flex items-start gap-2 text-xs text-on-surface-variant font-medium">
                  <span className="font-mono font-bold text-secondary shrink-0">
                    {romanNumerals[sIdx] || `${sIdx + 1}.`}
                  </span>
                  <span className="font-solaiman">
                    <RenderMath text={stmt} isMath={item.isMath} />
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Option Choices Grid */}
          {Array.isArray(item.options) && item.options.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                Option Choices ({item.options.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.options.map((opt, optIdx) => {
                  const isCorrect = item.answer === opt
                  const letter = optionLetters[optIdx] || String(optIdx + 1)

                  return (
                    <div
                      key={optIdx}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border p-2.5 text-xs transition-colors",
                        isCorrect
                          ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500/20"
                          : "border-outline-variant/40 bg-surface-container-lowest text-on-surface"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold font-solaiman",
                          isCorrect
                            ? "bg-emerald-600 text-white"
                            : "bg-surface-container-high text-on-surface-variant"
                        )}
                      >
                        {letter}
                      </span>
                      <span className="flex-1 min-w-0 whitespace-normal break-words font-solaiman">
                        <RenderMath text={opt} isMath={item.isMath} />
                      </span>
                      {isCorrect && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0 font-solaiman">
                          ✓ Correct
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Explanation / Solution Notes (If Present) */}
          {item.explanation && (
            <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low/60 p-3 text-xs text-on-surface-variant">
              <span className="font-bold text-on-surface block mb-0.5 font-solaiman">Explanation:</span>
              <div className="whitespace-pre-wrap font-solaiman">
                <RenderMath text={item.explanation} isMath={item.isMath} />
              </div>
            </div>
          )}

          {/* Reference Tags Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/30 pt-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {referencesList.length > 0 ? (
                referencesList.map((ref, rIdx) => (
                  <span
                    key={rIdx}
                    className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-[11px] font-medium font-solaiman"
                  >
                    🏷️ {ref}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-muted-foreground italic font-solaiman">No reference tags</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

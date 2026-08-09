"use client"

import React, { useState } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "@workspace/api"
import { Button } from "@workspace/ui/components/button"
import { ChevronDown, ChevronUp } from "lucide-react"

type RouterOutput = inferRouterOutputs<AppRouter>
export type QuestionBankCqItem = RouterOutput["cq"]["list"]["items"][number]

interface QuestionBankCqCardProps {
  item: QuestionBankCqItem
  index: number
}

export function QuestionBankCqCard({
  item,
  index,
}: QuestionBankCqCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const referencesList: string[] = Array.isArray(item.reference)
    ? item.reference
    : typeof item.reference === "string" && item.reference
      ? [item.reference]
      : []

  const globalIndex = index + 1

  const hasAnswer = Boolean(
    item.answer?.answerA ||
      item.answer?.answerB ||
      item.answer?.answerC ||
      item.answer?.answerD ||
      item.answer?.explanation
  )

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
          </div>

          {/* Context / Stem */}
          {item.context && (
            <div className="rounded-xl border border-secondary/20 bg-secondary-container/10 p-4 text-sm text-on-surface-variant leading-relaxed">
              <div className="font-bold text-secondary flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">article</span>
                <span>Stem (Context):</span>
              </div>
              <div className="whitespace-pre-wrap font-solaiman text-[15px]">
                <RenderMath text={item.context} />
              </div>
            </div>
          )}

          {/* Attachments */}
          {item.attachments && item.attachments.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {item.attachments.map((att) => (
                <div key={att.id} className="relative group border border-outline-variant/60 rounded-lg overflow-hidden max-w-[200px] bg-surface-container-low">
                  <img
                    src={att.url}
                    alt={att.caption || "Attachment"}
                    className="h-32 w-auto object-contain mx-auto"
                  />
                  {att.caption && (
                    <div className="bg-black/60 text-[10px] text-white p-1 text-center truncate">
                      {att.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Question Parts */}
          <div className="space-y-3 pt-2">
            {/* Part A */}
            <div className="flex items-start gap-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 font-solaiman">
                ক
              </span>
              <div className="font-medium text-[15px] text-on-surface pt-0.5 font-solaiman">
                <RenderMath text={item.questionA} />
              </div>
            </div>

            {/* Part B */}
            <div className="flex items-start gap-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 font-solaiman">
                খ
              </span>
              <div className="font-medium text-[15px] text-on-surface pt-0.5 font-solaiman">
                <RenderMath text={item.questionB} />
              </div>
            </div>

            {/* Part C */}
            <div className="flex items-start gap-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 font-solaiman">
                গ
              </span>
              <div className="font-medium text-[15px] text-on-surface pt-0.5 font-solaiman">
                <RenderMath text={item.questionC} />
              </div>
            </div>

            {/* Part D */}
            {item.questionD && (
              <div className="flex items-start gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 font-solaiman">
                  ঘ
                </span>
                <div className="font-medium text-[15px] text-on-surface pt-0.5 font-solaiman">
                  <RenderMath text={item.questionD} />
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Answer & Explanation section */}
          {hasAnswer && (
            <div className="pt-2">
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1.5 h-9 rounded-xl border border-outline-variant/60 bg-white font-semibold text-xs text-on-surface hover:bg-surface-variant cursor-pointer font-solaiman"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      <span>Hide Answer</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      <span>Show Answer & Explanation</span>
                    </>
                  )}
                </Button>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-4 bg-surface-container-low/40 rounded-xl p-4 transition-all">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary font-solaiman">
                    Answers & Explanations:
                  </h4>
                  <div className="space-y-3 font-solaiman">
                    {item.answer?.answerA && (
                      <div className="flex items-start gap-2 pl-2">
                        <span className="font-bold text-xs text-primary shrink-0 pt-0.5">ক. উত্তর:</span>
                        <div className="text-sm text-on-surface-variant leading-relaxed">
                          <RenderMath text={item.answer.answerA} />
                        </div>
                      </div>
                    )}
                    {item.answer?.answerB && (
                      <div className="flex items-start gap-2 pl-2">
                        <span className="font-bold text-xs text-primary shrink-0 pt-0.5">খ. উত্তর:</span>
                        <div className="text-sm text-on-surface-variant leading-relaxed">
                          <RenderMath text={item.answer.answerB} />
                        </div>
                      </div>
                    )}
                    {item.answer?.answerC && (
                      <div className="flex items-start gap-2 pl-2">
                        <span className="font-bold text-xs text-primary shrink-0 pt-0.5">গ. উত্তর:</span>
                        <div className="text-sm text-on-surface-variant leading-relaxed">
                          <RenderMath text={item.answer.answerC} />
                        </div>
                      </div>
                    )}
                    {item.answer?.answerD && (
                      <div className="flex items-start gap-2 pl-2">
                        <span className="font-bold text-xs text-primary shrink-0 pt-0.5">ঘ. উত্তর:</span>
                        <div className="text-sm text-on-surface-variant leading-relaxed">
                          <RenderMath text={item.answer.answerD} />
                        </div>
                      </div>
                    )}
                    {item.answer?.explanation && (
                      <div className="mt-2 pl-2 pt-2 border-t border-outline-variant/20">
                        <span className="font-bold text-xs text-secondary block mb-1">ব্যাখ্যা (Explanation):</span>
                        <div className="text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                          <RenderMath text={item.answer.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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

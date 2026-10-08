"use client"

import React from "react"
import { Eye, Plus, Sparkles, Image as ImageIcon, CheckCircle2, Bookmark } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { RenderMath } from "@workspace/ui/components/render-math"
import { cn } from "@workspace/ui/lib/utils"
import type { QuestionBankItem } from "@/modules/question-bank/types"
import { useQuestionPreviewStore } from "@/modules/question-bank/store/use-question-preview-store"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return ""
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

const optionLetters = ["ক", "খ", "গ", "ঘ"]

interface DesktopQuestionGridProps {
  questions: QuestionBankItem[]
  isLoading?: boolean
}

export const DesktopQuestionGrid: React.FC<DesktopQuestionGridProps> = ({
  questions,
  isLoading,
}) => {
  const openPreview = useQuestionPreviewStore((state) => state.openPreview)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-white/[0.06] p-5 h-72 animate-pulse flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-white/[0.06] rounded" />
                <div className="h-4 w-14 bg-white/[0.06] rounded-full" />
              </div>
              <div className="h-5 w-full bg-white/[0.06] rounded" />
              <div className="h-5 w-3/4 bg-white/[0.06] rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-full bg-white/[0.04] rounded" />
              <div className="h-8 w-full bg-white/[0.04] rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground mb-4">
          <Sparkles className="w-6 h-6 text-primary/60" />
        </div>
        <h3 className="text-base font-semibold text-foreground font-headline">
          কোনো প্রশ্ন পাওয়া যায়নি
        </h3>
        <p className="text-xs text-muted-foreground font-body mt-1 max-w-sm">
          আপনার প্রদত্ত ফিল্টার বা সার্চ কীওয়ার্ড অনুযায়ী কোনো প্রশ্ন মেলেনি। অন্য ক্যাটাগরি বা বিষয় নির্বাচন করে দেখুন।
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {questions.map((q) => {
        const isMcq = q.category === "MCQ"
        const hasOptions = Array.isArray(q.options) && q.options.length > 0
        const isCq = q.category === "CQ" || q.category === "CS"

        return (
          <div
            key={q.id}
            className="bg-card border border-white/[0.06] hover:border-white/[0.14] rounded-xl p-5 flex flex-col justify-between transition-all duration-200 group hover:shadow-lg hover:shadow-black/20"
          >
            {/* Card Header: Badges & Tags */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    {q.categoryLabelBn || q.category}
                  </span>

                  {q.difficulty && (
                    <span
                      className={cn(
                        "px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wide border",
                        q.difficulty === "EASY" &&
                          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                        q.difficulty === "MEDIUM" &&
                          "bg-amber-500/10 text-amber-400 border-amber-500/20",
                        q.difficulty === "HARD" &&
                          "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      )}
                    >
                      {q.difficulty === "EASY"
                        ? "সহজ"
                        : q.difficulty === "MEDIUM"
                        ? "মধ্যম"
                        : q.difficulty === "HARD"
                        ? "কঠিন"
                        : q.difficulty}
                    </span>
                  )}

                  {q.attachments && q.attachments.length > 0 && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-medium bg-white/[0.04] text-muted-foreground border border-white/[0.06]">
                      <ImageIcon className="w-2.5 h-2.5" />
                      <span>{q.attachments.length}</span>
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-medium text-muted-foreground/80 font-body truncate max-w-[130px]">
                  {q.subjectNameBn || q.subjectNameEn}
                </span>
              </div>

              {/* Chapter Tag */}
              {(q.chapterNameBn || q.chapterNameEn) && (
                <div className="text-[11px] text-muted-foreground font-body mb-2 truncate">
                  অধ্যায়: {q.chapterNameBn || q.chapterNameEn}
                </div>
              )}

              {/* Stimulus Context (for CQ, PBQ, etc.) */}
              {q.context && (
                <div className="text-xs text-muted-foreground bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-lg mb-3 leading-relaxed font-body line-clamp-3">
                  <RenderMath text={q.context} />
                </div>
              )}

              {/* Main Question Text */}
              <div className="text-sm font-medium text-foreground font-body leading-relaxed mb-3 line-clamp-3">
                <RenderMath text={q.questionText} />
              </div>

              {/* MCQ Options Preview */}
              {isMcq && hasOptions && (
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {q.options!.slice(0, 4).map((opt: string, oIdx: number) => {
                    const isCorrect = q.answer && q.answer.trim() === opt.trim()
                    return (
                      <div
                        key={oIdx}
                        className={cn(
                          "px-2 py-1.5 rounded-md text-[11px] font-body flex items-start gap-1.5 border leading-tight transition-colors truncate",
                          isCorrect
                            ? "bg-primary/10 border-primary/30 text-primary font-medium"
                            : "bg-white/[0.02] border-white/[0.04] text-muted-foreground"
                        )}
                        title={opt}
                      >
                        <span className="font-bold opacity-75 shrink-0">
                          {optionLetters[oIdx] || oIdx + 1})
                        </span>
                        <span className="truncate">
                          <RenderMath text={opt} />
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* CQ Sub-questions Preview */}
              {isCq && q.subQuestions && q.subQuestions.length > 0 && (
                <div className="flex flex-col gap-1 mb-3 bg-white/[0.015] p-2 rounded-lg border border-white/[0.04]">
                  {q.subQuestions.slice(0, 2).map((sub: any, sIdx: number) => (
                    <div key={sIdx} className="text-[11px] text-muted-foreground font-body flex items-center gap-1.5 truncate">
                      <span className="font-bold text-primary shrink-0">{sub.label})</span>
                      <span className="truncate">{sub.question}</span>
                    </div>
                  ))}
                  {q.subQuestions.length > 2 && (
                    <span className="text-[10px] text-muted-foreground/70 font-body">
                      +{q.subQuestions.length - 2}টি উপ-প্রশ্ন বিদ্যমান...
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Card Footer: Metadata References + View Button */}
            <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2 mt-2">
              <div className="flex items-center gap-1.5 overflow-hidden">
                {q.reference && q.reference.length > 0 ? (
                  <span className="text-[10px] text-muted-foreground/80 font-body truncate">
                    {q.reference[0]}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground/50 font-body">
                    শিখনারী ভাণ্ডার
                  </span>
                )}
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => openPreview(q)}
                className="h-7 px-2.5 text-xs text-primary hover:bg-primary/10 hover:text-primary rounded-md font-bold cursor-pointer shrink-0"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                <span>বিস্তারিত</span>
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

"use client"

import React from "react"
import { Eye, ChevronRight, Image as ImageIcon } from "lucide-react"
import { RenderMath } from "@workspace/ui/components/render-math"
import { cn } from "@workspace/ui/lib/utils"
import type { QuestionBankItem } from "@/modules/question-bank/types"
import { useQuestionPreviewStore } from "@/modules/question-bank/store/use-question-preview-store"

interface MobileCardProps {
  question: QuestionBankItem
}

export const MobileCard: React.FC<MobileCardProps> = ({ question: q }) => {
  const openPreview = useQuestionPreviewStore((state) => state.openPreview)

  return (
    <div
      onClick={() => openPreview(q)}
      className="bg-card border border-white/[0.06] active:border-white/[0.14] rounded-xl p-4 space-y-3 cursor-pointer select-none transition-colors"
    >
      {/* Header Badges */}
      <div className="flex items-center justify-between gap-2">
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

        <span className="text-[11px] text-muted-foreground font-body truncate max-w-[120px]">
          {q.subjectNameBn || q.subjectNameEn}
        </span>
      </div>

      {/* Chapter */}
      {(q.chapterNameBn || q.chapterNameEn) && (
        <div className="text-[11px] text-muted-foreground/80 font-body truncate">
          অধ্যায়: {q.chapterNameBn || q.chapterNameEn}
        </div>
      )}

      {/* Stimulus Snippet */}
      {q.context && (
        <div className="text-[11px] text-muted-foreground bg-white/[0.02] border border-white/[0.04] p-2 rounded-lg font-body line-clamp-2">
          <RenderMath text={q.context} />
        </div>
      )}

      {/* Main Question Text */}
      <div className="text-xs font-medium text-foreground font-body leading-relaxed line-clamp-3">
        <RenderMath text={q.questionText} />
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-muted-foreground font-body">
        <span className="truncate max-w-[200px]">
          {q.reference && q.reference.length > 0
            ? q.reference[0]
            : "শিখনারী ভাণ্ডার"}
        </span>

        <span className="text-primary font-bold flex items-center gap-0.5 text-xs">
          <span>বিস্তারিত</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  )
}

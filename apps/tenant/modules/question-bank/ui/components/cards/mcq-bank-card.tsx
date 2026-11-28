"use client"

import React from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import { QuestionAttachments } from "@workspace/ui/components/question-attachments"
import { toBengaliDigits, MCQ_TYPE_OPTIONS } from "@workspace/utils"
import { usePickerContext } from "@/modules/question-paper-builder/ui/components/distribution-picker/picker-card-wrapper"
import { QuestionCardWrapper } from "./question-card-wrapper"
import { QuestionCardHeader } from "./question-card-header"
import { QuestionCardFooter } from "./question-card-footer"
import { QuestionAnswerAccordion } from "./question-answer-accordion"
import { useQuestionReportStore } from "@/modules/question-bank/store/use-question-report-store"
import { getAdaptiveMcqOptionGridClass } from "@/modules/question-paper-builder/ui/components/blocks/mcq-option-label"

export interface McqBankCardProps {
  question: any
  index?: number | null
  isBookmarked?: boolean
  onToggleBookmark?: () => void
  onPreview?: () => void
  className?: string
}

const OPTION_LETTERS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"]
const ROMAN_NUMERALS = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"]

export const McqBankCard: React.FC<McqBankCardProps> = ({
  question: q,
  index,
  isBookmarked = false,
  onToggleBookmark,
  onPreview,
  className,
}) => {
  const { hasSubscription } = usePickerContext()
  const chapterName =
    q.academicChapter?.nameBn ||
    q.academicChapter?.nameEn ||
    q.chapter?.nameBn ||
    q.chapter?.nameEn

  const combinedContext =
    q.type === "COMBINED" && Array.isArray(q.attachments)
      ? q.attachments.find((att: any) => att.caption)?.caption
      : null

  const contextText = q.questionContext?.text || q.context || combinedContext

  const mcqType =
    q.type || (q.statements && q.statements.length > 0 ? "MULTIPLE" : "SINGLE")
  const mcqTypeMatch = MCQ_TYPE_OPTIONS.find(
    (t) =>
      t.value === mcqType ||
      t.value === q.type ||
      (mcqType === "GENERAL" && t.value === "SINGLE")
  )
  const mcqTypeLabel =
    mcqTypeMatch?.labelBn ||
    (q.type === "MULTIPLE_COMPLETION" || q.type === "MULTIPLE"
      ? "বহুপদী সমাপ্তিসূচক"
      : q.type === "COMBINED"
      ? "অভিন্ন তথ্যভিত্তিক"
      : undefined)

  const refList = Array.isArray(q.reference)
    ? q.reference.filter(Boolean)
    : q.reference
    ? [q.reference]
    : []
  const sourceText = q.source
    ? `${q.source}${q.session ? ` (${toBengaliDigits(q.session)})` : ""}`
    : null
  const finalReference = refList.length > 0 ? refList : sourceText || null

  return (
    <QuestionCardWrapper
      className={className}
      onClick={onPreview}
    >
      <div className="p-4 sm:p-5 pb-3.5 flex-1 flex flex-col gap-3">
        {/* Card Header */}
        <QuestionCardHeader
          index={index}
          chapterName={chapterName}
          typeLabel={mcqTypeLabel}
          extraBadges={
            q.isGlobal === false ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-headline">
                <Sparkles className="w-2.5 h-2.5" />
                <span>নিজস্ব প্রশ্ন</span>
              </span>
            ) : null
          }
        />

        {/* Card Body */}
        <div className="flex flex-col gap-2.5 font-body flex-1">
          {/* 1. Stimulus / Context (উদ্দীপক) */}
          {contextText && (
            <div className="text-xs text-foreground/90 bg-muted/30 dark:bg-white/[0.02] p-3 rounded-r-xl border-l-2 border-primary whitespace-pre-wrap font-body">
              <span className="font-bold text-primary block mb-1 text-[11px] font-headline">
                উদ্দীপক:
              </span>
              <RenderMath text={contextText} isMath={q.isMath} />
            </div>
          )}

          {/* Attachments */}
          {Array.isArray(q.attachments) && q.attachments.length > 0 && (
            <div className="space-y-1">
              <span className="font-bold text-primary block text-[11px] font-headline">
                উদ্দীপক:
              </span>
              <QuestionAttachments
                attachments={q.attachments}
                isMath={q.isMath}
                compact
              />
            </div>
          )}

          {/* 2. Question Stem / Title */}
          <div className="text-sm sm:text-base font-bold text-foreground leading-snug font-headline">
            <RenderMath
              text={q.question || q.title || q.name || ""}
              isMath={q.isMath}
            />
          </div>

          {/* 3. Statements (বহুপদী সমাপ্তিসূচক বিবৃতিসমূহ) */}
          {Array.isArray(q.statements) && q.statements.length > 0 && (
            <div className="space-y-1.5 pl-3 border-l-2 border-primary/70 py-1.5 bg-muted/15 dark:bg-white/[0.02] rounded-r-xl pr-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5 font-headline">
                বিবৃতিসমূহ:
              </span>
              {q.statements.map((stmt: string, sIdx: number) => (
                <div
                  key={sIdx}
                  className="flex items-start gap-2 text-xs text-foreground/90 font-medium font-body"
                >
                  <span className="font-mono font-bold text-primary shrink-0">
                    {ROMAN_NUMERALS[sIdx] || `${sIdx + 1}.`}
                  </span>
                  <span className="flex-1 leading-relaxed">
                    <RenderMath text={stmt} isMath={q.isMath} />
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 4. Options */}
          {Array.isArray(q.options) && q.options.length > 0 && (
            <div className={cn("grid gap-x-3 sm:gap-x-5 gap-y-2 pt-1 font-body", getAdaptiveMcqOptionGridClass(q.options))}>
              {q.options.map((opt: string, optIdx: number) => {
                const letter = OPTION_LETTERS[optIdx] || String(optIdx + 1)

                return (
                  <div
                    key={optIdx}
                    className="flex items-start gap-2 text-xs sm:text-[13px] text-foreground/90 font-body py-0.5 min-w-0"
                  >
                    <span className="shrink-0 flex items-center justify-center w-5.5 h-5.5 rounded-lg border border-primary/30 bg-primary/10 text-primary font-bold text-xs font-headline mt-0.5">
                      {letter}
                    </span>
                    <span className="flex-1 min-w-0 whitespace-normal break-words leading-relaxed pt-0.5">
                      <RenderMath text={opt} isMath={q.isMath} />
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Answer & Explanation Accordion (Gated behind Subscription) */}
          <div className="mt-3 pt-2.5 border-t border-border/30">
            <QuestionAnswerAccordion
              question={q}
              hasSubscription={hasSubscription}
            />
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <QuestionCardFooter
        reference={finalReference}
        isBookmarked={isBookmarked}
        onToggleBookmark={onToggleBookmark ? () => onToggleBookmark() : undefined}
        onReport={() => {
          useQuestionReportStore.getState().openReport({
            entityType: "MCQ",
            entityId: q.id,
            questionSnippet: q.question,
            chapterName,
            categoryLabel: mcqTypeLabel,
          })
        }}
      />
    </QuestionCardWrapper>
  )
}

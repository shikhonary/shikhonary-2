"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  Sparkles,
  Lock,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  FileText,
} from "lucide-react"
import { RenderMath } from "@workspace/ui/components/render-math"
import { cn } from "@workspace/ui/lib/utils"

export interface QuestionAnswerAccordionProps {
  question: any
  hasSubscription?: boolean
  className?: string
}

const OPTION_LETTERS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"]
const CQ_LABELS = ["ক", "খ", "গ", "ঘ"]

export const QuestionAnswerAccordion: React.FC<QuestionAnswerAccordionProps> = ({
  question,
  hasSubscription = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  if (!question) return null

  // Extract explanation
  const explanation =
    question.explanation ||
    question.answer?.explanation ||
    question.solutionExplanation ||
    null

  // Check CQ-style sub-answers
  const cqAnswerObj = question.answer && typeof question.answer === "object" ? question.answer : null
  const cqSubAnswers = [
    { label: "ক", text: question.answerA || cqAnswerObj?.answerA },
    { label: "খ", text: question.answerB || cqAnswerObj?.answerB },
    { label: "গ", text: question.answerC || cqAnswerObj?.answerC },
    { label: "ঘ", text: question.answerD || cqAnswerObj?.answerD },
  ].filter((item) => Boolean(item.text))

  // Sub-questions array (if present with answers)
  const subQuestionsWithAnswers = Array.isArray(question.subQuestions)
    ? question.subQuestions
        .filter((sq: any) => sq && (sq.answer || sq.solution))
        .map((sq: any, i: number) => ({
          label: sq.label || sq.subQuestionNo || CQ_LABELS[i] || `${i + 1}`,
          text: sq.answer || sq.solution,
        }))
    : []

  // Fill in the blanks array of answers
  const arrayAnswers = Array.isArray(question.answers)
    ? question.answers.filter(Boolean)
    : null

  // Rearrange answer key
  const rearrangeKey = question.answerKey || null

  // MCQ answer & option matching
  const rawAnswer =
    typeof question.answer === "string"
      ? question.answer.trim()
      : typeof question.answerText === "string"
      ? question.answerText.trim()
      : question.solution || question.meaning || question.opposite || question.synonym || null

  let mcqMatchedOption: { letter: string; text?: string } | null = null
  if (Array.isArray(question.options) && question.options.length > 0 && rawAnswer) {
    // 1. Check if rawAnswer matches an option text directly
    const matchIdxByText = question.options.findIndex(
      (opt: string) => opt && opt.trim().toLowerCase() === rawAnswer.toLowerCase()
    )
    if (matchIdxByText !== -1) {
      mcqMatchedOption = {
        letter: OPTION_LETTERS[matchIdxByText] || `${matchIdxByText + 1}`,
        text: question.options[matchIdxByText],
      }
    } else {
      // 2. Check if rawAnswer matches a letter (ক, খ, গ, ঘ or A, B, C, D)
      const letterIdx = OPTION_LETTERS.indexOf(rawAnswer)
      if (letterIdx !== -1 && question.options[letterIdx]) {
        mcqMatchedOption = {
          letter: rawAnswer,
          text: question.options[letterIdx],
        }
      } else {
        // 3. Check numeric index (0, 1, 2, 3)
        const numericIdx = parseInt(rawAnswer, 10)
        if (!isNaN(numericIdx) && question.options[numericIdx]) {
          mcqMatchedOption = {
            letter: OPTION_LETTERS[numericIdx] || `${numericIdx + 1}`,
            text: question.options[numericIdx],
          }
        } else {
          mcqMatchedOption = { letter: rawAnswer }
        }
      }
    }
  }

  // Determine general answer text
  const generalAnswer =
    rawAnswer ||
    question.sampleAnswer ||
    question.content ||
    question.outline ||
    question.expansion ||
    null

  return (
    <div className={cn("w-full select-none font-body", className)}>
      {/* Accordion Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen((prev) => !prev)
        }}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold font-headline transition-all cursor-pointer active:scale-[0.99]",
          isOpen
            ? hasSubscription
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30"
            : "bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-foreground/80 hover:text-foreground border border-slate-200/80 dark:border-white/[0.08]"
        )}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {hasSubscription ? (
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          )}
          <span className="truncate">
            {isOpen ? "উত্তর ও সমাধান লুকান" : "উত্তর ও সমাধান দেখুন"}
          </span>
        </div>

        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 shrink-0 transition-transform duration-250",
            isOpen && "rotate-180",
            isOpen && (hasSubscription ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"),
            !isOpen && "text-muted-foreground"
          )}
        />
      </button>

      {/* Animated Dropdown Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="accordion-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-2.5">
              {hasSubscription ? (
                /* ── Subscribed State: Verified Solution & Explanation ── */
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] p-3 sm:p-3.5 space-y-2.5 text-xs text-foreground/90">
                  {/* Badge Header */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-emerald-500/20">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-headline">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      সঠিক সমাধান
                    </span>
                  </div>

                  {/* 1. MCQ Answer */}
                  {mcqMatchedOption && (
                    <div className="flex items-start gap-2 pt-0.5">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs font-headline shrink-0">
                        {mcqMatchedOption.letter}
                      </span>
                      {mcqMatchedOption.text && (
                        <div className="flex-1 min-w-0 font-medium leading-relaxed pt-0.5">
                          <RenderMath text={mcqMatchedOption.text} isMath={question.isMath} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. CQ Sub-answers */}
                  {cqSubAnswers.length > 0 && (
                    <div className="space-y-2 pt-0.5">
                      {cqSubAnswers.map((sq: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] font-headline shrink-0 mt-0.5">
                            {sq.label}
                          </span>
                          <div className="flex-1 min-w-0 font-normal leading-relaxed">
                            <RenderMath text={sq.text} isMath={question.isMath} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. Sub-questions list with answers */}
                  {cqSubAnswers.length === 0 && subQuestionsWithAnswers.length > 0 && (
                    <div className="space-y-2 pt-0.5">
                      {subQuestionsWithAnswers.map((sq: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] font-headline shrink-0 mt-0.5">
                            {sq.label}
                          </span>
                          <div className="flex-1 min-w-0 font-normal leading-relaxed">
                            <RenderMath text={sq.text} isMath={question.isMath} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 4. Rearrange Sequence */}
                  {rearrangeKey && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-headline">
                        সঠিক ক্রম:
                      </span>
                      <span className="font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs">
                        {rearrangeKey}
                      </span>
                    </div>
                  )}

                  {/* 5. Array of answers (Fill in the blanks) */}
                  {arrayAnswers && arrayAnswers.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {arrayAnswers.map((ans: string, aIdx: number) => (
                        <div
                          key={aIdx}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs"
                        >
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-headline">
                            ({String.fromCharCode(97 + aIdx)})
                          </span>
                          <RenderMath text={ans} isMath={question.isMath} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 6. General / Math / Text Answer */}
                  {!mcqMatchedOption &&
                    cqSubAnswers.length === 0 &&
                    subQuestionsWithAnswers.length === 0 &&
                    !rearrangeKey &&
                    !arrayAnswers &&
                    generalAnswer && (
                      <div className="pt-0.5 font-normal leading-relaxed whitespace-pre-wrap">
                        <RenderMath text={generalAnswer} isMath={question.isMath} />
                      </div>
                    )}

                  {/* 7. Fallback if no answer data in record */}
                  {!mcqMatchedOption &&
                    cqSubAnswers.length === 0 &&
                    subQuestionsWithAnswers.length === 0 &&
                    !rearrangeKey &&
                    !arrayAnswers &&
                    !generalAnswer &&
                    !explanation && (
                      <div className="text-muted-foreground/80 italic text-center py-1 text-[11px]">
                        এই প্রশ্নটির বিস্তারিত সমাধান প্রক্রিয়াধীন রয়েছে।
                      </div>
                    )}

                  {/* 8. Explanation / Explanation Section */}
                  {explanation && (
                    <div className="pt-2 border-t border-emerald-500/20 space-y-1">
                      <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 font-headline">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        ব্যাখ্যা:
                      </span>
                      <div className="text-foreground/90 leading-relaxed text-[11px] sm:text-xs whitespace-pre-wrap pl-1 font-normal">
                        <RenderMath text={explanation} isMath={question.isMath} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Gated State: Locked Subscription Banner ── */
                <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.08] to-orange-500/[0.03] dark:from-amber-500/[0.12] dark:to-orange-500/[0.06] p-4 text-center space-y-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/25 shadow-2xs">
                    <Lock className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-[13px] font-bold text-foreground font-headline">
                      উত্তর ও বিস্তারিত ব্যাখ্যা দেখতে সাবস্ক্রিপশন প্রয়োজন
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-body leading-relaxed max-w-[270px] mx-auto">
                      শিখনারী প্রশ্নভাণ্ডারের নির্ভুল সমাধান, ব্যাখ্যা ও রেফারেন্স আনলক করতে আপনার অ্যাকাউন্ট আপগ্রেড করুন।
                    </p>
                  </div>

                  <div className="pt-1">
                    <Link
                      href="/subscription"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-headline bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <span>প্ল্যান আপগ্রেড করুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

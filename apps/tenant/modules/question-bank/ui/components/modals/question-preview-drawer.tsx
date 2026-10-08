"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { RenderMath } from "@workspace/ui/components/render-math"
import { QuestionAttachments } from "@workspace/ui/components/question-attachments"
import {
  Copy,
  Check,
  CheckCircle2,
  FileText,
  HelpCircle,
  Sparkles,
  ExternalLink,
  BookOpen,
} from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"
import { useQuestionPreviewStore } from "@/modules/question-bank/store/use-question-preview-store"

const optionLetters = ["ক", "খ", "গ", "ঘ"]

export const QuestionPreviewDrawer: React.FC = () => {
  const { isOpen, question, closePreview } = useQuestionPreviewStore()
  const [copied, setCopied] = useState(false)

  if (!question) return null

  const isMcq = question.category === "MCQ"
  const isCq = question.category === "CQ" || question.category === "CS"

  const handleCopy = () => {
    let copyText = question.questionText
    if (question.context) {
      copyText = `উদ্দীপক:\n${question.context}\n\nপ্রশ্ন:\n${copyText}`
    }
    if (isMcq && question.options) {
      copyText +=
        "\n\nবিকল্প:\n" +
        question.options
          .map((opt: string, idx: number) => `${optionLetters[idx] || idx + 1}) ${opt}`)
          .join("\n")
    }
    if (question.answer) {
      copyText += `\n\nসঠিক উত্তর: ${question.answer}`
    }

    navigator.clipboard.writeText(copyText)
    setCopied(true)
    toast.success("প্রশ্নটি ক্লিপবোর্ডে কপি করা হয়েছে")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closePreview()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl bg-card border-l border-white/[0.08] text-foreground p-0 flex flex-col z-[100]"
      >
        {/* Drawer Header */}
        <SheetHeader className="p-6 border-b border-white/[0.06] bg-card/80 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {question.categoryLabelBn || question.category}
              </span>

              {question.difficulty && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border",
                    question.difficulty === "EASY" &&
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    question.difficulty === "MEDIUM" &&
                      "bg-amber-500/10 text-amber-400 border-amber-500/20",
                    question.difficulty === "HARD" &&
                      "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  )}
                >
                  {question.difficulty === "EASY"
                    ? "সহজ"
                    : question.difficulty === "MEDIUM"
                    ? "মধ্যম"
                    : question.difficulty === "HARD"
                    ? "কঠিন"
                    : question.difficulty}
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8 text-xs border-white/[0.08] hover:bg-white/[0.04] text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-primary" />
                  <span>কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>কপি করুন</span>
                </>
              )}
            </Button>
          </div>

          <SheetTitle className="text-base font-bold font-headline text-foreground text-left">
            {question.subjectNameBn || question.subjectNameEn}
            {question.chapterNameBn && (
              <span className="text-xs font-normal text-muted-foreground block mt-0.5">
                অধ্যায়: {question.chapterNameBn}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stimulus / Context if available */}
          {question.context && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-body">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                উদ্দীপক / অনুচ্ছেদ
              </span>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-sm text-foreground/90 font-body leading-relaxed whitespace-pre-wrap">
                <RenderMath text={question.context} />
              </div>
            </div>
          )}

          {/* Attachments if any */}
          {question.attachments && question.attachments.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-body">
                সংযুক্তি / চিত্র
              </span>
              <QuestionAttachments attachments={question.attachments} />
            </div>
          )}

          {/* Main Question Statement */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-body">
              মূল প্রশ্ন বিবরণ
            </span>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-base font-medium text-foreground font-body leading-relaxed">
              <RenderMath text={question.questionText} />
            </div>
          </div>

          {/* MCQ Options with Verified Answer */}
          {isMcq && question.options && question.options.length > 0 && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-body">
                বিকল্প উত্তরসমূহ
              </span>
              <div className="grid grid-cols-1 gap-2">
                {question.options.map((opt: string, idx: number) => {
                  const isCorrect =
                    question.answer && question.answer.trim() === opt.trim()
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-xl border flex items-center justify-between text-sm font-body transition-colors",
                        isCorrect
                          ? "bg-primary/10 border-primary/40 text-foreground font-semibold"
                          : "bg-white/[0.02] border-white/[0.05] text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                            isCorrect
                              ? "bg-primary text-primary-foreground"
                              : "bg-white/[0.06] text-muted-foreground"
                          )}
                        >
                          {optionLetters[idx] || idx + 1}
                        </span>
                        <RenderMath text={opt} />
                      </div>

                      {isCorrect && (
                        <div className="flex items-center gap-1 text-primary text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>সঠিক উত্তর</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* CQ Sub-questions breakdown */}
          {isCq && question.subQuestions && question.subQuestions.length > 0 && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-body">
                সৃজনশীল উপ-প্রশ্নমালা
              </span>
              <div className="space-y-2.5">
                {question.subQuestions.map((sub: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {sub.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground font-body leading-relaxed">
                        <RenderMath text={sub.question} />
                      </div>
                      {sub.mark && (
                        <span className="text-[11px] text-muted-foreground font-body mt-1 block">
                          নম্বর: {sub.mark}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation / Solution */}
          {question.explanation && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-body">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ব্যাখ্যা ও সমাধান
              </span>
              <div className="bg-amber-500/[0.05] border border-amber-500/20 rounded-xl p-4 text-xs text-foreground/90 font-body leading-relaxed whitespace-pre-wrap">
                <RenderMath text={question.explanation} />
              </div>
            </div>
          )}

          {/* Reference & Board details */}
          {question.reference && question.reference.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-body block mb-2">
                বোর্ড ও উৎস তথ্য
              </span>
              <div className="flex flex-wrap gap-1.5">
                {question.reference.map((ref: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.03] border border-white/[0.06] text-muted-foreground font-body"
                  >
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-white/[0.06] bg-card flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={closePreview}
            className="border-white/[0.08] hover:bg-white/[0.04] text-xs h-9 cursor-pointer"
          >
            বন্ধ করুন
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 px-4 cursor-pointer"
          >
            <Link href="/question-papers/create">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              <span>প্রশ্নপত্র তৈরি করুন</span>
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

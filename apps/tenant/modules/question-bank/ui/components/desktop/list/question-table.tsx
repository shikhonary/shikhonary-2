"use client"

import React from "react"
import { Eye, Image as ImageIcon, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
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

interface DesktopQuestionTableProps {
  questions: QuestionBankItem[]
  isLoading?: boolean
  currentPage: number
  limit: number
}

export const DesktopQuestionTable: React.FC<DesktopQuestionTableProps> = ({
  questions,
  isLoading,
  currentPage,
  limit,
}) => {
  const openPreview = useQuestionPreviewStore((state) => state.openPreview)

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-white/[0.03] animate-pulse rounded-lg" />
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
          আপনার প্রদত্ত ফিল্টার অনুযায়ী কোনো প্রশ্ন মেলেনি।
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-body">
            <th className="py-3.5 px-4 w-12 text-center">#</th>
            <th className="py-3.5 px-4">প্রশ্ন বিবরণ</th>
            <th className="py-3.5 px-4 w-44">বিষয় ও অধ্যায়</th>
            <th className="py-3.5 px-4 w-32">ধরণ</th>
            <th className="py-3.5 px-4 w-24">কাঠিন্য</th>
            <th className="py-3.5 px-4 w-36">রেফারেন্স</th>
            <th className="py-3.5 px-4 w-24 text-right">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {questions.map((q, idx) => {
            const rowNumber = (currentPage - 1) * limit + idx + 1

            return (
              <tr
                key={q.id}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                {/* # Number */}
                <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground text-center">
                  {toBengaliDigits(rowNumber)}
                </td>

                {/* Question Text & Stimulus */}
                <td className="py-3.5 px-4">
                  <div className="max-w-xl space-y-1">
                    {q.context && (
                      <span className="inline-block text-[11px] text-muted-foreground/80 italic font-body line-clamp-1">
                        [উদ্দীপক: {q.context}]
                      </span>
                    )}
                    <div className="text-xs font-medium text-foreground font-body line-clamp-2 leading-relaxed">
                      <RenderMath text={q.questionText} />
                    </div>
                  </div>
                </td>

                {/* Subject & Chapter */}
                <td className="py-3.5 px-4">
                  <div className="text-xs font-medium text-foreground font-body truncate">
                    {q.subjectNameBn || q.subjectNameEn}
                  </div>
                  {(q.chapterNameBn || q.chapterNameEn) && (
                    <div className="text-[11px] text-muted-foreground font-body truncate mt-0.5">
                      {q.chapterNameBn || q.chapterNameEn}
                    </div>
                  )}
                </td>

                {/* Category Badge */}
                <td className="py-3.5 px-4">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    {q.categoryLabelBn || q.category}
                  </span>
                </td>

                {/* Difficulty */}
                <td className="py-3.5 px-4">
                  <span
                    className={cn(
                      "inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wide border",
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
                </td>

                {/* Reference */}
                <td className="py-3.5 px-4 text-[11px] text-muted-foreground font-body truncate">
                  {q.reference && q.reference.length > 0
                    ? q.reference[0]
                    : "শিখনারী"}
                </td>

                {/* Action */}
                <td className="py-3.5 px-4 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openPreview(q)}
                    className="h-7 px-2.5 text-xs text-primary hover:bg-primary/10 hover:text-primary rounded-md font-bold cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    <span>দেখুন</span>
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Badge } from "@workspace/ui/components/badge"
import { RenderMath } from "@workspace/ui/components/render-math"
import "katex/dist/katex.min.css"
import { cn } from "@workspace/ui/lib/utils"
import { useQuestionBankById } from "../services/use-question-bank"
import { useMcqDetailModalStore } from "../store/use-mcq-detail-modal-store"

const optionLetters = ["A", "B", "C", "D", "E", "F", "G", "H"]
const romanNumerals = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"]

function MathContent({
  content,
  isMath,
  className,
}: {
  content: string
  isMath: boolean
  className?: string
}) {
  return <RenderMath text={content} isMath={isMath} className={className} />
}

export function QuestionBankMcqDetailModal() {
  const { isOpen, selectedMcqId, closeModal } = useMcqDetailModalStore()

  const { data: mcq, isLoading } = useQuestionBankById(
    selectedMcqId ?? "",
    isOpen && Boolean(selectedMcqId),
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-0">
        {/* Modal Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-outline-variant/30 sticky top-0 bg-surface-container-lowest z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-primary">
                quiz
              </span>
              <DialogTitle className="font-headline-md text-lg font-extrabold text-on-surface">
                MCQ Detail
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Loading */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">
              progress_activity
            </span>
            <span className="text-sm font-medium">Loading question…</span>
          </div>
        )}

        {/* Content */}
        {mcq && !isLoading && (
          <div className="px-6 py-5 space-y-5">
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 font-bold text-xs">
                {mcq.subject.name}
              </Badge>
              <Badge variant="outline" className="font-semibold text-xs">
                {mcq.chapter.name}
              </Badge>
              <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50 text-[11px] font-bold uppercase">
                {mcq.type}
              </Badge>
              {mcq.isMath && (
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 text-[11px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    functions
                  </span>
                  Math
                </Badge>
              )}
            </div>

            {/* Context / Passage */}
            {mcq.context && (
              <div className="rounded-xl border border-secondary/20 bg-secondary-container/10 p-4">
                <p className="font-bold text-secondary text-[11px] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-sm">
                    article
                  </span>
                  Context / Passage
                </p>
                <MathContent
                  content={mcq.context}
                  isMath={mcq.isMath}
                  className="text-sm text-on-surface-variant leading-relaxed"
                />
              </div>
            )}

            {/* Question */}
            <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-4">
              <p className="font-bold text-[11px] uppercase tracking-wider text-outline mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">help</span>
                Question
              </p>
              <MathContent
                content={mcq.question}
                isMath={mcq.isMath}
                className="font-semibold text-sm text-on-surface leading-relaxed"
              />
            </div>

            {/* Statements */}
            {mcq.statements && mcq.statements.length > 0 && (
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
                <p className="font-bold text-[11px] uppercase tracking-wider text-outline mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">
                    format_list_numbered
                  </span>
                  Statements
                </p>
                <div className="space-y-2">
                  {mcq.statements.map((stmt, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-on-surface-variant"
                    >
                      <span className="font-mono font-bold text-outline shrink-0 min-w-[20px]">
                        {romanNumerals[idx]}.
                      </span>
                      <MathContent content={stmt} isMath={mcq.isMath} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Options */}
            <div>
              <p className="font-bold text-[11px] uppercase tracking-wider text-outline mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">
                  checklist
                </span>
                Options
              </p>
              <div className="grid grid-cols-1 gap-2">
                {mcq.options.map((option, optIdx) => {
                  const letter = optionLetters[optIdx] ?? String(optIdx + 1)
                  const isCorrect = letter === mcq.answer

                  return (
                    <div
                      key={optIdx}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-all",
                        isCorrect
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-outline-variant/40 bg-surface-container-low",
                      )}
                    >
                      <span
                        className={cn(
                          "shrink-0 font-mono font-bold w-5",
                          isCorrect ? "text-emerald-700" : "text-outline",
                        )}
                      >
                        {letter}.
                      </span>
                      <span
                        className={cn(
                          "flex-1 leading-relaxed",
                          isCorrect
                            ? "text-emerald-800 font-semibold"
                            : "text-on-surface-variant",
                        )}
                      >
                        <MathContent content={option} isMath={mcq.isMath} />
                      </span>
                      {isCorrect && (
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="material-symbols-outlined text-base text-emerald-600">
                            check_circle
                          </span>
                          <span className="text-emerald-700 text-xs font-bold">
                            Correct
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Explanation */}
            {mcq.explanation && (
              <div className="rounded-xl border border-tertiary/20 bg-tertiary-container/10 p-4">
                <p className="font-bold text-[11px] uppercase tracking-wider text-tertiary mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">
                    lightbulb
                  </span>
                  Explanation
                </p>
                <MathContent
                  content={mcq.explanation}
                  isMath={mcq.isMath}
                  className="text-sm text-on-surface-variant leading-relaxed"
                />
              </div>
            )}

            {/* References */}
            {mcq.reference && mcq.reference.length > 0 && (
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
                <p className="font-bold text-[11px] uppercase tracking-wider text-outline mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">
                    book_2
                  </span>
                  References
                </p>
                <ul className="space-y-1">
                  {mcq.reference.map((ref, refIdx) => (
                    <li
                      key={refIdx}
                      className="text-xs text-on-surface-variant flex items-start gap-1.5"
                    >
                      <span className="text-outline mt-0.5">•</span>
                      <span>{ref}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer meta */}
            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3 text-[11px] text-outline">
              <span>ID: {mcq.id}</span>
              <span>
                Updated:{" "}
                {new Date(mcq.updatedAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

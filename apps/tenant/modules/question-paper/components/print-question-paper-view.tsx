"use client"

import { useQuestionPaperById } from "../services/use-question-paper"
import { useTenant } from "@/modules/layout/ui/components/tenant-provider"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft, Printer, Loader2 } from "lucide-react"
import Link from "next/link"

interface PrintQuestionPaperViewProps {
  id: string
}

export function PrintQuestionPaperView({ id }: PrintQuestionPaperViewProps) {
  const { tenant } = useTenant()
  const { data: paper, isLoading, isError } = useQuestionPaperById(id)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center font-display">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> লোড হচ্ছে...
      </div>
    )
  }

  if (isError || !paper) {
    return (
      <div className="p-8 text-center text-red-500 font-display">
        <p className="font-bold">প্রশ্নপত্র তথ্য লোড করতে ব্যর্থ হয়েছে।</p>
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-body antialiased">
      {/* Print Controls - Hidden during physical print */}
      <div className="no-print max-w-4xl mx-auto mb-6 bg-white border border-outline-variant/30 rounded-xl p-4 shadow-sm flex items-center justify-between font-display">
        <Button variant="outline" size="sm" asChild className="rounded-lg h-9 gap-1.5 border-outline-variant cursor-pointer font-bold">
          <Link href={`/question-papers/${paper.id}/edit`}>
            <ArrowLeft className="h-4 w-4" /> এডিটিং পেজে ফিরে যান
          </Link>
        </Button>
        <Button onClick={handlePrint} className="rounded-lg h-9 gap-1.5 bg-primary text-primary-foreground cursor-pointer font-bold">
          <Printer className="h-4 w-4" /> প্রিন্ট করুন / PDF সংরক্ষণ
        </Button>
      </div>

      {/* Printable Sheet */}
      <div className="print-sheet max-w-4xl mx-auto bg-white border border-outline-variant/20 p-8 sm:p-12 shadow-sm rounded-lg print:border-0 print:shadow-none print:p-0">
        {/* Style block for print-specific rules */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background-color: white !important;
              color: black !important;
            }
            .no-print {
              display: none !important;
            }
            .print-sheet {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
            }
          }
        `}} />

        {/* Paper Header */}
        <div className="text-center space-y-2 border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-black">
            {tenant.nameBn || tenant.name}
          </h1>
          <h2 className="text-lg font-bold font-display text-black">
            {paper.examName}
          </h2>
          <p className="text-sm font-semibold text-black">
            শ্রেণী: {paper.className} | বিষয়: {paper.subjects.map((s: any) => s.subjectName).join(", ")}
          </p>
          <div className="flex justify-between items-center text-xs font-bold text-black px-4 pt-1">
            <span>সময়: {paper.timeInMinutes} মিনিট</span>
            <span>পূর্ণমান: {paper.total}</span>
          </div>
        </div>

        {/* Instructions */}
        {(() => {
          const instructions = (paper.instructions as string[]) ?? []
          if (instructions.length === 0) return null
          return (
            <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-800 print:bg-white print:border-0 print:p-0 print:mb-4">
              <span className="font-bold">বিশেষ নির্দেশনাবলী:</span>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {instructions.map((inst: string, i: number) => (
                  <li key={i}>{inst}</li>
                ))}
              </ul>
            </div>
          )
        })()}

        {/* Paper Body: Render questions grouped by subject and distribution */}
        <div className="space-y-8 font-body">
          {paper.subjects.map((subject: any) => (
            <div key={subject.id} className="space-y-6">
              {paper.subjects.length > 1 && (
                <h3 className="text-base font-extrabold font-display border-b border-dashed border-black pb-1 mb-3 text-black">
                  বিষয়: {subject.subjectName} (পূর্ণমান: {subject.subjectTotal})
                </h3>
              )}

              {subject.distributions.map((dist: any) => {
                const distQuestions = paper.questions.filter((q: any) => q.distributionId === dist.id)

                return (
                  <div key={dist.id} className="space-y-4">
                    {/* Distribution header */}
                    <div className="flex justify-between items-baseline font-display border-b border-black/10 pb-0.5 mb-2">
                      <span className="text-sm font-bold text-black">
                        {dist.questionTypeName} {dist.questionsToAttempt ? `(যেকোনো ${dist.questionsToAttempt}টি প্রশ্নের উত্তর দাও)` : ""}
                      </span>
                      <span className="text-xs font-bold text-black shrink-0">
                        {dist.questionCount} × {dist.marksPerQuestion} = {dist.totalMarks}
                      </span>
                    </div>

                    {/* Questions list */}
                    <div className="space-y-4">
                      {distQuestions.map((pq: any, idx: number) => {
                        const content = pq.contentSnapshot
                        if (!content) return null

                        return (
                          <div key={pq.id} className="text-sm leading-relaxed text-black space-y-1">
                            {/* Question text / Stem */}
                            <div className="flex gap-2 items-start">
                              <span className="font-bold shrink-0">{idx + 1}.</span>
                              <div className="flex-1">
                                {content.question || content.stem}
                              </div>
                              {content.marks && (
                                <span className="font-semibold text-xs shrink-0 pl-2">[{content.marks}]</span>
                              )}
                            </div>

                            {/* Option list if MCQ */}
                            {content.options && content.options.length > 0 && (
                              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 pl-6 mt-1 text-xs">
                                {content.options.map((opt: string, optIdx: number) => (
                                  <div key={optIdx} className="flex gap-1.5">
                                    <span className="font-semibold">({String.fromCharCode(97 + optIdx)})</span>
                                    <span>{opt}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Sub questions if CQ */}
                            {content.subQuestions && content.subQuestions.length > 0 && (
                              <div className="space-y-2 pl-6 mt-1.5 text-xs">
                                {content.subQuestions.map((sub: any, subIdx: number) => (
                                  <div key={subIdx} className="flex justify-between gap-3 leading-relaxed">
                                    <div className="flex gap-1.5">
                                      <span className="font-semibold">({String.fromCharCode(97 + subIdx)})</span>
                                      <span>{sub.question}</span>
                                    </div>
                                    {sub.marks && <span className="font-semibold shrink-0">[{sub.marks}]</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useQuestionPaperById } from "../services/use-question-paper"
import { useTenant } from "@/modules/layout/ui/components/tenant-provider"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft, Printer, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { RenderMath } from "@workspace/ui/components/render-math"

export function formatDurationBn(minutes: number): string {
  if (!minutes) return "০ মিনিট"
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  const toBnNums = (num: number | string): string => {
    const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
    return String(num)
      .split("")
      .map((digit) => (/\d/.test(digit) ? bnDigits[parseInt(digit, 10)] : digit))
      .join("")
  }

  if (hours > 0 && mins > 0) {
    return `${toBnNums(hours)} ঘণ্টা ${toBnNums(mins)} মিনিট`
  } else if (hours > 0) {
    return `${toBnNums(hours)} ঘণ্টা`
  } else {
    return `${toBnNums(mins)} মিনিট`
  }
}

const toBengaliDigits = (num: number | string): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num)
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit, 10)] : digit))
    .join("");
};

interface PrintQuestionPaperViewProps {
  id: string
}

export function PrintQuestionPaperView({ id }: PrintQuestionPaperViewProps) {
  const { tenant } = useTenant()
  const { data: paper, isLoading, isError } = useQuestionPaperById(id)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center font-display">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>প্রশ্নপত্র লোড হচ্ছে...</span>
      </div>
    )
  }

  if (isError || !paper) {
    return (
      <div className="p-8 text-center text-red-500 font-display">
        <p className="font-bold">প্রশ্নপত্র তথ্য লোড করতে ব্যর্থ হয়েছে।</p>
        <Button asChild className="mt-4">
          <Link href="/question-papers">তালিকায় ফিরে যান</Link>
        </Button>
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  const settings = (paper.settings as any) || {}

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-body antialiased print:bg-white print:p-0">
      {/* Print Controls - Hidden during physical print */}
      <div className="no-print max-w-4xl mx-auto mb-6 bg-white border border-outline-variant rounded-xl p-4 shadow-sm flex items-center justify-between font-display">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="rounded-lg h-9 gap-1.5 border-outline-variant cursor-pointer font-bold">
            <Link href={`/question-papers/${paper.id}/builder`}>
              <Sparkles className="h-4 w-4 text-primary" /> বিল্ডারে ফিরে যান
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="rounded-lg h-9 gap-1.5 border-outline-variant cursor-pointer">
            <Link href={`/question-papers/${paper.id}/edit`}>
              <ArrowLeft className="h-4 w-4" /> সাধারণ সম্পাদনা
            </Link>
          </Button>
        </div>
        <Button onClick={handlePrint} className="rounded-lg h-9 gap-1.5 bg-primary text-white cursor-pointer font-bold">
          <Printer className="h-4 w-4" /> প্রিন্ট করুন / PDF সংরক্ষণ
        </Button>
      </div>

      {/* Printable Sheet */}
      <div className="print-sheet max-w-4xl mx-auto bg-white border border-outline-variant/30 p-8 sm:p-12 shadow-sm rounded-lg print:border-0 print:shadow-none print:p-0 print:max-w-none">
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
        <div className="text-center space-y-1.5 border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-black">
            {!settings.institutionName || settings.institutionName === "শিখনারী একাডেমি"
              ? (tenant.nameBn || tenant.name)
              : settings.institutionName}
          </h1>
          <h2 className="text-lg font-bold font-display text-black">
            {paper.examName || paper.title} {settings.showSetCode && settings.setCode ? `(সেট: ${settings.setCode})` : ""}
          </h2>
          <p className="text-sm font-semibold text-black">
            শ্রেণি: {paper.className || paper.academicClass?.nameBn} {paper.subjects?.length > 0 ? `| বিষয়: ${paper.subjects.map((s: any) => s.subject?.nameBn || s.subjectName).join(", ")}` : ""}
          </p>
          <div className="flex justify-between items-center text-xs font-bold text-black px-4 pt-1">
            <span>সময়: {formatDurationBn(paper.timeInMinutes)}</span>
            <span>পূর্ণমান: {toBengaliDigits(paper.total)}</span>
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

        {/* Paper Body */}
        <div className="space-y-8 font-body">
          {paper.subjects.map((subject: any) => (
            <div key={subject.id} className="space-y-6">
              {paper.subjects.length > 1 && (
                <h3 className="text-base font-extrabold font-display border-b border-dashed border-black pb-1 mb-3 text-black">
                  বিষয়: {subject.subject?.nameBn || subject.subjectName} (পূর্ণমান: {toBengaliDigits(subject.subjectTotal)})
                </h3>
              )}

              {subject.distributions.map((dist: any) => {
                const distQuestions = paper.questions.filter((q: any) => q.distributionId === dist.id)

                return (
                  <div key={dist.id} className="space-y-4">
                    {/* Distribution header */}
                    <div className="flex justify-between items-baseline font-display border-b border-black/20 pb-1 mb-2">
                      <span className="text-sm font-bold text-black">
                        {dist.questionType?.nameBn || dist.questionTypeName} {dist.questionsToAttempt ? `(যেকোনো ${toBengaliDigits(dist.questionsToAttempt)}টি প্রশ্নের উত্তর দাও)` : ""}
                      </span>
                      <span className="text-xs font-bold text-black shrink-0">
                        {toBengaliDigits(dist.marksPerQuestion)} × {toBengaliDigits(dist.questionsToAttempt || dist.questionCount)} = {toBengaliDigits((dist.marksPerQuestion || 1) * (dist.questionsToAttempt || dist.questionCount || 1))}
                      </span>
                    </div>

                    {/* Questions list */}
                    <div className="space-y-4">
                      {distQuestions.map((pq: any, idx: number) => {
                        const mcq = pq.mcq || (pq.contentSnapshot?.options ? pq.contentSnapshot : null);
                        const cq = pq.cq || (pq.contentSnapshot?.questionA ? pq.contentSnapshot : null);
                        const short = pq.shortAnswer || (pq.contentSnapshot?.question ? pq.contentSnapshot : null);

                        if (cq) {
                          const subQuestions = [
                            { label: "ক", text: cq.questionA, marks: 1 },
                            { label: "খ", text: cq.questionB, marks: 2 },
                            { label: "গ", text: cq.questionC, marks: 3 },
                            { label: "ঘ", text: cq.questionD, marks: 4 },
                          ].filter((sq) => sq.text);

                          return (
                            <div key={pq.id} className="text-sm leading-relaxed text-black space-y-1.5 break-inside-avoid">
                              <div className="flex gap-2 items-start">
                                <span className="font-bold shrink-0">{toBengaliDigits(idx + 1)}।</span>
                                <div className="flex-1">
                                  {cq.context && (
                                    <div className="mb-2 italic text-black/90">
                                      <RenderMath text={cq.context} />
                                    </div>
                                  )}
                                  <div className="space-y-1">
                                    {subQuestions.map((sq, sIdx) => (
                                      <div key={sIdx} className="flex justify-between items-start gap-2 text-xs">
                                        <div className="flex gap-1.5 items-start flex-1">
                                          <span className="font-bold">({sq.label})</span>
                                          <span><RenderMath text={sq.text} /></span>
                                        </div>
                                        <span className="font-bold shrink-0">[{toBengaliDigits(sq.marks)}]</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (short) {
                          return (
                            <div key={pq.id} className="text-sm leading-relaxed text-black space-y-1 break-inside-avoid">
                              <div className="flex gap-2 items-start">
                                <span className="font-bold shrink-0">{toBengaliDigits(idx + 1)}।</span>
                                <div className="flex-1">
                                  <RenderMath text={short.question} />
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (mcq) {
                          const options = pq.overrides?.shuffledOptions || mcq.options || [];
                          const optLabels = ["ক", "খ", "গ", "ঘ"];

                          return (
                            <div key={pq.id} className="text-sm leading-relaxed text-black space-y-1 break-inside-avoid">
                              {mcq.questionContext?.text && (
                                <div className="italic text-xs text-black/80 pl-6 mb-1">
                                  <RenderMath text={mcq.questionContext.text} />
                                </div>
                              )}
                              <div className="flex gap-2 items-start">
                                <span className="font-bold shrink-0">{toBengaliDigits(idx + 1)}.</span>
                                <div className="flex-1 font-medium">
                                  <RenderMath text={mcq.question} />
                                </div>
                              </div>

                              {mcq.statements && mcq.statements.length > 0 && (
                                <div className="pl-6 text-xs space-y-0.5 my-1">
                                  {mcq.statements.map((stmt: string, sIdx: number) => (
                                    <div key={sIdx} className="flex gap-1.5">
                                      <span className="opacity-80">{["i", "ii", "iii", "iv"][sIdx] || sIdx + 1}.</span>
                                      <span><RenderMath text={stmt} /></span>
                                    </div>
                                  ))}
                                  <div className="font-semibold text-[11px] pt-0.5">নিচের কোনটি সঠিক?</div>
                                </div>
                              )}

                              {options.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 pl-6 mt-1 text-xs">
                                  {options.map((opt: string, optIdx: number) => (
                                    <div key={optIdx} className="flex gap-1.5 items-start">
                                      <span className="font-bold">({optLabels[optIdx] || optIdx + 1})</span>
                                      <span><RenderMath text={opt} /></span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return null;
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

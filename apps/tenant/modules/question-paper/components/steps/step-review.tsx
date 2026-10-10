"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { CheckCircle2, FileText, List, BookOpen, ClipboardList } from "lucide-react"
import type { WizardData, WizardSubject } from "../../types/create-wizard"

export function formatDurationBn(minutes: number): string {
  if (!minutes) return "০ মিনিট"
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  const toBnNums = (num: number): string => {
    const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
    return String(num)
      .split("")
      .map((digit) => bnDigits[parseInt(digit, 10)] || digit)
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

interface StepReviewProps {
  data: WizardData
  onGoToStep: (step: number) => void
}

export function StepReview({ data, onGoToStep }: StepReviewProps) {
  const getSubjectTotal = (s: WizardSubject) =>
    s.distributions.reduce((sum, d) => sum + d.marksPerQuestion * (d.questionsToAttempt ?? d.questionCount), 0)

  const grandTotal = data.subjects.reduce((sum, s) => sum + getSubjectTotal(s), 0)

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-0 shadow-xs ring-0">
      <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-6 flex flex-row items-center gap-3 sm:gap-4">
        <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 text-indigo-600 dark:text-primary shrink-0">
          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="flex-1">
          <CardTitle className="font-headline text-base sm:text-lg font-bold text-foreground normal-case tracking-normal">
            চূড়ান্ত পর্যালোচনা
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5 font-body">
            সকল তথ্য ও নম্বর বণ্টন যাচাই করে প্রশ্নপত্র তৈরি সম্পন্ন করুন
          </p>
        </div>
        {grandTotal > 0 && (
          <Badge className="bg-indigo-600 text-white px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl shrink-0 font-solaiman shadow-xs">
            মোট: {grandTotal} নম্বর
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-5 sm:p-6 space-y-6 font-body">
        {/* Basic Info */}
        <ReviewSection
          icon={<FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
          title="প্রাথমিক তথ্য"
          onEdit={() => onGoToStep(0)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            <ReviewField label="পরীক্ষার নাম" value={data.examName} />
            <ReviewField label="শ্রেণী" value={data.className} />
            <ReviewField label="পরীক্ষার সময়" value={formatDurationBn(data.timeInMinutes)} />
          </div>
        </ReviewSection>

        {/* Subjects & Distribution */}
        <ReviewSection
          icon={<BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
          title={`বিষয় ও নম্বর বণ্টন (${data.subjects.length} বিষয়)`}
          onEdit={() => onGoToStep(1)}
        >
          <div className="space-y-4">
            {data.subjects.map((subject) => {
              const subTotal = getSubjectTotal(subject)
              return (
                <div key={subject.tempId} className="space-y-2 p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/40 dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground font-headline">{subject.subjectName}</span>
                    <Badge className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 px-2 py-0.5 text-xs font-bold rounded-md font-solaiman">
                      {subTotal} নম্বর
                    </Badge>
                  </div>
                  {subject.distributions.length > 0 && (
                    <div className="mt-2">
                      {/* Mobile Cards View (sm:hidden) */}
                      <div className="space-y-2 sm:hidden">
                        {subject.distributions.map((d) => (
                          <div
                            key={d.tempId}
                            className="p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-2xs space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-bold text-foreground font-headline">
                                  {d.questionTypeNameBn || d.questionTypeName}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5 font-body">
                                  প্রতি প্রশ্নে: <span className="font-semibold text-foreground font-solaiman">{d.marksPerQuestion}</span> নম্বর
                                </p>
                              </div>
                              <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 font-solaiman bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/40">
                                মোট: {d.marksPerQuestion * (d.questionsToAttempt ?? d.questionCount)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1.5 border-t border-slate-100 dark:border-white/[0.04] font-body">
                              <span>প্রশ্ন সংখ্যা: <strong className="text-foreground font-solaiman">{d.questionCount}</strong></span>
                              <span>চেষ্টা: <strong className="text-foreground font-solaiman">{d.questionsToAttempt ?? "সব"}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table View (hidden sm:block) */}
                      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-card">
                        <table className="w-full text-xs font-body">
                          <thead>
                            <tr className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] text-muted-foreground">
                              <th className="text-left py-2 px-2.5 text-[11px] font-bold font-headline uppercase">ধরণ</th>
                              <th className="text-center py-2 px-2.5 text-[11px] font-bold font-headline uppercase">নম্বর/প্রশ্ন</th>
                              <th className="text-center py-2 px-2.5 text-[11px] font-bold font-headline uppercase">প্রশ্ন সংখ্যা</th>
                              <th className="text-center py-2 px-2.5 text-[11px] font-bold font-headline uppercase">চেষ্টা</th>
                              <th className="text-center py-2 px-2.5 text-[11px] font-bold font-headline uppercase">মোট</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                            {subject.distributions.map((d) => (
                              <tr key={d.tempId} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                                <td className="py-2 px-2.5 font-semibold text-foreground">{d.questionTypeNameBn || d.questionTypeName}</td>
                                <td className="py-2 px-2.5 text-center text-muted-foreground font-solaiman">{d.marksPerQuestion}</td>
                                <td className="py-2 px-2.5 text-center text-muted-foreground font-solaiman">{d.questionCount}</td>
                                <td className="py-2 px-2.5 text-center text-muted-foreground font-solaiman">{d.questionsToAttempt ?? "সব"}</td>
                                <td className="py-2 px-2.5 text-center font-bold text-indigo-600 dark:text-indigo-400 font-solaiman">{d.marksPerQuestion * (d.questionsToAttempt ?? d.questionCount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ReviewSection>

        {/* Grand Total */}
        <div className="flex items-center justify-between rounded-2xl border border-indigo-200/80 dark:border-indigo-800/50 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 font-headline shadow-2xs">
          <span className="text-base font-bold text-foreground">সর্বমোট নম্বর</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-solaiman">{grandTotal}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Helper components ────────────────────────────────────────────

function ReviewSection({
  icon,
  title,
  onEdit,
  children,
}: {
  icon: React.ReactNode
  title: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-3.5 bg-card shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground font-headline">{title}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onEdit}
          className="h-8 rounded-xl px-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
        >
          এডিট
        </Button>
      </div>
      <div>{children}</div>
    </div>
  )
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-headline font-semibold">{label}</p>
      <p className="text-sm font-semibold text-foreground font-body">{value || "—"}</p>
    </div>
  )
}

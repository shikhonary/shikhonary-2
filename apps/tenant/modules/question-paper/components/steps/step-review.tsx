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
    <Card className="overflow-hidden rounded-xl border border-outline-variant bg-white p-0 shadow-xs ring-0">
      <CardHeader className="border-b border-outline-variant/40 bg-surface-container-lowest p-4 sm:p-8 flex flex-row items-center gap-3 sm:gap-4">
        <div className="flex size-10 sm:size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="flex-1">
          <CardTitle className="font-headline-md text-base sm:text-[20px] font-extrabold text-on-surface normal-case tracking-normal">
            পর্যালোচনা
          </CardTitle>
          <p className="text-[11px] sm:text-xs font-body-md text-on-surface-variant mt-0.5 font-body">
            সবকিছু যাচাই করুন এবং প্রশ্নপত্র তৈরি করুন
          </p>
        </div>
        {grandTotal > 0 && (
          <Badge className="bg-primary text-white px-3 py-1.5 text-sm font-bold rounded-lg shrink-0">
            মোট: {grandTotal} নম্বর
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-8 space-y-6">
        {/* Basic Info */}
        <ReviewSection
          icon={<FileText className="h-4 w-4" />}
          title="প্রাথমিক তথ্য"
          onEdit={() => onGoToStep(0)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            <ReviewField label="পরীক্ষার নাম" value={data.examName} />
            <ReviewField label="শ্রেণী" value={data.className} />
            <ReviewField label="পরীক্ষার সময়" value={formatDurationBn(data.timeInMinutes)} />
            <ReviewField label="টেমপ্লেট" value={data.isTemplate ? "হ্যাঁ" : "না"} />
          </div>
        </ReviewSection>

        {/* Sections */}
        {/* Subjects & Distribution */}
        <ReviewSection
          icon={<BookOpen className="h-4 w-4" />}
          title={`বিষয় ও নম্বর বণ্টন (${data.subjects.length} বিষয়)`}
          onEdit={() => onGoToStep(1)}
        >
          <div className="space-y-4">
            {data.subjects.map((subject) => {
              const subTotal = getSubjectTotal(subject)
              return (
                <div key={subject.tempId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-on-surface font-display">{subject.subjectName}</span>
                    <Badge className="bg-primary/10 text-primary px-2 py-0.5 text-xs font-bold rounded-md">
                      {subTotal} নম্বর
                    </Badge>
                  </div>
                  {subject.distributions.length > 0 && (
                    <div className="overflow-x-auto ml-2">
                      <table className="w-full text-xs font-body">
                        <thead>
                          <tr className="border-b border-outline-variant/40">
                            <th className="text-left py-1.5 px-2 text-[10px] font-medium text-outline uppercase">ধরণ</th>
                            <th className="text-center py-1.5 px-2 text-[10px] font-medium text-outline uppercase">নম্বর/প্রশ্ন</th>
                            <th className="text-center py-1.5 px-2 text-[10px] font-medium text-outline uppercase">প্রশ্ন সংখ্যা</th>
                            <th className="text-center py-1.5 px-2 text-[10px] font-medium text-outline uppercase">চেষ্টা</th>
                            <th className="text-center py-1.5 px-2 text-[10px] font-medium text-outline uppercase">মোট</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subject.distributions.map((d) => (
                            <tr key={d.tempId} className="border-b border-outline-variant/20 last:border-0">
                              <td className="py-1.5 px-2 text-on-surface">{d.questionTypeName}</td>
                              <td className="py-1.5 px-2 text-center text-on-surface-variant">{d.marksPerQuestion}</td>
                              <td className="py-1.5 px-2 text-center text-on-surface-variant">{d.questionCount}</td>
                              <td className="py-1.5 px-2 text-center text-on-surface-variant">{d.questionsToAttempt ?? "সব"}</td>
                              <td className="py-1.5 px-2 text-center font-bold text-primary">{d.marksPerQuestion * (d.questionsToAttempt ?? d.questionCount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ReviewSection>



        {/* Grand Total */}
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-5 font-display">
          <span className="text-base font-bold text-primary">সর্বমোট নম্বর</span>
          <span className="text-3xl font-extrabold text-primary">{grandTotal}</span>
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
    <div className="rounded-lg border border-outline-variant/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface font-display">{title}</span>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={onEdit}
          className="h-7 rounded-lg px-3 py-1 font-bold text-xs cursor-pointer text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary transition-colors border-0"
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
      <p className="text-[10px] text-outline uppercase tracking-wider font-display">{label}</p>
      <p className="text-sm text-on-surface font-body">{value || "—"}</p>
    </div>
  )
}

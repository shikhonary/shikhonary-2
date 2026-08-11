"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Database, Check, Loader2, AlertCircle, RefreshCw, ArrowRight, Server, ShieldCheck } from "lucide-react"

type SubmissionStatus = "idle" | "pending" | "success" | "error"

interface SubmissionProgressProps {
  submissionStatus: SubmissionStatus
  activeSubStep: number
  submissionError?: string
  nameBn: string
  onRetry: () => void
  onBack: () => void
}

const submissionSteps = [
  {
    id: 1,
    label: "আবেদনপত্রের তথ্য যাচাইকরণ",
    description: "প্রদত্ত সকল প্রয়োজনীয় তথ্য ও ঠিকানার সঠিকতা পরীক্ষা করা হচ্ছে",
    icon: Server,
  },
  {
    id: 2,
    label: "সিস্টেম ডাটাবেজে সংরক্ষণ",
    description: "আবেদনকারী নাগরিকের প্রোফাইল ও রেকর্ড সিস্টেমে যুক্ত করা হচ্ছে",
    icon: Database,
  },
  {
    id: 3,
    label: "আবেদনপত্র দাখিল সম্পন্ন",
    description: "আবেদনটি সফলভাবে জমা হয়েছে এবং পর্যালোচনার জন্য প্রস্তুত",
    icon: ShieldCheck,
  },
]

export function SubmissionProgress({
  submissionStatus,
  activeSubStep,
  submissionError,
  nameBn,
  onRetry,
  onBack,
}: SubmissionProgressProps) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 py-8 animate-in fade-in duration-500 font-body">
      <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xl text-left gap-4 relative">
        <CardHeader className="p-0 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-headline text-lg font-bold tracking-tight text-foreground">
                {submissionStatus === "success"
                  ? "আবেদনপত্র দাখিল সম্পন্ন!"
                  : submissionStatus === "error"
                  ? "দাখিল করতে ত্রুটি ঘটেছে"
                  : "নাগরিক আবেদনপত্র সিস্টেমে যুক্ত হচ্ছে"}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {submissionStatus === "success"
                  ? `"${nameBn}" এর আবেদনপত্রটি সফলভাবে জমা হয়েছে।`
                  : submissionStatus === "error"
                  ? "আবেদনটি সিস্টেমে যুক্ত করতে সমস্যা হয়েছে।"
                  : `আবেদনকারী "${nameBn || "নাগরিক"}" এর ডেটাবেজ প্রোফাইল তৈরি হচ্ছে।`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-6 space-y-6">
          <div className="space-y-4">
            {submissionSteps.map((step) => {
              const isDone = submissionStatus === "success" || (submissionStatus !== "error" && activeSubStep > step.id)
              const isActiveStep = submissionStatus !== "success" && submissionStatus !== "error" && activeSubStep === step.id
              const isFailed = submissionStatus === "error" && activeSubStep === step.id
              const StepIcon = step.icon

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                    isDone
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : isActiveStep
                      ? "border-primary/40 bg-primary/10 animate-pulse"
                      : isFailed
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-border/45 bg-muted/20 opacity-50"
                  }`}
                >
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center border shrink-0 ${
                      isDone
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : isActiveStep
                        ? "bg-primary text-white border-primary"
                        : isFailed
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-5 w-5" />
                    ) : isActiveStep ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isFailed ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${isDone ? "text-emerald-700 dark:text-emerald-450" : isActiveStep ? "text-primary" : "text-foreground"}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  </div>

                  {isDone && <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-lg">Done</span>}
                  {isActiveStep && <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-lg">Running</span>}
                </div>
              )
            })}
          </div>

          {submissionStatus === "error" && submissionError && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-xs text-destructive font-medium">
              <span className="font-bold">ত্রুটি: </span>
              {submissionError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
            {submissionStatus === "error" && (
              <Button
                type="button"
                variant="outline"
                onClick={onRetry}
                className="rounded-lg border px-5 py-2 text-xs font-semibold hover:bg-muted cursor-pointer h-10"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                আবার চেষ্টা করুন
              </Button>
            )}
            {submissionStatus === "success" && (
              <Button
                type="button"
                onClick={onBack}
                className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer h-10 shadow-sm"
              >
                <Check className="mr-2 h-4 w-4" />
                আবেদন তালিকায় ফিরে যান
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

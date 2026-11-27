"use client"

import React, { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { toast } from "@workspace/ui/components/sonner"
import {
  Flag,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { useQuestionReportStore } from "../../../store/use-question-report-store"

const REPORT_REASONS = [
  {
    type: "INCORRECT_ANSWER" as const,
    label: "ভুল উত্তর / অপশন ভুল",
    description: "সঠিক উত্তর ভুল চিহ্নিত আছে বা সঠিক বিকল্প অনুপস্থিত",
  },
  {
    type: "TYPO_ERROR" as const,
    label: "বানান বা টাইপিং ভুল",
    description: "প্রশ্ন বা অপশনে বানান, প্রতীক বা যতিচিহ্নের ত্রুটি",
  },
  {
    type: "INCOMPLETE_QUESTION" as const,
    label: "উদ্দীপক বা তথ্য অসম্পূর্ণ",
    description: "উদ্দীপকের তথ্য, সূত্র বা প্রয়োজনীয় বাক্য বাদ পড়েছে",
  },
  {
    type: "MISSING_DIAGRAM" as const,
    label: "চিত্র / ডায়াগ্রাম অনুপস্থিত",
    description: "চিত্রটি লোড হচ্ছে না, অস্পষ্ট বা যুক্ত করা হয়নি",
  },
  {
    type: "OUT_OF_SYLLABUS" as const,
    label: "ভুল অধ্যায় / সিলেবাস বহির্ভূত",
    description: "ভুল অধ্যায় বা ভিন্ন সিলেবাসের অন্তর্ভুক্ত করা হয়েছে",
  },
  {
    type: "DUPLICATE" as const,
    label: "ডুপ্লিকেট প্রশ্ন",
    description: "একই প্রশ্ন প্রশ্নব্যাংকে একাধিকবার রয়েছে",
  },
  {
    type: "OTHER" as const,
    label: "অন্যান্য সমস্যা",
    description: "অন্য যেকোনো ধরনের অসঙ্গতি বা কারিগরি ত্রুটি",
  },
]

type ReportType = (typeof REPORT_REASONS)[number]["type"]

export const QuestionReportModal: React.FC = () => {
  const { isOpen, target, closeReport } = useQuestionReportStore()
  const [selectedType, setSelectedType] = useState<ReportType>("INCORRECT_ANSWER")
  const [description, setDescription] = useState("")

  const reportMutation = useMutation(
    trpc.questionReport.createReport.mutationOptions({
      onSuccess: () => {
        toast.success("আপনার রিপোর্ট সফলভাবে জমা হয়েছে। ধন্যবাদ!")
        handleClose()
      },
      onError: (err) => {
        toast.error(err.message || "রিপোর্ট পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।")
      },
    })
  )

  useEffect(() => {
    if (isOpen) {
      setSelectedType("INCORRECT_ANSWER")
      setDescription("")
    }
  }, [isOpen])

  const handleClose = () => {
    setDescription("")
    setSelectedType("INCORRECT_ANSWER")
    closeReport()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!target) return

    const trimmed = description.trim()
    if (trimmed.length < 5) {
      toast.error("অনুগ্রহ করে সমস্যার বিবরণ অন্তত ৫ অক্ষরের মধ্যে লিখুন।")
      return
    }

    reportMutation.mutate({
      entityType: target.entityType,
      entityId: target.entityId,
      reportType: selectedType,
      description: trimmed,
    })
  }

  if (!target) return null

  const isPending = reportMutation.isPending

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6 bg-card border border-border shadow-2xl font-display text-foreground">
        <DialogHeader className="pb-3 border-b border-border/50 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-headline text-foreground">
                প্রশ্নের ত্রুটি রিপোর্ট করুন
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-body mt-0.5">
                প্রশ্নটিতে কোনো ভুল বা অসঙ্গতি থাকলে আমাদের জানান
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold font-headline text-foreground flex items-center justify-between">
              <span>ত্রুটির ধরন নির্বাচন করুন</span>
              <span className="text-[11px] text-muted-foreground font-normal font-body">*বাধ্যতামূলক</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REPORT_REASONS.map((reason) => {
                const isSelected = selectedType === reason.type
                return (
                  <button
                    key={reason.type}
                    type="button"
                    onClick={() => setSelectedType(reason.type)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1",
                      isSelected
                        ? "bg-rose-50/80 dark:bg-rose-950/30 border-rose-400 dark:border-rose-800 ring-1 ring-rose-400/40"
                        : "bg-card border-border/70 hover:border-border hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={cn(
                        "text-xs font-bold font-headline",
                        isSelected ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                      )}>
                        {reason.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-body leading-tight">
                      {reason.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="report-description" className="text-xs font-bold font-headline text-foreground">
                বিস্তারিত বিবরণ
              </label>
              <span className="text-[11px] text-muted-foreground font-body">
                {description.length}/1000
              </span>
            </div>

            <Textarea
              id="report-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="সমস্যাটির বিস্তারিত লিখুন (যেমন: সঠিক উত্তর কী হওয়া উচিত বা কোথায় অসঙ্গতি রয়েছে)..."
              maxLength={1000}
              className="resize-none text-xs font-body leading-relaxed bg-background border-border/80 focus:border-rose-400 rounded-xl"
              required
            />
            {description.length > 0 && description.trim().length < 5 && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1 font-body">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>কমপক্ষে ৫টি অক্ষর লিখুন</span>
              </p>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-border/50 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isPending}
              className="h-9 px-4 text-xs font-medium cursor-pointer rounded-xl"
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || description.trim().length < 5}
              className="h-9 px-5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer gap-1.5 transition-all shadow-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>জমা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Flag className="w-3.5 h-3.5" />
                  <span>রিপোর্ট পাঠান</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

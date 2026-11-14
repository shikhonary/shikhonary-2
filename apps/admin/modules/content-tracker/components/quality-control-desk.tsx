"use client"

import * as React from "react"
import { useState } from "react"
import { Switch } from "@workspace/ui/components/switch"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Textarea } from "@workspace/ui/components/textarea"
import { RenderMath } from "@workspace/ui/components/render-math"
import { QuestionAttachments } from "@workspace/ui/components/question-attachments"
import { toast } from "@workspace/ui/components/sonner"
import {
  QuestionCardHeader,
  QuestionCardFooter,
} from "@/components/shared"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { DataTableEmptyState } from "@/components/shared/data-table-empty-state"
import { ResolveReportDialog } from "@/components/shared/resolve-report-dialog"
import {
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Check,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { toBengaliDigits } from "@workspace/utils"
import {
  useContentTrackerQualityQueue,
  useContentTrackerToggleQuestionActive,
  useContentTrackerResolveReport,
} from "../services/use-content-tracker"

interface QualityControlDeskProps {
  subjectId: string
  chapterId?: string
  statusFilter?: string
  page: number
  limit: number
  onPageChange: (newPage: number) => void
  onLimitChange?: (newLimit: number) => void
}

export function QualityControlDesk({
  subjectId,
  chapterId,
  statusFilter = "All",
  page,
  limit,
  onPageChange,
  onLimitChange,
}: QualityControlDeskProps) {
  // Dialog state for deactivation note
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false)
  const [activeToggleTarget, setActiveToggleTarget] = useState<{
    id: string
    entityType: "MCQ" | "CQ" | "SHORT_ANSWER"
    nextState: boolean
  } | null>(null)
  const [deactivateReason, setDeactivateReason] = useState("")

  // Target item for resolve dialog
  const [resolveTarget, setResolveTarget] = useState<any | null>(null)

  const { data, isLoading, refetch } = useContentTrackerQualityQueue({
    subjectId: subjectId === "All" ? undefined : subjectId,
    chapterId: chapterId === "All" ? undefined : chapterId,
    entityType: "ALL",
    filter: (statusFilter === "INACTIVE" || statusFilter === "FLAGGED") ? statusFilter : "ALL",
    page,
    limit,
  })

  const toggleActiveMutation = useContentTrackerToggleQuestionActive()
  const resolveReportMutation = useContentTrackerResolveReport()

  const handleToggleClick = (
    id: string,
    entityType: "MCQ" | "CQ" | "SHORT_ANSWER",
    currentState: boolean,
  ) => {
    const nextState = !currentState
    if (!nextState) {
      setActiveToggleTarget({ id, entityType, nextState })
      setDeactivateReason("")
      setDeactivateModalOpen(true)
    } else {
      executeToggle(id, entityType, true)
    }
  }

  const executeToggle = async (
    id: string,
    entityType: "MCQ" | "CQ" | "SHORT_ANSWER",
    isActive: boolean,
    note?: string,
  ) => {
    try {
      await toggleActiveMutation.mutateAsync({
        entityId: id,
        entityType,
        isActive,
        note: note || undefined,
      })
      toast.success(
        isActive
          ? "প্রশ্নটি সক্রিয় এবং প্রকাশিত করা হয়েছে!"
          : "প্রশ্নটি নিষ্ক্রিয় করা হয়েছে এবং কারণ সংরক্ষণ করা হয়েছে।",
      )
      refetch()
    } catch (err: any) {
      toast.error(err?.message || "স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে")
    }
  }

  const confirmDeactivate = async () => {
    if (!activeToggleTarget) return
    await executeToggle(
      activeToggleTarget.id,
      activeToggleTarget.entityType,
      false,
      deactivateReason.trim(),
    )
    setDeactivateModalOpen(false)
    setActiveToggleTarget(null)
  }

  const handleConfirmResolve = async (resolvedNote?: string) => {
    if (!resolveTarget) return
    try {
      const rep = resolveTarget.pendingReports?.[0]
      if (rep) {
        await resolveReportMutation.mutateAsync({
          reportId: rep.id,
          resolvedNote: resolvedNote || "Verified and fixed during content quality proofreading.",
        })
      }
      toast.success("রিপোর্টটি সফলভাবে সমাধান করা হয়েছে।")
      setResolveTarget(null)
      refetch()
    } catch (err: any) {
      toast.error(err?.message || "রিপোর্ট সমাধান করতে সমস্যা হয়েছে")
    }
  }

  const items = data?.items ?? []
  const pagination = data?.pagination

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-12 text-center shadow-xs">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 dark:border-primary border-t-transparent mx-auto" />
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-3">
          প্রশ্ন ও প্রুফিং কিউ লোড হচ্ছে...
        </p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-12 text-center space-y-3 shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground font-headline">
          কোনো ত্রুটি বা নিষ্ক্রিয় প্রশ্ন নেই!
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto font-body">
          নির্বাচিত বিষয়ের সকল প্রশ্ন সক্রিয় ও পরীক্ষিত অবস্থায় রয়েছে। কোনো অমীমাংসিত রিপোর্ট নেই।
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cards list matching MCQ table style */}
      <div className="space-y-4">
        {items.map((q, idx) => {
          const globalIndex = (page - 1) * limit + idx + 1
          const hasOpenReports = q.pendingReports && q.pendingReports.length > 0

          return (
            <div
              key={q.id}
              className={cn(
                "rounded-2xl border p-4 sm:p-5 shadow-xs transition-all space-y-3.5",
                !q.isActive
                  ? "border-amber-300 dark:border-amber-800/60 bg-amber-50/[0.15] dark:bg-amber-950/[0.08]"
                  : "border-slate-200/80 dark:border-white/[0.08] bg-card hover:border-slate-300 dark:hover:border-white/[0.15]",
              )}
            >
              {/* Question Card Header from Design System */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 dark:border-white/[0.06] pb-3">
                <QuestionCardHeader
                  globalIndex={globalIndex}
                  subjectName={q.subject?.nameBn || q.subject?.nameEn}
                  chapterName={q.chapter?.nameBn || q.chapter?.nameEn}
                  isMath={q.isMath}
                >
                  <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-muted-foreground rounded-lg text-xs font-semibold font-mono">
                    {q.type || q.entityType}
                  </span>
                </QuestionCardHeader>

                {/* Quality Gatekeeper: isActive Toggle */}
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs font-bold font-body",
                      q.isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400",
                    )}
                  >
                    {q.isActive ? "সক্রিয় (Active)" : "নিষ্ক্রিয় (Inactive)"}
                  </span>
                  <Switch
                    checked={q.isActive}
                    onCheckedChange={() =>
                      handleToggleClick(q.id, q.entityType, q.isActive)
                    }
                    disabled={toggleActiveMutation.isPending}
                    aria-label="Toggle active status"
                  />
                </div>
              </div>

              {/* Question Stem */}
              <div className="text-sm font-semibold text-foreground leading-relaxed font-headline">
                <RenderMath text={q.question} isMath={q.isMath} />
              </div>

              {/* Statements if MULTIPLE question */}
              {Array.isArray(q.statements) && q.statements.length > 0 && (
                <div className="space-y-1.5 pl-3 border-l-2 border-indigo-400/60 dark:border-primary/60 text-xs sm:text-sm font-body">
                  {q.statements.map((stmt: string, sIdx: number) => (
                    <div key={sIdx} className="text-foreground">
                      <span className="font-bold font-mono mr-1 text-muted-foreground">
                        {["i", "ii", "iii", "iv"][sIdx]}.
                      </span>
                      <RenderMath text={stmt} isMath={q.isMath} />
                    </div>
                  ))}
                </div>
              )}

              {/* Attachments Section */}
              {Array.isArray(q.attachments) && q.attachments.length > 0 && (
                <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-3.5">
                  <QuestionAttachments
                    attachments={q.attachments}
                    isMath={q.isMath}
                    compact
                  />
                </div>
              )}

              {/* MCQ Options with Emerald Answer Highlight */}
              {Array.isArray(q.options) && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {q.options.map((opt: string, oIdx: number) => {
                    const isCorrect =
                      opt.trim() === q.answer?.trim() ||
                      (q.answer &&
                        opt.trim().toLowerCase() === q.answer.trim().toLowerCase())

                    return (
                      <div
                        key={oIdx}
                        className={cn(
                          "p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-body flex items-start gap-2.5 transition-colors",
                          isCorrect
                            ? "border-emerald-500/80 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 font-semibold"
                            : "border-slate-200/80 dark:border-white/[0.08] bg-slate-50/40 dark:bg-white/[0.02] text-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                            isCorrect
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-muted-foreground",
                          )}
                        >
                          {["ক", "খ", "গ", "ঘ"][oIdx]}
                        </span>
                        <div className="flex-1 min-w-0 leading-snug">
                          <RenderMath text={opt} isMath={q.isMath} />
                        </div>
                        {isCorrect && (
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Open Issue Reports */}
              {hasOpenReports && (
                <div className="space-y-2 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 font-headline">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>চিহ্নিত ত্রুটি / প্রতিবেদন (Pending Report):</span>
                  </div>
                  {q.pendingReports.map((rep: any) => (
                    <div
                      key={rep.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1 border-t border-amber-200/60 dark:border-amber-800/40"
                    >
                      <div className="space-y-0.5 text-foreground font-body">
                        <span className="font-mono text-[11px] text-amber-700 dark:text-amber-400 font-bold mr-1.5">
                          [{rep.reportType}]
                        </span>
                        <span>{rep.description}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setResolveTarget(q)}
                        className="h-7 px-3 text-xs rounded-lg border-amber-300/80 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-100 font-semibold shrink-0 cursor-pointer"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        <span>রিপোর্ট সমাধান</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Question Card Footer from Design System */}
              <QuestionCardFooter references={q.reference} />
            </div>
          )
        })}
      </div>

      {/* Pagination from Design System */}
      {pagination && pagination.total > 0 && (
        <DataTablePagination
          page={page}
          limit={limit}
          totalItems={pagination.total}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          entityName="প্রশ্ন"
        />
      )}

      {/* Reusable Resolve Report Dialog */}
      <ResolveReportDialog
        isOpen={Boolean(resolveTarget)}
        onClose={() => setResolveTarget(null)}
        entityName="প্রশ্ন"
        entityDetails={
          resolveTarget
            ? {
                subjectName:
                  resolveTarget.subject?.nameBn || resolveTarget.subject?.nameEn,
                chapterName:
                  resolveTarget.chapter?.nameBn || resolveTarget.chapter?.nameEn,
                clueText: resolveTarget.question,
              }
            : undefined
        }
        reports={resolveTarget?.pendingReports}
        onConfirmResolve={handleConfirmResolve}
        isLoading={resolveReportMutation.isPending}
      />

      {/* Deactivation Reason Dialog */}
      <Dialog open={deactivateModalOpen} onOpenChange={setDeactivateModalOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 font-headline text-base">
              <AlertTriangle className="h-5 w-5" />
              <span>প্রশ্ন নিষ্ক্রিয় করুন ও কারণ নথিভুক্ত করুন</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-body">
              এই প্রশ্নটি নিষ্ক্রিয় করলে শিক্ষার্থীদের পরীক্ষার প্রশ্নপত্র তৈরি থেকে এটি বাদ থাকবে। পর্যালোচনার কারণ লিখে রাখলে ভবিষ্যতে দ্রুত সংশোধন করা যাবে।
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-xs font-semibold text-foreground font-body">
              ত্রুটি বা পর্যালোচনার কারণ (ঐচ্ছিক):
            </label>
            <Textarea
              placeholder="যেমন: অপশন 'খ'-তে বানান ভুল, অথবা সূত্রে KaTeX সিনট্যাক্স অমিল..."
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
              rows={3}
              className="text-xs rounded-xl resize-none font-body"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeactivateModalOpen(false)}
              className="rounded-xl text-xs font-semibold"
            >
              বাতিল
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDeactivate}
              disabled={toggleActiveMutation.isPending}
              className="rounded-xl text-xs font-semibold"
            >
              নিষ্ক্রিয় নিশ্চিত করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

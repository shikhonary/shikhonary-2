"use client"

import * as React from "react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Edit3,
  Clock,
  FileText,
} from "lucide-react"
import { toBengaliDigits } from "@workspace/utils/helpers/bengali"

export interface QuestionReportItem {
  id?: string
  entityId?: string
  status?: string
  reportType: string
  description: string
  resolvedNote?: string | null
  resolvedAt?: Date | string | null
  createdAt?: Date | string
  resolver?: {
    id: string
    name?: string | null
    email?: string | null
  } | null
}

export interface ResolveReportDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  entityName?: string
  entityDetails?: {
    subjectName?: string | null
    chapterName?: string | null
    className?: string | null
    clueText?: string | null
    editHref?: string | null
    editLabel?: string
  }
  reports?: QuestionReportItem[]
  onConfirmResolve: (resolvedNote?: string) => Promise<void> | void
  isLoading?: boolean
  confirmLabel?: string
  cancelLabel?: string
}

export function ResolveReportDialog({
  isOpen,
  onClose,
  title,
  entityName = "প্রশ্ন",
  entityDetails,
  reports = [],
  onConfirmResolve,
  isLoading = false,
  confirmLabel = "রিপোর্ট সমাধান করুন",
  cancelLabel,
}: ResolveReportDialogProps) {
  const [resolvedNote, setResolvedNote] = React.useState("")

  React.useEffect(() => {
    if (isOpen) {
      setResolvedNote("")
    }
  }, [isOpen])

  const pendingReports = reports.filter((r) => r.status === "PENDING")
  const resolvedReports = reports.filter((r) => r.status === "RESOLVED")
  const hasPending = pendingReports.length > 0

  const handleResolve = async () => {
    await onConfirmResolve(resolvedNote.trim() || undefined)
  }

  const formatReportType = (type: string) => {
    switch (type) {
      case "MISSING_IMAGE":
        return "চিত্র / ডায়াগ্রাম অনুপস্থিত"
      case "WRONG_ANSWER":
        return "ভুল উত্তর / অপশন"
      case "TYPO":
        return "বানান / টাইপিং ত্রুটি"
      default:
        return type
    }
  }

  const formatDate = (dateVal?: Date | string | null) => {
    if (!dateVal) return "—"
    try {
      const d = new Date(dateVal)
      return d.toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return String(dateVal)
    }
  }

  const defaultCancelLabel = cancelLabel ?? (hasPending ? "বাতিল" : "বন্ধ করুন")

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent
        showCloseButton={!isLoading}
        style={{ minWidth: "320px", maxWidth: "560px", width: "calc(100vw - 2rem)" }}
        className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-5 sm:p-6 shadow-xl text-left gap-4 font-body"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className={`flex size-11 items-center justify-center rounded-xl shrink-0 ${
              hasPending
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {hasPending ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
          </div>
          <div>
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground font-headline">
              {title ?? (hasPending ? `${entityName} রিপোর্ট সমাধান` : `${entityName} রিপোর্ট হিস্ট্রি`)}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              {hasPending
                ? `${toBengaliDigits(pendingReports.length)}টি অমীমাংসিত রিপোর্ট সমাধান করুন`
                : "এই রেকর্ডের সকল রিপোর্ট ইতিমধ্যে সমাধান করা হয়েছে"}
            </p>
          </div>
        </div>

        {/* Entity Clue / Context */}
        {entityDetails && (
          <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] p-3 text-xs space-y-1">
            <div className="flex items-center justify-between gap-2 flex-wrap text-muted-foreground">
              {entityDetails.subjectName && (
                <span className="font-bold text-slate-800 dark:text-slate-200 font-headline">
                  বিষয়: {entityDetails.subjectName}
                </span>
              )}
              {entityDetails.chapterName && (
                <span className="text-[11px]">
                  অধ্যায়: {entityDetails.chapterName}
                </span>
              )}
              {entityDetails.className && (
                <span className="text-[11px]">
                  শ্রেণি: {entityDetails.className}
                </span>
              )}
            </div>
            {entityDetails.clueText && (
              <p className="line-clamp-2 text-foreground/80 font-medium pt-0.5">
                {entityDetails.clueText}
              </p>
            )}
          </div>
        )}

        {/* Reports List */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          <span className="text-xs font-bold text-foreground font-headline block">
            রিপোর্টের তালিকা ({toBengaliDigits(reports.length)}টি):
          </span>

          {reports.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">
              কোনো বিস্তারিত রিপোর্ট তথ্য পাওয়া যায়নি।
            </p>
          ) : (
            reports.map((report, idx) => {
              const isRepPending = report.status === "PENDING"
              return (
                <div
                  key={report.id || idx}
                  className={`rounded-xl border p-3 text-xs space-y-1.5 transition-colors ${
                    isRepPending
                      ? "border-rose-200/80 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20"
                      : "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold text-foreground font-headline flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      {formatReportType(report.reportType)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        isRepPending
                          ? "bg-rose-100 text-rose-700 border-rose-300/60 dark:bg-rose-950 dark:text-rose-400"
                          : "bg-emerald-100 text-emerald-700 border-emerald-300/60 dark:bg-emerald-950 dark:text-emerald-400"
                      }`}
                    >
                      {isRepPending ? "⚠️ অমীমাংসিত" : "✅ সমাধানকৃত"}
                    </span>
                  </div>

                  <p className="text-foreground/90 leading-relaxed font-body">
                    {report.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground border-t border-slate-200/60 dark:border-white/[0.04]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      রিপোর্টের তারিখ: {formatDate(report.createdAt)}
                    </span>

                    {!isRepPending && report.resolvedAt && (
                      <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        সমাধান: {formatDate(report.resolvedAt)}
                      </span>
                    )}
                  </div>

                  {!isRepPending && report.resolvedNote && (
                    <div className="text-[11px] bg-white/70 dark:bg-black/20 rounded-md p-2 mt-1 border border-emerald-200/40 text-emerald-900 dark:text-emerald-300">
                      <span className="font-bold block">সমাধান নোট:</span>
                      <span>{report.resolvedNote}</span>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Resolution Note Input (only when pending reports exist) */}
        {hasPending && (
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-foreground font-headline flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-primary" />
              <span>সমাধান নোট (Resolution Note - ঐচ্ছিক)</span>
            </label>
            <Textarea
              value={resolvedNote}
              onChange={(e) => setResolvedNote(e.target.value)}
              placeholder="যেমন: প্রয়োজনীয় চিত্র বা অপশন সংশোধন করা হয়েছে এবং তথ্য যাচাই করা হয়েছে..."
              rows={3}
              className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Dialog Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200/80 dark:border-white/[0.06]">
          {entityDetails?.editHref ? (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-xl text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground h-9 cursor-pointer"
            >
              <Link href={entityDetails.editHref} prefetch={true}>
                <Edit3 className="w-3.5 h-3.5" />
                <span>{entityDetails.editLabel ?? "এডিট পেজে যান"}</span>
              </Link>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border-slate-200 dark:border-white/[0.08] px-3.5 h-9 text-xs font-semibold cursor-pointer"
            >
              {defaultCancelLabel}
            </Button>

            {hasPending && (
              <Button
                type="button"
                size="sm"
                onClick={handleResolve}
                disabled={isLoading}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-4 text-xs gap-1.5 cursor-pointer shadow-xs font-headline"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>সমাধান করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{confirmLabel}</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

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
import { Input } from "@workspace/ui/components/input"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  UserCheck,
  UserPlus,
  AlertTriangle,
  Loader2,
  Edit3,
  Clock,
  FileText,
  Search,
  Check,
  Shield,
  Layers,
} from "lucide-react"
import { toBengaliDigits } from "@workspace/utils/helpers/bengali"
import { useUsersForSelection } from "@/modules/user/services/use-user"
import type { QuestionReportItem } from "./resolve-report-dialog"

export type { QuestionReportItem }

export interface AssigneeOption {
  id: string
  name?: string | null
  email?: string | null
  phoneNumber?: string | null
  image?: string | null
  roles?: { id?: string; name: string }[] | string[] | null
}

export interface AssignReportDialogProps {
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
  assignees?: AssigneeOption[]
  defaultAssigneeId?: string | null
  onConfirmAssign: (data: {
    assigneeId: string
    note?: string
    reportId?: string
  }) => Promise<void> | void
  isLoading?: boolean
  confirmLabel?: string
  cancelLabel?: string
}

export function AssignReportDialog({
  isOpen,
  onClose,
  title,
  entityName = "প্রশ্ন",
  entityDetails,
  reports = [],
  assignees: externalAssignees,
  defaultAssigneeId,
  onConfirmAssign,
  isLoading = false,
  confirmLabel = "রিপোর্ট অ্যাসাইন করুন",
  cancelLabel = "বাতিল",
}: AssignReportDialogProps) {
  const [selectedAssigneeId, setSelectedAssigneeId] = React.useState<string>(
    defaultAssigneeId ?? ""
  )
  const [selectedReportId, setSelectedReportId] = React.useState<string>("all")
  const [assignmentNote, setAssignmentNote] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")

  // Fetch users automatically if no external assignees list is provided
  const { data: fetchedUsers = [], isLoading: isUsersLoading } =
    useUsersForSelection(
      externalAssignees
        ? {}
        : {
            query: searchQuery.trim() || undefined,
            limit: 50,
          }
    )

  // Use external assignees when supplied, otherwise fallback to fetched users
  const assigneesList: AssigneeOption[] = React.useMemo(() => {
    if (externalAssignees) {
      if (!searchQuery.trim()) return externalAssignees
      const q = searchQuery.toLowerCase().trim()
      return externalAssignees.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phoneNumber?.toLowerCase().includes(q)
      )
    }
    return (fetchedUsers as AssigneeOption[]) || []
  }, [externalAssignees, fetchedUsers, searchQuery])

  // Reset state on dialog open
  React.useEffect(() => {
    if (isOpen) {
      setSelectedAssigneeId(defaultAssigneeId ?? "")
      setAssignmentNote("")
      setSearchQuery("")
      setSelectedReportId("all")
    }
  }, [isOpen, defaultAssigneeId])

  const pendingReports = reports.filter((r) => r.status === "PENDING")
  const assignedReports = reports.filter((r) => r.status === "ASSIGNED")
  const hasActiveReports = pendingReports.length > 0 || assignedReports.length > 0

  const handleAssign = async () => {
    if (!selectedAssigneeId) return
    await onConfirmAssign({
      assigneeId: selectedAssigneeId,
      note: assignmentNote.trim() || undefined,
      reportId: selectedReportId === "all" ? undefined : selectedReportId,
    })
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

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ")
      if (parts.length >= 2) {
        return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase()
      }
      return name.slice(0, 2).toUpperCase()
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  const formatRoleBadge = (roles?: AssigneeOption["roles"]) => {
    if (!roles) return null
    if (Array.isArray(roles) && roles.length > 0) {
      const roleItem = roles[0]
      const roleName =
        typeof roleItem === "string" ? roleItem : roleItem?.name ?? ""
      switch (roleName) {
        case "SUPER_ADMIN":
          return "সুপার অ্যাডমিন"
        case "ADMIN":
          return "অ্যাডমিন"
        case "MODERATOR":
          return "মডারেটর"
        case "TEACHER":
          return "শিক্ষক"
        case "EDITOR":
          return "এডিটর"
        default:
          return roleName
      }
    }
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent
        showCloseButton={!isLoading}
        style={{ minWidth: "320px", maxWidth: "600px", width: "calc(100vw - 2rem)" }}
        className="max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-5 sm:p-6 shadow-xl text-left gap-4 font-body"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl shrink-0 bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground font-headline">
              {title ?? `${entityName} রিপোর্ট অ্যাসাইন করুন`}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              {hasActiveReports
                ? `${toBengaliDigits(pendingReports.length || assignedReports.length || reports.length)}টি রিপোর্টের দায়িত্ব দেওয়ার জন্য সদস্য নির্বাচন করুন`
                : "পর্যালোচনা বা সংশোধনের দায়িত্ব অর্পণ করতে সদস্য নির্বাচন করুন"}
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

        {/* Reports Preview / Selector */}
        {reports.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-foreground font-headline flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                রিপোর্টের তালিকা ({toBengaliDigits(reports.length)}টি):
              </span>

              {reports.length > 1 && (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <label htmlFor="report-scope-select" className="text-muted-foreground">
                    আওতা:
                  </label>
                  <select
                    id="report-scope-select"
                    value={selectedReportId}
                    onChange={(e) => setSelectedReportId(e.target.value)}
                    className="rounded-lg border border-slate-200 dark:border-white/[0.08] bg-background px-2 py-1 text-xs font-medium cursor-pointer"
                  >
                    <option value="all">সকল রিপোর্ট ({toBengaliDigits(reports.length)}টি)</option>
                    {reports.map((rep, idx) => (
                      <option key={rep.id || idx} value={rep.id || String(idx)}>
                        রিপোর্ট {toBengaliDigits(idx + 1)}: {formatReportType(rep.reportType)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {reports.map((report, idx) => {
                const isRepPending = report.status === "PENDING"
                const isRepAssigned = report.status === "ASSIGNED"
                const isTargetSelected =
                  selectedReportId === "all" ||
                  selectedReportId === report.id ||
                  selectedReportId === String(idx)

                return (
                  <div
                    key={report.id || idx}
                    className={`rounded-xl border p-2.5 text-xs space-y-1 transition-all ${
                      isTargetSelected
                        ? "border-blue-300 dark:border-blue-700/60 bg-blue-50/20 dark:bg-blue-950/20"
                        : "opacity-60 border-slate-200 dark:border-white/[0.06] bg-slate-50/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-foreground font-headline flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        {formatReportType(report.reportType)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          isRepPending
                            ? "bg-rose-100 text-rose-700 border-rose-300/60 dark:bg-rose-950 dark:text-rose-400"
                            : isRepAssigned
                              ? "bg-blue-100 text-blue-700 border-blue-300/60 dark:bg-blue-950 dark:text-blue-400"
                              : "bg-emerald-100 text-emerald-700 border-emerald-300/60 dark:bg-emerald-950 dark:text-emerald-400"
                        }`}
                      >
                        {isRepPending
                          ? "⚠️ অমীমাংসিত"
                          : isRepAssigned
                            ? `👤 অ্যাসাইনকৃত: ${report.resolver?.name || "সদস্য"}`
                            : "✅ সমাধানকৃত"}
                      </span>
                    </div>
                    <p className="text-foreground/90 leading-relaxed font-body line-clamp-2">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-blue-200/80 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/10 p-3 text-xs text-muted-foreground flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              এই রেকর্ডে কোনো পূর্ববর্তী রিপোর্ট নেই। পর্যালোচনা বা সংশোধনের জন্য সরাসরি সদস্য নির্বাচন করে দায়িত্ব অর্পণ করতে পারেন।
            </span>
          </div>
        )}

        {/* Assignee Selection Section */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground font-headline flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>দায়িত্বপ্রাপ্ত সদস্য নির্বাচন করুন *</span>
            </label>
            {selectedAssigneeId && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> ১ জন নির্বাচিত
              </span>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, ইমেইল বা ফোন দিয়ে সদস্য খুঁজুন..."
              disabled={isLoading}
              className="pl-9 h-9 text-xs rounded-xl border-slate-200/80 dark:border-white/[0.08]"
            />
          </div>

          {/* Users List */}
          <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] p-1.5 bg-slate-50/40 dark:bg-white/[0.02]">
            {isUsersLoading && !externalAssignees ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>ব্যবহারকারীদের তালিকা লোড হচ্ছে...</span>
              </div>
            ) : assigneesList.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground italic">
                কোনো সদস্য পাওয়া যায়নি।
              </div>
            ) : (
              assigneesList.map((user) => {
                const isSelected = selectedAssigneeId === user.id
                const roleBadge = formatRoleBadge(user.roles)

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedAssigneeId(user.id)}
                    className={`w-full flex items-center justify-between gap-3 p-2 rounded-xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700/60 ring-1 ring-blue-500/20"
                        : "border-transparent hover:bg-slate-100/70 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="size-8 rounded-full border border-slate-200 dark:border-white/[0.08]">
                        {user.image && <AvatarImage src={user.image} alt={user.name || "User"} />}
                        <AvatarFallback className="text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {getInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-foreground truncate font-headline">
                            {user.name || "নামহীন ব্যবহারকারী"}
                          </span>
                          {roleBadge && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-medium">
                              {roleBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {user.email || user.phoneNumber || "তথ্য নেই"}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`size-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                          : "border-slate-300 dark:border-white/20 bg-background"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Assignment Note Input */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold text-foreground font-headline flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>অ্যাসাইন সংক্রান্ত নির্দেশনা / নোট (ঐচ্ছিক)</span>
          </label>
          <Textarea
            value={assignmentNote}
            onChange={(e) => setAssignmentNote(e.target.value)}
            placeholder="যেমন: অপশন বা বানানের ত্রুটি যাচাই করে সঠিক তথ্য যুক্ত করুন..."
            rows={2}
            className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            disabled={isLoading}
          />
        </div>

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
              {cancelLabel}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleAssign}
              disabled={isLoading || !selectedAssigneeId}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4 text-xs gap-1.5 cursor-pointer shadow-xs font-headline disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>অ্যাসাইন করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{confirmLabel}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

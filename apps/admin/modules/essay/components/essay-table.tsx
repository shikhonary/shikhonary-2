"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import {
  QuestionCardHeader,
  QuestionCardFooter,
  QuestionCardActions,
  type QuestionReportItem,
} from "@/components/shared"
import { toBengaliDigits } from "@workspace/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@workspace/ui/components/dropdown-menu"
import {
  Trash2,
  ScrollText,
  Plus,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Flag,
  ChevronDown,
} from "lucide-react"

export type { QuestionReportItem }

export interface EssayItem {
  id: string
  title: string
  reference: string[]
  source?: string | null
  session?: string | null
  difficulty?: string | null
  popularityCount?: number
  isActive: boolean
  hasReport?: boolean
  reports?: QuestionReportItem[]
  createdAt: Date | string
  updatedAt: Date | string
  subject: {
    id: string
    nameEn: string
    nameBn: string
    classSubjects?: {
      academicClass?: {
        id: string
        nameEn: string
        nameBn: string
      } | null
    }[]
  }
  questionType?: {
    id: string
    nameEn: string
    nameBn: string
    label?: string | null
    mark?: number | null
  } | null
}

interface EssayTableProps {
  items: EssayItem[]
  isLoading: boolean
  isError: boolean
  onDelete: (id: string, titleSnippet: string) => void
  onBulkDelete: (selectedIds: string[]) => void
  onResolveReport?: (item: EssayItem) => void
  onAssignReport?: (item: EssayItem) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export function EssayTable({
  items,
  isLoading,
  isError,
  onDelete,
  onBulkDelete,
  onResolveReport,
  onAssignReport,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onLimitChange,
}: EssayTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map((item) => item.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id))
    }
  }

  const allSelected =
    items.length > 0 && items.every((item) => selectedIds.includes(item.id))

  return (
    <div className="w-full space-y-6">
      {/* Selection Toolbar */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card p-3 sm:p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
              />
              <span className="text-xs font-bold text-foreground font-headline">
                সবগুলো নির্বাচন করুন ({toBengaliDigits(items.length)}টি)
              </span>
            </label>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-white/[0.08]">
                <span className="text-xs font-semibold text-indigo-600 dark:text-primary font-body">
                  {toBengaliDigits(selectedIds.length)}টি নির্বাচিত
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onBulkDelete(selectedIds)
                    setSelectedIds([])
                  }}
                  className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>নির্বাচিতগুলো মুছুন</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.06] p-6 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-white/10" />
                <div className="h-5 w-24 bg-slate-200 dark:bg-white/10 rounded-lg" />
                <div className="h-5 w-32 bg-slate-200 dark:bg-white/10 rounded-lg" />
              </div>
              <div className="h-16 w-full bg-slate-100 dark:bg-white/[0.04] rounded-xl border border-slate-200/60" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="overflow-hidden rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/20 dark:bg-red-950/10 shadow-xs p-12 text-center text-red-600 font-headline">
          <ScrollText className="h-10 w-10 mx-auto text-red-500 mb-3" />
          <p className="text-base font-bold">প্রবন্ধ ও রচনা লোড করা সম্ভব হয়নি।</p>
          <p className="text-xs text-muted-foreground mt-1 font-body">
            অনুগ্রহ করে পৃষ্ঠাটি রিলোড দিন অথবা কিছুক্ষণ পর চেষ্টা করুন।
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs py-16 px-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 text-indigo-600 dark:text-primary mx-auto flex items-center justify-center mb-4 shadow-sm shadow-indigo-100/50 dark:shadow-none">
            <ScrollText className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-foreground font-headline">
            কোনো প্রবন্ধ বা রচনা পাওয়া যায়নি
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
            ফিল্টার পরিবর্তন করে দেখুন অথবা প্রশ্ন ব্যাংকে নতুন প্রবন্ধ ও রচনা যুক্ত করুন।
          </p>
          <div className="mt-6">
            <Button
              asChild
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
            >
              <Link href="/essays/create" prefetch={true}>
                <Plus className="w-4 h-4" />
                <span>নতুন প্রবন্ধ যোগ করুন</span>
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Populated Question Cards List */}
      {!isLoading && !isError && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {items.map((item, idx) => {
            const isSelected = selectedIds.includes(item.id)
            const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1
            const snippet =
              item.title.length > 80 ? item.title.substring(0, 80) + "..." : item.title

            const itemReports = Array.isArray(item.reports) ? item.reports : []
            const pendingReports = itemReports.filter((r) => r.status === "PENDING")
            const assignedReports = itemReports.filter((r) => r.status === "ASSIGNED")
            const resolvedReports = itemReports.filter((r) => r.status === "RESOLVED")
            const hasPending =
              pendingReports.length > 0 ||
              (Boolean(item.hasReport) && assignedReports.length === 0)
            const isAssigned = assignedReports.length > 0
            const assignedName =
              assignedReports[0]?.resolver?.name || assignedReports[0]?.resolver?.email

            const classNames = item.subject?.classSubjects
              ?.map((cs) => cs.academicClass?.nameBn || cs.academicClass?.nameEn)
              .filter(Boolean)
            const className = classNames && classNames.length > 0 ? classNames.join(", ") : null

            return (
              <div
                key={item.id}
                className={cn(
                  "bg-card border rounded-2xl p-5 sm:p-6 transition-all duration-200 relative group shadow-xs hover:shadow-md",
                  isSelected
                    ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/15"
                    : "border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-300"
                )}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 sm:gap-6">
                  {/* Selection Checkbox & Main Info */}
                  <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0 w-full relative md:static">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                      className="absolute top-[6px] left-0 md:relative md:top-0 md:left-0 md:mt-1 h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer shrink-0"
                    />

                    <div className="flex-1 space-y-4 min-w-0">
                      {/* Shared Header Badges Row */}
                      <QuestionCardHeader
                        globalIndex={globalIndex}
                        academicClassName={className}
                        subjectName={item.subject?.nameBn || item.subject?.nameEn}
                      >
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 rounded-lg text-[11px] font-semibold border border-blue-200/60 dark:border-blue-800/40 font-body">
                          {item.questionType?.nameBn ||
                            item.questionType?.nameEn ||
                            "প্রবন্ধ রচনা"}
                        </span>

                        {!item.isActive && (
                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-lg text-[11px] font-bold border border-amber-200/60 dark:border-amber-800/40 font-body">
                            ইনঅ্যাক্টিভ
                          </span>
                        )}

                        {hasPending && !isAssigned && (
                          <button
                            type="button"
                            onClick={() => onResolveReport?.(item)}
                            className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-400 rounded-lg text-[11px] font-bold border border-rose-200/60 dark:border-rose-800/40 flex items-center gap-1 font-body cursor-pointer transition-colors"
                            title="রিপোর্ট দেখুন ও সমাধান করুন (Resolve Report)"
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            <span>
                              রিপোর্ট ({toBengaliDigits(pendingReports.length || itemReports.length || 1)})
                            </span>
                          </button>
                        )}

                        {isAssigned && (
                          <button
                            type="button"
                            onClick={() => onAssignReport?.(item)}
                            className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/60 text-blue-700 dark:text-blue-400 rounded-lg text-[11px] font-bold border border-blue-200/60 dark:border-blue-800/40 flex items-center gap-1 font-body cursor-pointer transition-colors"
                            title="অ্যাসাইন দেখুন বা পরিবর্তন করুন"
                          >
                            <UserCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span>
                              অ্যাসাইনকৃত
                              {assignedName
                                ? ` (${assignedName})`
                                : ` (${toBengaliDigits(assignedReports.length)})`}
                            </span>
                          </button>
                        )}

                        {!hasPending && !isAssigned && resolvedReports.length > 0 && (
                          <button
                            type="button"
                            onClick={() => onResolveReport?.(item)}
                            className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg text-[11px] font-bold border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1 font-body cursor-pointer transition-colors"
                            title="সমাধানকৃত রিপোর্ট হিস্ট্রি দেখুন"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>সমাধানকৃত ({toBengaliDigits(resolvedReports.length)})</span>
                          </button>
                        )}
                      </QuestionCardHeader>

                      {/* Essay Prompt Content */}
                      <Link
                        href={`/essays/${item.id}/edit`}
                        prefetch={true}
                        className="block rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4 text-slate-900 dark:text-foreground hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors"
                      >
                        <div className="font-body text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                          <RenderMath
                            text={item.title?.replace(/\\n/g, "\n")}
                            isMath={true}
                          />
                        </div>
                      </Link>

                      {/* Shared Footer */}
                      <QuestionCardFooter
                        source={item.source}
                        session={item.session}
                        references={item.reference}
                      />
                    </div>
                  </div>

                  {/* Actions Column */}
                  <QuestionCardActions
                    editHref={`/essays/${item.id}/edit`}
                    onDelete={() => onDelete(item.id, snippet)}
                    editTitle="প্রবন্ধ সম্পাদনা করুন"
                    deleteTitle="প্রবন্ধ মুছুন"
                  >
                    {(onAssignReport || onResolveReport) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border shadow-xs flex-1 md:flex-initial md:w-24 font-headline",
                              hasPending
                                ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/40 hover:border-rose-300"
                                : isAssigned
                                  ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/40 hover:border-blue-300"
                                  : resolvedReports.length > 0
                                    ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/40 hover:border-emerald-300"
                                    : "bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300"
                            )}
                            title="রিপোর্ট ও অ্যাসাইনমেন্ট অপশনসমূহ"
                          >
                            <Flag className="w-3.5 h-3.5 shrink-0" />
                            <span>রিপোর্ট</span>
                            <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
                          </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          className="w-56 rounded-2xl p-1.5 shadow-xl border border-slate-200/80 dark:border-white/[0.08] bg-card text-foreground"
                        >
                          {onAssignReport && (
                            <DropdownMenuItem
                              onClick={() => onAssignReport(item)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer normal-case tracking-normal hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 transition-colors"
                            >
                              <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                              <div className="flex flex-col text-left">
                                <span className="font-headline font-bold">
                                  {isAssigned ? "রিপোর্ট রি-অ্যাসাইন করুন" : "রিপোর্ট অ্যাসাইন করুন"}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-normal font-body">
                                  {isAssigned
                                    ? assignedName
                                      ? `বর্তমান: ${assignedName}`
                                      : "দায়িত্বপ্রাপ্ত সদস্য পরিবর্তন"
                                    : "পর্যালোচনার দায়িত্ব অর্পণ"}
                                </span>
                              </div>
                            </DropdownMenuItem>
                          )}

                          {onAssignReport && onResolveReport && (
                            <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-white/[0.06]" />
                          )}

                          {onResolveReport && (
                            <DropdownMenuItem
                              onClick={() => onResolveReport(item)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer normal-case tracking-normal hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300 transition-colors"
                            >
                              {hasPending ? (
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              )}
                              <div className="flex flex-col text-left">
                                <span className="font-headline font-bold">
                                  {hasPending ? "রিপোর্ট সমাধান করুন" : "রিপোর্ট হিস্ট্রি দেখুন"}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-normal font-body">
                                  {hasPending
                                    ? `${toBengaliDigits(pendingReports.length || 1)}টি অমীমাংসিত রিপোর্ট`
                                    : resolvedReports.length > 0
                                      ? `${toBengaliDigits(resolvedReports.length)}টি সমাধানকৃত রিপোর্ট`
                                      : "কোনো রিপোর্ট হিস্ট্রি নেই"}
                                </span>
                              </div>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </QuestionCardActions>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reusable Data Table Pagination */}
      {!isLoading && !isError && totalItems > 0 && (
        <DataTablePagination
          page={currentPage}
          limit={itemsPerPage}
          totalItems={totalItems}
          entityName="টি প্রবন্ধ ও রচনা"
          isLoading={isLoading}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  )
}

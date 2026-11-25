"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import {
  QuestionCardHeader,
  QuestionCardFooter,
  QuestionCardActions,
} from "@/components/shared"
import { toBengaliDigits } from "@workspace/utils"
import { Trash2, ArrowRightLeft, Plus } from "lucide-react"

export interface DanBamMilkoronItem {
  id: string
  leftColumn: string[]
  rightColumn: string[]
  difficulty: string
  reference: string[]
  popularityCount: number
  source?: string | null
  session?: string | null
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
  subject?: {
    id: string
    nameEn: string
    nameBn?: string
    classSubjects?: {
      academicClass?: {
        id: string
        nameEn: string
        nameBn: string
      } | null
    }[]
  } | null
  academicChapter?: {
    id: string
    nameEn: string
    nameBn?: string
  } | null
}

interface DanBamMilkoronTableProps {
  items: DanBamMilkoronItem[]
  isLoading: boolean
  isError: boolean
  onDelete: (id: string, snippet: string) => void
  onBulkDelete: (selectedIds: string[]) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

/**
 * Renders the 2 columns of Dan-Bam Milkoron in a clean bordered grid.
 */
export function DanBamMilkoronGrid({
  leftColumn = [],
  rightColumn = [],
}: {
  leftColumn: string[]
  rightColumn: string[]
}) {
  const maxRows = Math.max(leftColumn.length, rightColumn.length, 1)

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-card">
      <table className="w-full border-collapse text-left text-xs sm:text-sm">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-white/[0.03] border-b border-slate-200/80 dark:border-white/[0.08]">
            <th className="px-3.5 py-2 font-bold text-indigo-600 dark:text-primary border-r border-slate-200/80 dark:border-white/[0.08] w-1/2 text-xs uppercase tracking-wider font-headline">
              বাম পাশ (Left Column)
            </th>
            <th className="px-3.5 py-2 font-bold text-indigo-600 dark:text-primary w-1/2 text-xs uppercase tracking-wider font-headline">
              ডান পাশ (Right Column)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.06]">
          {Array.from({ length: maxRows }).map((_, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
              <td className="px-3.5 py-2 border-r border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 font-body align-top">
                {leftColumn[idx] ? <RenderMath text={leftColumn[idx]} isMath={true} /> : "—"}
              </td>
              <td className="px-3.5 py-2 text-slate-800 dark:text-slate-200 font-body align-top">
                {rightColumn[idx] ? <RenderMath text={rightColumn[idx]} isMath={true} /> : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DanBamMilkoronTable({
  items,
  isLoading,
  isError,
  onDelete,
  onBulkDelete,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onLimitChange,
}: DanBamMilkoronTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const searchParams = useSearchParams()
  const queryString = searchParams?.toString()
  const buildEditHref = (id: string) =>
    queryString ? `/dan-bam-milkoron/${id}/edit?${queryString}` : `/dan-bam-milkoron/${id}/edit`

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

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return (
          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg text-[11px] font-bold border border-emerald-200/60 dark:border-emerald-800/40 font-body">
            সহজ (Easy)
          </span>
        )
      case "HARD":
        return (
          <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-lg text-[11px] font-bold border border-rose-200/60 dark:border-rose-800/40 font-body">
            কঠিন (Hard)
          </span>
        )
      default:
        return (
          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-lg text-[11px] font-bold border border-amber-200/60 dark:border-amber-800/40 font-body">
            মাঝারি (Medium)
          </span>
        )
    }
  }

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
              <div className="h-28 w-full bg-slate-100 dark:bg-white/[0.04] rounded-xl border border-slate-200/60" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="overflow-hidden rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/20 dark:bg-red-950/10 shadow-xs p-12 text-center text-red-600 font-headline">
          <ArrowRightLeft className="h-10 w-10 mx-auto text-red-500 mb-3" />
          <p className="text-base font-bold">ডান-বাম মিলকরণ প্রশ্ন লোড করা সম্ভব হয়নি।</p>
          <p className="text-xs text-muted-foreground mt-1 font-body">
            অনুগ্রহ করে পৃষ্ঠাটি রিলোড দিন অথবা কিছুক্ষণ পর চেষ্টা করুন।
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs py-16 px-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 text-indigo-600 dark:text-primary mx-auto flex items-center justify-center mb-4 shadow-sm shadow-indigo-100/50 dark:shadow-none">
            <ArrowRightLeft className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-foreground font-headline">
            কোনো ডান-বাম মিলকরণ প্রশ্ন পাওয়া যায়নি
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
            ফিল্টার পরিবর্তন করে দেখুন অথবা প্রশ্ন ব্যাংকে নতুন ডান-বাম মিলকরণ যুক্ত করুন।
          </p>
          <div className="mt-6">
            <Button
              asChild
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
            >
              <Link href="/dan-bam-milkoron/create" prefetch={true}>
                <Plus className="w-4 h-4" />
                <span>নতুন মিলকরণ যোগ করুন</span>
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
            const firstRow = item.leftColumn?.[0] || "ডান-বাম মিলকরণ"
            const snippet = firstRow.length > 60 ? firstRow.substring(0, 60) + "..." : firstRow

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
                        chapterName={item.academicChapter?.nameBn || item.academicChapter?.nameEn}
                      >
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 rounded-lg text-[11px] font-semibold border border-blue-200/60 dark:border-blue-800/40 font-body">
                          ডান-বাম মিলকরণ
                        </span>
                        {getDifficultyBadge(item.difficulty)}
                        {!item.isActive && (
                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-lg text-[11px] font-bold border border-amber-200/60 dark:border-amber-800/40 font-body">
                            ইনঅ্যাক্টিভ
                          </span>
                        )}
                      </QuestionCardHeader>

                      {/* 2-Column Matching Grid */}
                      <Link href={buildEditHref(item.id)} prefetch={true} className="block">
                        <DanBamMilkoronGrid
                          leftColumn={item.leftColumn}
                          rightColumn={item.rightColumn}
                        />
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
                    editHref={buildEditHref(item.id)}
                    onDelete={() => onDelete(item.id, snippet)}
                    editTitle="ডান-বাম মিলকরণ সম্পাদনা করুন"
                    deleteTitle="ডান-বাম মিলকরণ মুছুন"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && totalItems > 0 && (
        <DataTablePagination
          page={currentPage}
          limit={itemsPerPage}
          totalItems={totalItems}
          entityName="টি প্রশ্ন"
          isLoading={isLoading}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  )
}

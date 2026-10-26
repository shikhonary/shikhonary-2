"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import {
  DataTablePagination,
  QuestionCardHeader,
  QuestionCardFooter,
  QuestionCardActions,
} from "@/components/shared"
import { toBengaliDigits } from "@workspace/utils/helpers/bengali"
import {
  Trash2,
  FileQuestion,
  BookOpen,
} from "lucide-react"

export interface CsItem {
  id: string
  questionA: string
  questionB: string
  reference: string[]
  difficulty: string
  source?: string | null
  session?: string | null
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
  subject: {
    id: string
    nameEn: string
    nameBn: string
    code?: string | null
    classSubjects?: {
      academicClass?: {
        id: string
        nameBn?: string | null
        nameEn?: string | null
      } | null
    }[]
  }
  chapter: {
    id: string
    nameEn: string
    nameBn: string
    position: number
  }
}

interface CsTableProps {
  items: CsItem[]
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

export function CsTable({
  items,
  isLoading,
  isError,
  onDelete,
  onBulkDelete,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  onPageChange,
  onLimitChange,
}: CsTableProps) {
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
      {/* Selection Action Bar */}
      {!isLoading && !isError && items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4 shadow-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
              />
              <span className="text-xs font-bold font-headline text-foreground">
                সকল প্রশ্ন নির্বাচন করুন ({toBengaliDigits(items.length)}টি)
              </span>
            </label>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/[0.08]">
                <span className="text-xs font-bold text-indigo-600 dark:text-primary font-headline">
                  {toBengaliDigits(selectedIds.length)}টি প্রশ্ন নির্বাচিত
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onBulkDelete(selectedIds)}
                  className="rounded-xl px-3 py-1 text-xs font-bold gap-1.5 shadow-xs cursor-pointer font-headline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>নির্বাচিত প্রশ্ন মুছুন</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Skeleton View */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-12 bg-slate-200 dark:bg-white/[0.06] rounded-lg" />
                <div className="h-6 w-20 bg-slate-200 dark:bg-white/[0.06] rounded-lg" />
                <div className="h-6 w-28 bg-slate-200 dark:bg-white/[0.06] rounded-lg" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-4 w-full bg-slate-200 dark:bg-white/[0.06] rounded" />
                <div className="h-4 w-4/5 bg-slate-200 dark:bg-white/[0.06] rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="overflow-hidden rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/20 dark:bg-red-950/10 shadow-xs p-12 text-center text-red-600 font-headline">
          <FileQuestion className="h-10 w-10 mx-auto text-red-500 mb-3" />
          <p className="text-base font-bold">CS প্রশ্ন লোড করা সম্ভব হয়নি।</p>
          <p className="text-xs text-muted-foreground mt-1 font-body">
            অনুগ্রহ করে পৃষ্ঠাটি রিলোড দিন অথবা কিছুক্ষণ পর চেষ্টা করুন।
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs py-16 px-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 text-indigo-600 dark:text-primary mx-auto flex items-center justify-center mb-4 shadow-sm shadow-indigo-100/50 dark:shadow-none">
            <BookOpen className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-foreground font-headline">
            কোনো CS প্রশ্ন পাওয়া যায়নি
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
            ফিল্টার পরিবর্তন করে দেখুন অথবা প্রশ্ন ব্যাংকে নতুন CS যোগ করুন।
          </p>
          <div className="mt-6">
            <Button
              asChild
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
            >
              <Link href="/cs/create" prefetch={true}>
                <span>নতুন CS যোগ করুন</span>
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
                      {/* Question Card Header (Badges Row) */}
                      <QuestionCardHeader
                        globalIndex={globalIndex}
                        academicClassName={className}
                        subjectName={item.subject.nameBn || item.subject.nameEn}
                        chapterName={item.chapter?.nameBn || item.chapter?.nameEn}
                      />

                      {/* Sub-Questions A & B (Direct presentation with indicator badges) */}
                      <div className="space-y-2.5 pl-3 sm:pl-4 border-l-2 border-indigo-500 py-1 bg-slate-50/60 dark:bg-white/[0.02] rounded-r-xl p-3 sm:p-4">
                        {/* Question A */}
                        <div className="flex items-start gap-2.5">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-indigo-100 dark:bg-primary/20 text-xs font-bold text-indigo-700 dark:text-primary font-headline select-none">
                            ক
                          </span>
                          <div className="flex-1 text-sm text-foreground font-medium font-body leading-relaxed pt-0.5">
                            <RenderMath text={item.questionA} isMath={true} />
                          </div>
                        </div>

                        {/* Question B */}
                        <div className="flex items-start gap-2.5">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-indigo-100 dark:bg-primary/20 text-xs font-bold text-indigo-700 dark:text-primary font-headline select-none">
                            খ
                          </span>
                          <div className="flex-1 text-sm text-foreground font-medium font-body leading-relaxed pt-0.5">
                            <RenderMath text={item.questionB} isMath={true} />
                          </div>
                        </div>
                      </div>

                      {/* Question Card Footer */}
                      <QuestionCardFooter
                        source={item.source}
                        session={item.session}
                        references={item.reference}
                      />
                    </div>
                  </div>

                  {/* Actions Column */}
                  <QuestionCardActions
                    editHref={`/cs/${item.id}/edit`}
                    onDelete={() => onDelete(item.id, item.questionA)}
                    editTitle="CS সম্পাদনা করুন"
                    deleteTitle="CS মুছুন"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Shared Data Table Pagination */}
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

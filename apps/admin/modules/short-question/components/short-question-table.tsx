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
  Plus,
} from "lucide-react"

export interface ShortQuestionItem {
  id: string
  question: string
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
    code?: string | null
    classSubjects?: {
      academicClass?: {
        id: string
        nameEn: string
        nameBn: string
      } | null
    }[]
  } | null
  chapter?: {
    id: string
    nameEn: string
    nameBn?: string
  } | null
}

interface ShortQuestionTableProps {
  items: ShortQuestionItem[]
  isLoading: boolean
  isError: boolean
  onDelete: (id: string, questionSnippet: string) => void
  onBulkDelete: (selectedIds: string[]) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export function ShortQuestionTable({
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
}: ShortQuestionTableProps) {
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
              </div>
            )}
          </div>

          {selectedIds.length > 0 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                onBulkDelete(selectedIds)
                setSelectedIds([])
              }}
              className="gap-1.5 rounded-xl font-bold text-xs h-9 px-3 w-full sm:w-auto font-headline cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>নির্বাচিত প্রশ্নগুলো মুছুন ({toBengaliDigits(selectedIds.length)}টি)</span>
            </Button>
          )}
        </div>
      )}

      {/* Loading State Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-card border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4 animate-pulse shadow-xs"
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-12 bg-slate-100 dark:bg-white/[0.06] rounded-lg" />
                <div className="h-6 w-20 bg-slate-100 dark:bg-white/[0.06] rounded-lg" />
                <div className="h-6 w-28 bg-slate-100 dark:bg-white/[0.06] rounded-lg" />
              </div>
              <div className="h-6 w-3/4 bg-slate-100 dark:bg-white/[0.06] rounded-md" />
              <div className="h-4 w-1/2 bg-slate-100 dark:bg-white/[0.06] rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-950/50 bg-rose-50/50 dark:bg-rose-950/10 p-8 text-center text-rose-600 dark:text-rose-400 shadow-xs">
          <FileQuestion className="h-10 w-10 mx-auto text-rose-500 mb-3" />
          <p className="text-base font-bold font-headline">সংক্ষিপ্ত প্রশ্ন লোড করা সম্ভব হয়নি।</p>
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
            কোনো সংক্ষিপ্ত প্রশ্ন পাওয়া যায়নি
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
            ফিল্টার পরিবর্তন করে দেখুন অথবা প্রশ্ন ব্যাংকে নতুন সংক্ষিপ্ত প্রশ্ন যোগ করুন।
          </p>
          <div className="mt-6">
            <Button
              asChild
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
            >
              <Link href="/short-questions/create" prefetch={true}>
                <Plus className="w-4 h-4" />
                <span>নতুন প্রশ্ন যোগ করুন</span>
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
            const snippet = item.question.length > 80 ? item.question.substring(0, 80) + "..." : item.question

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
                      {/* Question Card Header */}
                      <QuestionCardHeader
                        globalIndex={globalIndex}
                        academicClassName={className}
                        subjectName={item.subject?.nameBn || item.subject?.nameEn}
                        chapterName={item.chapter?.nameBn || item.chapter?.nameEn}
                      >
                        {/* Popularity Badge */}
                        {item.popularityCount > 0 && (
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 rounded-lg text-[11px] font-bold border border-blue-200/60 font-body">
                            👁️ {toBengaliDigits(item.popularityCount)} ভিউ
                          </span>
                        )}
                      </QuestionCardHeader>

                      {/* Question Stem Link */}
                      <Link
                        href={`/short-questions/${item.id}/edit`}
                        prefetch={true}
                        className="block font-headline text-base sm:text-lg font-bold text-foreground hover:text-indigo-600 dark:hover:text-primary transition-colors leading-relaxed"
                      >
                        <RenderMath text={item.question} isMath={true} />
                      </Link>

                      {/* Clean Footer: Source, Session & Reference */}
                      <QuestionCardFooter
                        source={item.source}
                        session={item.session}
                        references={item.reference}
                      />
                    </div>
                  </div>

                  {/* Actions Column */}
                  <QuestionCardActions
                    editHref={`/short-questions/${item.id}/edit`}
                    onDelete={() => onDelete(item.id, snippet)}
                    editTitle="সংক্ষিপ্ত প্রশ্ন সম্পাদনা করুন"
                    deleteTitle="সংক্ষিপ্ত প্রশ্ন মুছুন"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && !isError && totalItems > 0 && (
        <DataTablePagination
          page={currentPage}
          limit={itemsPerPage}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          entityName="সংক্ষিপ্ত প্রশ্ন"
        />
      )}
    </div>
  )
}

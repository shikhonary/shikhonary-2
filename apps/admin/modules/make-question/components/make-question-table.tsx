"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import { toBengaliDigits } from "@workspace/utils/helpers/bengali"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import {
  QuestionCardHeader,
  QuestionCardFooter,
  QuestionCardActions,
} from "@/components/shared"
import { BookOpen, Trash2 } from "lucide-react"

export interface MakeQuestionItem {
  id: string
  statement?: string | null
  answer?: string | null
  clue?: string | null
  context?: string | null
  difficulty: string
  popularityCount?: number
  source?: string | null
  session?: string | null
  reference: string[]
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
        nameBn?: string
      } | null
    }[]
  } | null
  academicChapter?: {
    id: string
    nameEn: string
    nameBn?: string
  } | null
  essence?: {
    id: string
    title?: string | null
  } | null
}

interface MakeQuestionTableProps {
  items: MakeQuestionItem[]
  isLoading: boolean
  isError: boolean
  onDelete: (id: string, statementSnippet: string) => void
  onBulkDelete: (selectedIds: string[]) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages?: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export function MakeQuestionTable({
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
}: MakeQuestionTableProps) {
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
      {!isLoading && !isError && items.length > 0 && (
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
                  className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 cursor-pointer shadow-xs font-headline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>নির্বাচিতগুলো ডিলিট করুন</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Skeleton State matching Short Answer Blueprint */}
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
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-white/10 rounded-md" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full bg-slate-200 dark:bg-white/10 rounded" />
                <div className="h-4 w-5/6 bg-slate-200 dark:bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="overflow-hidden rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/20 dark:bg-red-950/10 shadow-xs p-12 text-center text-red-600 font-headline">
          <BookOpen className="h-10 w-10 mx-auto text-red-500 mb-3" />
          <p className="text-base font-bold">প্রশ্ন তৈরির ডেটা লোড করা সম্ভব হয়নি।</p>
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
            কোনো প্রশ্ন তৈরির এন্ট্রি পাওয়া যায়নি
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
            ফিল্টার পরিবর্তন করে দেখুন অথবা প্রশ্ন ব্যাংকে নতুন প্রশ্ন তৈরির এন্ট্রি যোগ করুন।
          </p>
          <div className="mt-6">
            <Button
              asChild
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
            >
              <Link href="/make-questions/create" prefetch={true}>
                <span>নতুন এন্ট্রি যোগ করুন</span>
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
            const rawClass = item.subject?.classSubjects?.[0]?.academicClass
            const className = rawClass ? rawClass.nameBn || rawClass.nameEn : null
            const chapter = item.academicChapter
            const mainText = item.statement || item.context || "(খালি বক্তব্য)"

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
                  {/* Left: Checkbox & Main Info */}
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
                        chapterName={chapter?.nameBn || chapter?.nameEn}
                      />

                      {/* Statement Presentation */}
                      <Link
                        href={`/make-questions/${item.id}/edit`}
                        prefetch={true}
                        className="block font-headline text-base sm:text-lg font-bold text-slate-900 dark:text-foreground leading-snug group-hover:text-indigo-600 transition-colors"
                      >
                        <RenderMath text={mainText} isMath={/[\$\\]/.test(mainText)} />
                      </Link>

                      {/* Answer / Target Question */}
                      {item.answer && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-foreground leading-relaxed flex items-start gap-2">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0 uppercase tracking-wider text-[11px] font-headline">
                            উদ্দিষ্ট প্রশ্ন / উত্তর:
                          </span>
                          <div className="whitespace-pre-wrap font-medium font-body text-sm">
                            <RenderMath text={item.answer} isMath={/[\$\\]/.test(item.answer)} />
                          </div>
                        </div>
                      )}

                      {/* Clue & Context Tags */}
                      {(item.clue || item.context) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {item.clue && (
                            <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-medium border border-amber-200/60 dark:border-amber-800/40 font-body">
                              <span className="font-bold font-headline uppercase mr-1">ক্লু:</span> {item.clue}
                            </span>
                          )}
                          {item.context && (
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/[0.04] text-muted-foreground rounded-lg text-xs font-medium border border-slate-200 dark:border-white/[0.08] font-body">
                              <span className="font-bold font-headline uppercase mr-1">প্রসঙ্গ:</span> {item.context}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Shared Footer */}
                      <QuestionCardFooter
                        source={item.source}
                        session={item.session}
                        references={item.reference}
                      />
                    </div>
                  </div>

                  {/* Shared Actions Column */}
                  <QuestionCardActions
                    editHref={`/make-questions/${item.id}/edit`}
                    onDelete={() => onDelete(item.id, mainText)}
                    editLabel="এডিট"
                    deleteLabel="ডিলিট"
                    editTitle="এন্ট্রি সম্পাদনা করুন"
                    deleteTitle="এন্ট্রি মুছুন"
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
          entityName="টি প্রশ্ন তৈরির এন্ট্রি"
          isLoading={isLoading}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { useToggleMcqActive } from "../services/use-mcq"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import { QuestionAttachments, type QuestionAttachmentItemData } from "@workspace/ui/components/question-attachments"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { DataTableEmptyState } from "@/components/shared/data-table-empty-state"
import { toBengaliDigits } from "@workspace/utils/helpers/bengali"
import {
  Edit3,
  Trash2,
  FileQuestion,
  Calculator,
  CheckCircle2,
  Tag,
  BookOpen,
  Check,
} from "lucide-react"

export interface McqItem {
  id: string
  question: string
  answer: string
  options: string[]
  statements: string[]
  type: string
  isMath: boolean
  reference: string[]
  explanation?: string | null
  questionUrl?: string | null
  context?: string | null
  contextUrl?: string | null
  subjectId: string
  chapterId: string
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
  difficulty?: string | null
  source?: string | null
  session?: string | null
  year?: number | null
  attachments?: QuestionAttachmentItemData[]
  subject: {
    id: string
    nameEn: string
    nameBn: string
    code?: string | null
    group?: string | null
  }
  chapter: {
    id: string
    nameEn: string
    nameBn: string
    position: number
  }
}

interface McqTableProps {
  items: McqItem[]
  isLoading: boolean
  isError: boolean
  onDelete: (id: string, question: string) => void
  onBulkDelete: (selectedIds: string[]) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export function McqTable({
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
}: McqTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const toggleActiveMutation = useToggleMcqActive()

  const optionLetters = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"]
  const romanNumerals = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"]

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

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleActiveMutation.mutateAsync({
        id,
        isActive: !currentActive,
      })
      toast.success(!currentActive ? "MCQ সক্রিয় করা হয়েছে।" : "MCQ নিষ্ক্রিয় করা হয়েছে।")
    } catch (err: any) {
      toast.error(err.message || "MCQ স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি")
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
                  onClick={() => onBulkDelete(selectedIds)}
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
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-white/10 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-10 bg-slate-100 dark:bg-white/[0.04] rounded-xl border border-slate-200/60" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="overflow-hidden rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/20 dark:bg-red-950/10 shadow-xs p-12 text-center text-red-600 font-headline">
          <FileQuestion className="h-10 w-10 mx-auto text-red-500 mb-3" />
          <p className="text-base font-bold">MCQ প্রশ্ন লোড করা সম্ভব হয়নি।</p>
          <p className="text-xs text-muted-foreground mt-1 font-body">
            অনুগ্রহ করে পৃষ্ঠাটি রিলোড দিন অথবা কিছুক্ষণ পর চেষ্টা করুন।
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs py-16 px-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 text-indigo-600 dark:text-primary mx-auto flex items-center justify-center mb-4 shadow-sm shadow-indigo-100/50 dark:shadow-none">
            <FileQuestion className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-foreground font-headline">
            কোনো MCQ প্রশ্ন পাওয়া যায়নি
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
            ফিল্টার পরিবর্তন করে দেখুন অথবা প্রশ্ন ব্যাংকে নতুন MCQ যোগ করুন।
          </p>
          <div className="mt-6">
            <Button
              asChild
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
            >
              <Link href="/mcqs/create">
                <span>নতুন MCQ যোগ করুন</span>
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
                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-2 pl-7 md:pl-0">
                        {/* Global Index Badge */}
                        <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/[0.06] font-mono text-[11px] font-bold text-slate-700 dark:text-muted-foreground rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
                          #{toBengaliDigits(globalIndex)}
                        </span>

                        {/* Subject Badge */}
                        <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-primary rounded-lg text-xs font-bold border border-indigo-200/60 dark:border-primary/20 font-body">
                          {item.subject.nameBn || item.subject.nameEn}
                        </span>

                        {/* Chapter Badge */}
                        <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-muted-foreground rounded-lg text-xs font-semibold border border-slate-200/60 dark:border-white/[0.04] font-body">
                          {item.chapter.nameBn || item.chapter.nameEn}
                        </span>

                        {/* Type Badge */}
                        <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 rounded-lg text-[11px] font-bold border border-blue-200/60 dark:border-blue-800/40 uppercase font-headline">
                          {item.type}
                        </span>

                        {/* Math Badge */}
                        {item.isMath && (
                          <div className="flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 rounded-lg text-[11px] font-bold border border-purple-200/60 dark:border-purple-800/40 font-body">
                            <Calculator className="w-3.5 h-3.5" />
                            <span>গণিত</span>
                          </div>
                        )}

                        {/* Difficulty Badge */}
                        {item.difficulty && (
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-lg text-[11px] font-bold border uppercase font-headline",
                              item.difficulty === "EASY" &&
                                "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/60",
                              item.difficulty === "MEDIUM" &&
                                "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/60",
                              item.difficulty === "HARD" &&
                                "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/60"
                            )}
                          >
                            {item.difficulty === "EASY"
                              ? "সহজ"
                              : item.difficulty === "MEDIUM"
                              ? "মাঝারি"
                              : item.difficulty === "HARD"
                              ? "কঠিন"
                              : item.difficulty}
                          </span>
                        )}

                        {/* Active Status Badge Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item.id, item.isActive)}
                          className={cn(
                            "px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-body border",
                            item.isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 hover:bg-emerald-100"
                              : "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-muted-foreground border-slate-200 hover:bg-slate-200"
                          )}
                        >
                          {item.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </button>
                      </div>

                      {/* Attachments Section */}
                      {Array.isArray(item.attachments) && item.attachments.length > 0 && (
                        <div className="space-y-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-3.5">
                          <QuestionAttachments attachments={item.attachments} isMath={item.isMath} />
                        </div>
                      )}

                      {/* Question Text */}
                      <Link
                        href={`/mcqs/${item.id}/edit`}
                        className="block font-headline text-base sm:text-lg font-bold text-slate-900 dark:text-foreground leading-snug group-hover:text-indigo-600 transition-colors"
                      >
                        <RenderMath text={item.question} isMath={item.isMath} />
                      </Link>

                      {/* Statements / Sub-questions */}
                      {Array.isArray(item.statements) && item.statements.length > 0 && (
                        <div className="space-y-1.5 pl-3 border-l-2 border-indigo-500 py-1 bg-slate-50/80 dark:bg-white/[0.02] rounded-r-xl p-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1 font-headline">
                            বিবৃতিসমূহ:
                          </span>
                          {item.statements.map((stmt, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex items-start gap-2 text-xs text-slate-700 dark:text-muted-foreground font-medium font-body"
                            >
                              <span className="font-mono font-bold text-indigo-600 dark:text-primary shrink-0">
                                {romanNumerals[sIdx] || `${sIdx + 1}.`}
                              </span>
                              <span>
                                <RenderMath text={stmt} isMath={item.isMath} />
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Option Choices Grid */}
                      {Array.isArray(item.options) && item.options.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block font-headline">
                            বিকল্প অপশনসমূহ ({toBengaliDigits(item.options.length)}টি):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.options.map((opt, optIdx) => {
                              const isCorrect = item.answer === opt
                              const letter = optionLetters[optIdx] || String(optIdx + 1)

                              return (
                                <div
                                  key={optIdx}
                                  className={cn(
                                    "flex items-center gap-2.5 rounded-xl border p-2.5 text-xs transition-colors font-body",
                                    isCorrect
                                      ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold ring-1 ring-emerald-500/20"
                                      : "border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] text-slate-800 dark:text-slate-200"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold font-headline",
                                      isCorrect
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-muted-foreground"
                                    )}
                                  >
                                    {letter}
                                  </span>
                                  <span className="flex-1 min-w-0 whitespace-normal break-words">
                                    <RenderMath text={opt} isMath={item.isMath} />
                                  </span>
                                  {isCorrect && (
                                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-0.5">
                                      <Check className="w-3 h-3 stroke-[2.5]" />
                                      <span>সঠিক</span>
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Explanation Notes */}
                      {item.explanation && (
                        <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] p-3 text-xs text-slate-700 dark:text-muted-foreground font-body">
                          <span className="font-bold text-foreground block mb-0.5 font-headline">ব্যাখ্যা:</span>
                          <p className="whitespace-pre-wrap">
                            <RenderMath text={item.explanation} isMath={item.isMath} />
                          </p>
                        </div>
                      )}

                      {/* Reference Tags & ID Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 dark:border-white/[0.06] pt-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(item.source || item.session) && (
                            <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-primary rounded-lg text-[11px] font-semibold flex items-center gap-1 border border-indigo-100 dark:border-primary/20 font-body">
                              <BookOpen className="w-3 h-3" />
                              <span>
                                {item.source || "পাঠ্যবই"}
                                {item.session ? ` (${toBengaliDigits(item.session)})` : ""}
                              </span>
                            </span>
                          )}
                          {Array.isArray(item.reference) && item.reference.length > 0 ? (
                            item.reference.map((ref, rIdx) => (
                              <span
                                key={rIdx}
                                className="px-2 py-0.5 bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-muted-foreground rounded-lg text-[11px] font-medium border border-slate-200/60 dark:border-white/[0.04] flex items-center gap-1"
                              >
                                <Tag className="w-3 h-3 text-slate-400" />
                                <span>{ref}</span>
                              </span>
                            ))
                          ) : !item.source && !item.session ? (
                            <span className="text-[11px] text-muted-foreground italic font-body">কোনো রেফারেন্স ট্যাগ নেই</span>
                          ) : null}
                        </div>

                        <span className="text-[11px] font-mono text-muted-foreground">
                          ID: {item.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex md:flex-col justify-end items-center gap-2 shrink-0 border-t md:border-t-0 border-slate-200/80 dark:border-white/[0.06] pt-3 md:pt-0 w-full md:w-auto">
                    <Link
                      href={`/mcqs/${item.id}/edit`}
                      className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl text-indigo-600 dark:text-primary transition-all cursor-pointer border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-300 text-center flex-1 md:flex-initial"
                      title="MCQ সম্পাদনা করুন"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => onDelete(item.id, item.question)}
                      className="p-2.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl text-red-600 dark:text-red-400 transition-all cursor-pointer border border-slate-200/80 dark:border-white/[0.08] hover:border-red-300 flex-1 md:flex-initial"
                      title="MCQ মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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

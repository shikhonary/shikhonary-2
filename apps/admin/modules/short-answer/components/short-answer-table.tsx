"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import { QuestionAttachments, type QuestionAttachmentItemData } from "@workspace/ui/components/question-attachments"
import {
  DataTablePagination,
  QuestionCardHeader,
  QuestionCardFooter,
  QuestionCardActions,
} from "@/components/shared"
import { toBengaliDigits } from "@workspace/utils/helpers/bengali"
import "katex/dist/katex.min.css"
import {
  Trash2,
  FileText,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react"

export interface ShortAnswerItem {
  id: string
  question: string
  answer?: string | null
  options?: string[]
  isMath?: boolean
  difficulty: string
  year?: number | null
  source?: string | null
  session?: string | null
  reference: string[]
  isActive: boolean
  attachments?: QuestionAttachmentItemData[]
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
  chapter?: {
    id: string
    nameEn: string
    nameBn?: string
  } | null
}

interface ShortAnswerTableProps {
  items: ShortAnswerItem[]
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

export function ShortAnswerTable({
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
}: ShortAnswerTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({})

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

  const toggleAnswerExpand = (id: string) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
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
        <div className="py-16 text-center rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-6">
          <FileText className="h-10 w-10 mx-auto text-red-500 mb-3" />
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400 font-headline">
            সংক্ষিপ্ত উত্তর প্রশ্ন লোড করতে সমস্যা হয়েছে
          </h3>
          <p className="text-sm text-red-600/80 mt-1 max-w-sm mx-auto font-body">
            সার্ভার থেকে প্রশ্ন লোড করা যায়নি। অনুগ্রহ করে পেজটি রিফ্রেশ করুন।
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs py-16 px-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 text-indigo-600 dark:text-primary mx-auto flex items-center justify-center mb-4 shadow-sm shadow-indigo-100/50 dark:shadow-none">
            <FileText className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-foreground font-headline">
            কোনো সংক্ষিপ্ত উত্তর প্রশ্ন পাওয়া যায়নি
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
            ফিল্টার পরিবর্তন করে দেখুন অথবা প্রশ্ন ব্যাংকে নতুন সংক্ষিপ্ত উত্তর যোগ করুন।
          </p>
          <div className="mt-6">
            <Button
              asChild
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
            >
              <Link href="/short-answers/create" prefetch={true}>
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
            const isAnswerExpanded = Boolean(expandedAnswers[item.id])

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
                      {/* 1. Header Badges Row */}
                      <QuestionCardHeader
                        globalIndex={globalIndex}
                        academicClassName={className}
                        subjectName={item.subject?.nameBn || item.subject?.nameEn || ""}
                        chapterName={item.chapter?.nameBn || item.chapter?.nameEn || ""}
                        isMath={item.isMath}
                      />

                      {/* 2. Attachments Section */}
                      {Array.isArray(item.attachments) && item.attachments.length > 0 && (
                        <div className="space-y-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-3.5">
                          <QuestionAttachments attachments={item.attachments} isMath={item.isMath} />
                        </div>
                      )}

                      {/* 3. Question Stem (Exact MCQ Benchmark Clickable Link Standard) */}
                      <Link
                        href={`/short-answers/${item.id}/edit`}
                        prefetch={true}
                        className="block font-headline text-base sm:text-lg font-bold text-slate-900 dark:text-foreground leading-snug group-hover:text-indigo-600 transition-colors"
                      >
                        <RenderMath text={item.question} isMath={item.isMath} />
                      </Link>

                      {/* 4. Options (If Present) */}
                      {Array.isArray(item.options) && item.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3 sm:pl-4 py-2 bg-slate-50/40 dark:bg-white/[0.01] rounded-xl p-3 border border-slate-200/60 dark:border-white/[0.04]">
                          {item.options.map((opt, oIdx) => {
                            const labels = ["(ক)", "(খ)", "(গ)", "(ঘ)", "(ঙ)", "(চ)"]
                            return (
                              <div key={oIdx} className="flex items-start gap-2 text-xs text-foreground font-medium font-body">
                                <span className="font-bold text-indigo-600 dark:text-primary shrink-0">
                                  {labels[oIdx] || `(${toBengaliDigits(oIdx + 1)})`}
                                </span>
                                <div>
                                  <RenderMath text={opt} isMath={item.isMath} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Expand Answer Button */}
                      <div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAnswerExpand(item.id)}
                          className="text-xs font-bold text-indigo-600 dark:text-primary flex items-center gap-1.5 h-auto py-1 px-2.5 hover:bg-indigo-50 dark:hover:bg-primary/10 rounded-lg cursor-pointer"
                        >
                          {isAnswerExpanded ? (
                            <>
                              <EyeOff className="size-3.5" />
                              <span>উত্তর ও ব্যাখ্যা লুকান</span>
                            </>
                          ) : (
                            <>
                              <Eye className="size-3.5" />
                              <span>উত্তর ও ব্যাখ্যা দেখুন</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Collapsible Answer & Explanation Sheets */}
                      {isAnswerExpanded && (
                        <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs font-body animate-fade-in">
                          <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-1.5 uppercase tracking-wider font-headline">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            আদর্শ উত্তর ও সমাধান:
                          </h4>

                          {item.answer ? (
                            <div className="pl-2 text-sm leading-relaxed text-foreground font-medium">
                              <RenderMath text={item.answer} isMath={item.isMath} />
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic pl-2">এই প্রশ্নের জন্য কোনো উত্তর সংরক্ষণ করা হয়নি।</p>
                          )}
                        </div>
                      )}

                      {/* 5. Clean Footer: Source, Session & Reference */}
                      <QuestionCardFooter
                        source={item.source}
                        session={item.session}
                        year={item.year}
                        references={item.reference}
                      />
                    </div>
                  </div>

                  {/* 6. Labeled Action Buttons */}
                  <QuestionCardActions
                    editHref={`/short-answers/${item.id}/edit`}
                    onDelete={() => onDelete(item.id, item.question)}
                    editTitle="সম্পাদনা করুন"
                    deleteTitle="মুছুন"
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

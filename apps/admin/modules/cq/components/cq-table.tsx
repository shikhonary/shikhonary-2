"use client"

import { useState } from "react"
import Link from "next/link"
import { useToggleCqActive } from "../services/use-cq"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import "katex/dist/katex.min.css"
import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

export interface CqItem {
  id: string
  questionA: string
  questionB: string
  questionC: string
  questionD?: string | null
  context?: string | null
  reference: string[]
  difficulty: string
  year?: number | null
  source?: string | null
  marks?: any
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
  subject: {
    id: string
    nameEn: string
    nameBn: string
    code?: string | null
  }
  chapter: {
    id: string
    nameEn: string
    nameBn: string
    position: number
  }
  answer?: {
    id: string
    answerA?: string | null
    answerB?: string | null
    answerC?: string | null
    answerD?: string | null
    explanation?: string | null
  } | null
}

interface CqTableProps {
  items: CqItem[]
  isLoading: boolean
  isError: boolean
  onDelete: (id: string, contextSnippet: string) => void
  onBulkDelete: (selectedIds: string[]) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export function CqTable({
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
}: CqTableProps) {
  const displayStart = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({})
  const toggleActiveMutation = useToggleCqActive()

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
      toast.success(!currentActive ? "CQ activated." : "CQ deactivated.")
    } catch (err: any) {
      toast.error(err.message || "Failed to update CQ status")
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
      {/* Selection Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-4 w-4 rounded-sm border-outline-variant text-primary focus:ring-primary cursor-pointer"
            />
            <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-outline">
              Select All ({items.length})
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
              <span className="font-label-sm text-xs font-semibold text-primary">
                {selectedIds.length} items selected
              </span>
              <Button
                type="button"
                onClick={() => onBulkDelete(selectedIds)}
                className="flex items-center gap-1.5 rounded-lg bg-error px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-error/90 cursor-pointer h-auto"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                <span>Delete Selected</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-16 text-center text-on-surface-variant rounded-xl border border-outline-variant bg-white">
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">
              progress_activity
            </span>
            <span className="font-body-md text-sm font-medium">Loading CQ question bank...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="py-16 text-center text-error rounded-xl border border-error/30 bg-error-container/20">
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-4xl">error</span>
            <span className="font-body-md text-sm font-medium">
              Error loading CQ questions. Please try refreshing.
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="py-16 text-center text-on-surface-variant rounded-xl border border-outline-variant bg-white">
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-5xl text-outline">
              quiz
            </span>
            <p className="font-headline-md text-xl font-bold text-on-surface">
              No CQs Found
            </p>
            <p className="font-body-md text-sm text-outline max-w-md">
              Try adjusting filters or add a new creative question to the bank.
            </p>
          </div>
        </div>
      )}

      {/* CARD VIEW LAYOUT */}
      {!isLoading && !isError && items.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {items.map((item, idx) => {
            const isSelected = selectedIds.includes(item.id)
            const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1
            const isAnswerExpanded = !!expandedAnswers[item.id]

            // Mark distribution parsing
            const marksA = item.marks?.a ?? 1
            const marksB = item.marks?.b ?? 2
            const marksC = item.marks?.c ?? 3
            const marksD = item.marks?.d ?? 4
            const totalCqMarks = Number(marksA) + Number(marksB) + Number(marksC) + Number(item.questionD ? marksD : 0)

            return (
              <div
                key={item.id}
                className={cn(
                  "bg-surface-container-lowest border rounded-2xl p-6 transition-all hover:border-primary/40 hover:shadow-md relative group",
                  isSelected ? "border-primary ring-2 ring-primary/20 bg-primary-container/5" : "border-outline-variant/60"
                )}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  {/* Selection Checkbox & Main Info */}
                  <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0 w-full relative md:static">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                      className="absolute top-[6px] left-0 md:relative md:top-0 md:left-0 md:mt-1 h-4 w-4 rounded-sm border-outline-variant text-primary focus:ring-primary cursor-pointer shrink-0"
                    />

                    <div className="flex-1 space-y-4 min-w-0">
                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-2 pl-7 md:pl-0">
                        {/* Global Index Badge */}
                        <span className="px-2 py-0.5 bg-surface-container-high font-mono text-[11px] font-bold text-on-surface-variant rounded">
                          #{globalIndex}
                        </span>

                        {/* Subject Badge */}
                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded font-label-sm text-xs font-bold border border-primary/20">
                          {item.subject.nameBn || item.subject.nameEn}
                        </span>

                        {/* Chapter Badge */}
                        <span className="px-2.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded font-label-sm text-xs font-semibold">
                          {item.chapter.nameBn || item.chapter.nameEn}
                        </span>

                        {/* Marks Badge */}
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded font-label-sm text-[11px] font-bold border border-blue-100 uppercase">
                          {totalCqMarks} Marks
                        </span>

                        {/* Difficulty Badge */}
                        <span className={cn(
                          "px-2.5 py-0.5 rounded font-label-sm text-[11px] font-bold border uppercase",
                          item.difficulty === "EASY" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                          item.difficulty === "MEDIUM" && "bg-amber-50 text-amber-700 border-amber-200",
                          item.difficulty === "HARD" && "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {item.difficulty}
                        </span>

                        {/* Active Status Badge Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item.id, item.isActive)}
                          className={cn(
                            "px-2.5 py-0.5 rounded font-label-sm text-xs font-bold transition-all cursor-pointer",
                            item.isActive
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          )}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </button>
                      </div>

                      {/* Context / Stimulus Passage */}
                      {item.context && (
                        <div className="rounded-xl border border-secondary/20 bg-secondary-container/10 p-4 text-sm text-on-surface leading-relaxed">
                          <div className="font-bold text-secondary flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">article</span>
                            Stimulus / Passage Context:
                          </div>
                          <div className={cn(
                            "whitespace-pre-wrap font-medium",
                            /[\u0980-\u09FF]/.test(item.context) && "font-solaiman text-base"
                          )}>
                            <RenderMath text={item.context} isMath={true} />
                          </div>
                        </div>
                      )}

                      {/* Sub-Questions A, B, C, D */}
                      <div className="space-y-3.5 pl-4 border-l-2 border-primary/40 py-1 bg-surface-container-low/30 rounded-r-2xl p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">
                          Sub-questions:
                        </span>

                        {/* Question A */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary-container text-[11px] font-bold text-on-primary-container">
                              ক
                            </span>
                            <span className="text-xs text-outline font-semibold">
                              Knowledge-based [{marksA} mark]
                            </span>
                          </div>
                          <p className={cn(
                            "text-sm text-on-surface pl-7 font-medium",
                            /[\u0980-\u09FF]/.test(item.questionA) && "font-solaiman text-[15px]"
                          )}>
                            <RenderMath text={item.questionA} isMath={true} />
                          </p>
                        </div>

                        {/* Question B */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary-container text-[11px] font-bold text-on-primary-container">
                              খ
                            </span>
                            <span className="text-xs text-outline font-semibold">
                              Comprehension [{marksB} marks]
                            </span>
                          </div>
                          <p className={cn(
                            "text-sm text-on-surface pl-7 font-medium",
                            /[\u0980-\u09FF]/.test(item.questionB) && "font-solaiman text-[15px]"
                          )}>
                            <RenderMath text={item.questionB} isMath={true} />
                          </p>
                        </div>

                        {/* Question C */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary-container text-[11px] font-bold text-on-primary-container">
                              গ
                            </span>
                            <span className="text-xs text-outline font-semibold">
                              Application [{marksC} marks]
                            </span>
                          </div>
                          <p className={cn(
                            "text-sm text-on-surface pl-7 font-medium",
                            /[\u0980-\u09FF]/.test(item.questionC) && "font-solaiman text-[15px]"
                          )}>
                            <RenderMath text={item.questionC} isMath={true} />
                          </p>
                        </div>

                        {/* Question D (Optional) */}
                        {item.questionD && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary-container text-[11px] font-bold text-on-primary-container">
                                ঘ
                              </span>
                              <span className="text-xs text-outline font-semibold">
                                Higher Ability [{marksD} marks]
                              </span>
                            </div>
                            <p className={cn(
                              "text-sm text-on-surface pl-7 font-medium",
                              /[\u0980-\u09FF]/.test(item.questionD) && "font-solaiman text-[15px]"
                            )}>
                              <RenderMath text={item.questionD} isMath={true} />
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Expand Answer Button */}
                      <div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAnswerExpand(item.id)}
                          className="text-xs font-bold text-primary flex items-center gap-1.5 h-auto py-1 px-3 hover:bg-primary/10 rounded-lg cursor-pointer"
                        >
                          {isAnswerExpanded ? (
                            <>
                              <EyeOff className="size-4" />
                              <span>Hide Answers & Explanation</span>
                            </>
                          ) : (
                            <>
                              <Eye className="size-4" />
                              <span>Show Answers & Explanation</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Collapsible Answer & Explanation Sheets */}
                      {isAnswerExpanded && (
                        <div className="space-y-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-on-surface-variant animate-fade-in">
                          <h4 className="font-bold text-emerald-800 text-xs flex items-center gap-1 mb-2 uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
                            Creative Answer Key Solutions:
                          </h4>

                          {item.answer ? (
                            <div className="space-y-3 pl-2">
                              {/* Answer A */}
                              {item.answer.answerA && (
                                <div className="space-y-0.5">
                                  <span className="font-bold text-emerald-950 block">ক এর উত্তর:</span>
                                  <p className={cn(
                                    "text-sm leading-relaxed",
                                    /[\u0980-\u09FF]/.test(item.answer.answerA) && "font-solaiman text-[14px]"
                                  )}>
                                    <RenderMath text={item.answer.answerA} isMath={true} />
                                  </p>
                                </div>
                              )}

                              {/* Answer B */}
                              {item.answer.answerB && (
                                <div className="space-y-0.5">
                                  <span className="font-bold text-emerald-950 block">খ এর উত্তর:</span>
                                  <p className={cn(
                                    "text-sm leading-relaxed",
                                    /[\u0980-\u09FF]/.test(item.answer.answerB) && "font-solaiman text-[14px]"
                                  )}>
                                    <RenderMath text={item.answer.answerB} isMath={true} />
                                  </p>
                                </div>
                              )}

                              {/* Answer C */}
                              {item.answer.answerC && (
                                <div className="space-y-0.5">
                                  <span className="font-bold text-emerald-950 block">গ এর উত্তর:</span>
                                  <p className={cn(
                                    "text-sm leading-relaxed",
                                    /[\u0980-\u09FF]/.test(item.answer.answerC) && "font-solaiman text-[14px]"
                                  )}>
                                    <RenderMath text={item.answer.answerC} isMath={true} />
                                  </p>
                                </div>
                              )}

                              {/* Answer D */}
                              {item.answer.answerD && (
                                <div className="space-y-0.5">
                                  <span className="font-bold text-emerald-950 block">ঘ এর উত্তর:</span>
                                  <p className={cn(
                                    "text-sm leading-relaxed",
                                    /[\u0980-\u09FF]/.test(item.answer.answerD) && "font-solaiman text-[14px]"
                                  )}>
                                    <RenderMath text={item.answer.answerD} isMath={true} />
                                  </p>
                                </div>
                              )}

                              {/* Explanation */}
                              {item.answer.explanation && (
                                <div className="space-y-0.5 border-t border-emerald-500/10 pt-2.5 mt-2">
                                  <span className="font-bold text-emerald-950 block">উত্তর বিশ্লেষণ / Explanation:</span>
                                  <p className={cn(
                                    "text-sm leading-relaxed text-emerald-900",
                                    /[\u0980-\u09FF]/.test(item.answer.explanation) && "font-solaiman text-[14px]"
                                  )}>
                                    <RenderMath text={item.answer.explanation} isMath={true} />
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic pl-2">No answers or explanation entered for this Creative Question.</p>
                          )}
                        </div>
                      )}

                      {/* Reference Tags & ID Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/30 pt-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {Array.isArray(item.reference) && item.reference.length > 0 ? (
                            item.reference.map((ref, rIdx) => (
                              <span
                                key={rIdx}
                                className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-[11px] font-medium"
                              >
                                🏷️ {ref}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">No reference tags</span>
                          )}
                        </div>

                        <span className="text-[11px] font-mono text-outline/60">
                          ID: {item.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex md:flex-col justify-end items-center gap-2 shrink-0 border-t md:border-t-0 border-outline-variant/40 pt-3 md:pt-0 w-full md:w-auto">
                    <Link
                      href={`/cqs/${item.id}/edit`}
                      className="p-2.5 hover:bg-surface-container-high rounded-xl text-primary transition-all cursor-pointer border border-outline-variant/40 hover:border-primary/40 text-center flex-1 md:flex-initial"
                      title="Edit CQ"
                    >
                      <span className="material-symbols-outlined text-xl block">edit</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => onDelete(item.id, item.context || item.questionA)}
                      className="p-2.5 hover:bg-error-container/30 rounded-xl text-error transition-all cursor-pointer border border-outline-variant/40 hover:border-error/40 flex-1 md:flex-initial"
                      title="Delete CQ"
                    >
                      <span className="material-symbols-outlined text-xl block">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && !isError && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-outline-variant bg-surface-container-low rounded-xl p-4">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
              Showing <span className="font-bold">{displayStart}-{displayEnd}</span> of <span className="font-bold">{totalItems}</span> questions
            </p>
            {onLimitChange && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-outline font-medium">Rows per page:</span>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(val) => onLimitChange(Number(val) || 10)}
                >
                  <SelectTrigger className="h-8 rounded-lg border border-outline-variant bg-white px-2.5 font-body-md text-xs outline-hidden focus:ring-2 focus:ring-primary/10 w-auto gap-1 cursor-pointer">
                    <SelectValue placeholder="Per Page" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg min-w-[80px]">
                    <SelectItem value="10" className="text-neutral-900">10</SelectItem>
                    <SelectItem value="20" className="text-neutral-900">20</SelectItem>
                    <SelectItem value="50" className="text-neutral-900">50</SelectItem>
                    <SelectItem value="100" className="text-neutral-900">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="size-8 sm:size-10 rounded-lg border border-outline-variant bg-white transition-colors hover:bg-surface-container-high disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "ghost"}
                onClick={() => onPageChange(pageNum)}
                className={`size-8 sm:size-10 rounded-lg font-body-md text-xs sm:text-sm transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-primary font-bold text-white hover:bg-primary"
                    : "hover:bg-surface-container-high text-on-surface"
                }`}
              >
                {pageNum}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className="size-8 sm:size-10 rounded-lg border border-outline-variant bg-white transition-colors hover:bg-surface-container-high disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

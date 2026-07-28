"use client"

import { useState } from "react"
import Link from "next/link"
import { useToggleMcqActive } from "../services/use-mcq"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import "katex/dist/katex.min.css"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

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
  subject: {
    id: string
    name: string
    nameBn: string
    level: string
    group?: string | null
  }
  chapter: {
    id: string
    name: string
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
  totalPages,
  onPageChange,
  onLimitChange,
}: McqTableProps) {
  const displayStart = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)
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
      toast.success(!currentActive ? "MCQ activated." : "MCQ deactivated.")
    } catch (err: any) {
      toast.error(err.message || "Failed to update MCQ status")
    }
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
            <span className="font-body-md text-sm font-medium">Loading MCQ question bank...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="py-16 text-center text-error rounded-xl border border-error/30 bg-error-container/20">
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-4xl">error</span>
            <span className="font-body-md text-sm font-medium">
              Error loading MCQ questions. Please try refreshing.
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
              No MCQs Found
            </p>
            <p className="font-body-md text-sm text-outline max-w-md">
              Try adjusting filters or add a new question to the bank.
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
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                      className="mt-1 h-4 w-4 rounded-sm border-outline-variant text-primary focus:ring-primary cursor-pointer shrink-0"
                    />

                    <div className="flex-1 space-y-4 min-w-0">
                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Global Index Badge */}
                        <span className="px-2 py-0.5 bg-surface-container-high font-mono text-[11px] font-bold text-on-surface-variant rounded">
                          #{globalIndex}
                        </span>

                        {/* Subject Badge */}
                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded font-label-sm text-xs font-bold border border-primary/20">
                          {item.subject.nameBn || item.subject.name}
                        </span>

                        {/* Chapter Badge */}
                        <span className="px-2.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded font-label-sm text-xs font-semibold">
                          {item.chapter.nameBn || item.chapter.name}
                        </span>

                        {/* Type Badge */}
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded font-label-sm text-[11px] font-bold border border-blue-100 uppercase">
                          {item.type}
                        </span>

                        {/* Math Badge */}
                        {item.isMath && (
                          <div className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded font-label-sm text-[11px] font-bold border border-amber-200">
                            <span className="material-symbols-outlined text-[14px]">functions</span>
                            <span>Math</span>
                          </div>
                        )}

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

                      {/* Context / Comprehension Passage (If Present) */}
                      {item.context && (
                        <div className="rounded-xl border border-secondary/20 bg-secondary-container/10 p-3.5 text-xs text-on-surface-variant leading-relaxed">
                          <div className="font-bold text-secondary flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">article</span>
                            Context / Passage:
                          </div>
                          <p className="whitespace-pre-wrap">
                            <RenderMath text={item.context} isMath={item.isMath} />
                          </p>
                        </div>
                      )}

                      {/* Question Text */}
                      <Link
                        href={`/mcqs/${item.id}`}
                        className="block font-headline-md text-lg font-bold text-on-surface leading-snug group-hover:text-primary transition-colors"
                      >
                        <RenderMath text={item.question} isMath={item.isMath} />
                      </Link>

                      {/* Statements / Sub-questions (If Present) */}
                      {Array.isArray(item.statements) && item.statements.length > 0 && (
                        <div className="space-y-1.5 pl-3 border-l-2 border-primary/40 py-1 bg-surface-container-low/40 rounded-r-lg p-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">
                            Statements:
                          </span>
                          {item.statements.map((stmt, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2 text-xs text-on-surface-variant font-medium">
                              <span className="font-mono font-bold text-secondary shrink-0">
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
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                            Option Choices ({item.options.length}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.options.map((opt, optIdx) => {
                              const isCorrect = item.answer === opt
                              const letter = optionLetters[optIdx] || String(optIdx + 1)

                              return (
                                <div
                                  key={optIdx}
                                  className={cn(
                                    "flex items-center gap-2.5 rounded-lg border p-2.5 text-xs transition-colors",
                                    isCorrect
                                      ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500/20"
                                      : "border-outline-variant/40 bg-surface-container-lowest text-on-surface"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold",
                                      isCorrect
                                        ? "bg-emerald-600 text-white"
                                        : "bg-surface-container-high text-on-surface-variant"
                                    )}
                                  >
                                    {letter}
                                  </span>
                                  <span className="flex-1 min-w-0 whitespace-normal break-words">
                                    <RenderMath text={opt} isMath={item.isMath} />
                                  </span>
                                  {isCorrect && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                                      ✓ Correct
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Explanation / Solution Notes (If Present) */}
                      {item.explanation && (
                        <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low/60 p-3 text-xs text-on-surface-variant">
                          <span className="font-bold text-on-surface block mb-0.5">Explanation:</span>
                          <p className="whitespace-pre-wrap">
                            <RenderMath text={item.explanation} isMath={item.isMath} />
                          </p>
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
                  <div className="flex md:flex-col justify-end items-center gap-2 shrink-0 border-t md:border-t-0 border-outline-variant/40 pt-3 md:pt-0">
                    <Link
                      href={`/mcqs/${item.id}`}
                      className="p-2.5 hover:bg-surface-container-high rounded-xl text-primary transition-all cursor-pointer border border-outline-variant/40 hover:border-primary/40"
                      title="Edit MCQ"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => onDelete(item.id, item.question)}
                      className="p-2.5 hover:bg-error-container/30 rounded-xl text-error transition-all cursor-pointer border border-outline-variant/40 hover:border-error/40"
                      title="Delete MCQ"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
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
                  <SelectTrigger className="h-8 rounded-lg border border-outline-variant bg-white px-2.5 font-body-md text-xs outline-hidden focus:ring-2 focus:ring-primary/10 w-auto gap-1">
                    <SelectValue placeholder="Per Page" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg min-w-[80px]">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="size-8 sm:size-10 rounded-lg border border-outline-variant bg-white transition-colors hover:bg-surface-container-high disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-sm sm:text-base">chevron_left</span>
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "ghost"}
                onClick={() => onPageChange(pageNum)}
                className={`size-8 sm:size-10 rounded-lg font-body-md text-xs sm:text-sm transition-colors ${
                  currentPage === pageNum
                    ? "bg-primary font-bold text-on-primary hover:bg-primary"
                    : "hover:bg-surface-container-high text-on-surface"
                }`}
              >
                {pageNum}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className="size-8 sm:size-10 rounded-lg border border-outline-variant bg-white transition-colors hover:bg-surface-container-high disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-sm sm:text-base">chevron_right</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

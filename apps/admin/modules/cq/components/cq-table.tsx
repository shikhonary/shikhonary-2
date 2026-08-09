"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

export interface CqAttachmentItem {
  id: string
  url: string
  type: string
  caption?: string | null
  position: number
}

export interface CqAnswerItem {
  id: string
  answerA?: string | null
  answerB?: string | null
  answerC?: string | null
  answerD?: string | null
  explanation?: string | null
}

export interface CqItem {
  id: string
  questionA: string
  questionB: string
  questionC: string
  questionD?: string | null
  context?: string | null
  reference: string[]
  subjectId: string
  chapterId: string
  createdAt: Date | string
  updatedAt: Date | string
  subject: {
    id: string
    name: string
  }
  chapter: {
    id: string
    name: string
    position: number
  }
  attachments: CqAttachmentItem[]
  answer?: CqAnswerItem | null
}

interface CqTableProps {
  items: CqItem[]
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
  const [expandedIds, setExpandedIds] = useState<string[]>([])

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

  const toggleExpand = (id: string) => {
    if (expandedIds.includes(id)) {
      setExpandedIds((prev) => prev.filter((item) => item !== id))
    } else {
      setExpandedIds((prev) => [...prev, id])
    }
  }

  const allSelected =
    items.length > 0 && items.every((item) => selectedIds.includes(item.id))

  if (isError) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-error/30 bg-error/5 text-error">
        <p className="font-semibold">Failed to load Creative Questions</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Selection & Actions Bar */}
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
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Selected</span>
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs font-medium text-outline">
          Showing {displayStart}–{displayEnd} of {totalItems} items
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-16 text-center text-on-surface-variant rounded-xl border border-outline-variant bg-white">
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="animate-spin text-primary text-2xl">⏳</span>
            <span className="font-body-md text-sm font-medium">Loading Creative Questions...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && items.length === 0 && (
        <div className="py-16 text-center text-on-surface-variant rounded-xl border border-outline-variant bg-white">
          <div className="flex flex-col items-center justify-center gap-3">
            <p className="font-headline-md text-xl font-bold text-on-surface">
              No CQs Found
            </p>
            <p className="font-body-md text-sm text-outline max-w-md">
              Try adjusting filters or add a new creative question to the bank.
            </p>
          </div>
        </div>
      )}

      {/* Card Layout */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {items.map((item, idx) => {
            const isSelected = selectedIds.includes(item.id)
            const isExpanded = expandedIds.includes(item.id)
            const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1

            return (
              <div
                key={item.id}
                className={cn(
                  "bg-white border rounded-2xl p-6 transition-all hover:border-primary/40 hover:shadow-md relative group font-solaiman",
                  isSelected ? "border-primary ring-2 ring-primary/20 bg-primary-container/5" : "border-outline-variant/60"
                )}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  {/* Checkbox & Details */}
                  <div className="flex items-start gap-4 flex-1 min-w-0 w-full relative md:static">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                      className="absolute top-[6px] left-0 md:relative md:top-0 md:left-0 md:mt-1.5 h-4 w-4 rounded-sm border-outline-variant text-primary focus:ring-primary cursor-pointer shrink-0"
                    />

                    <div className="flex-1 space-y-4 min-w-0 pl-7 md:pl-0">
                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Index */}
                        <span className="px-2 py-0.5 bg-surface-container-high font-mono text-[11px] font-bold text-on-surface-variant rounded">
                          #{globalIndex}
                        </span>

                        {/* Subject */}
                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded font-label-sm text-xs font-bold border border-primary/20">
                          {item.subject.name}
                        </span>

                        {/* Chapter */}
                        <span className="px-2.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded font-label-sm text-xs font-semibold">
                          {item.chapter.name}
                        </span>

                        {/* References */}
                        {item.reference.map((ref, rIdx) => (
                          <span
                            key={rIdx}
                            className="px-2 py-0.5 bg-secondary/10 text-secondary rounded font-label-sm text-[11px] font-semibold border border-secondary/20"
                          >
                            {ref}
                          </span>
                        ))}
                      </div>

                      {/* Context / Stem */}
                      {item.context && (
                        <div className="rounded-xl border border-secondary/20 bg-secondary-container/10 p-4 text-sm text-on-surface-variant leading-relaxed">
                          <div className="font-bold text-secondary flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wider">
                            <span>Stem (Context):</span>
                          </div>
                          <p className="whitespace-pre-wrap font-solaiman text-[15px]">{item.context}</p>
                        </div>
                      )}

                      {/* Attachments */}
                      {item.attachments && item.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {item.attachments.map((att) => (
                            <div key={att.id} className="relative group border rounded-lg overflow-hidden max-w-[150px] bg-surface-container-low">
                              <img
                                src={att.url}
                                alt={att.caption || "Attachment"}
                                className="h-20 w-auto object-contain mx-auto"
                              />
                              {att.caption && (
                                <div className="bg-black/60 text-[10px] text-white p-1 text-center truncate">
                                  {att.caption}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Question Parts */}
                      <div className="space-y-3 pt-2">
                        {/* Part A */}
                        <div className="flex items-start gap-3">
                          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                            ক
                          </span>
                          <p className="font-medium text-[15px] text-on-surface pt-0.5">{item.questionA}</p>
                        </div>

                        {/* Part B */}
                        <div className="flex items-start gap-3">
                          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                            খ
                          </span>
                          <p className="font-medium text-[15px] text-on-surface pt-0.5">{item.questionB}</p>
                        </div>

                        {/* Part C */}
                        <div className="flex items-start gap-3">
                          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                            গ
                          </span>
                          <p className="font-medium text-[15px] text-on-surface pt-0.5">{item.questionC}</p>
                        </div>

                        {/* Part D */}
                        {item.questionD && (
                          <div className="flex items-start gap-3">
                            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                              ঘ
                            </span>
                            <p className="font-medium text-[15px] text-on-surface pt-0.5">{item.questionD}</p>
                          </div>
                        )}
                      </div>

                      {/* Expanded Section (Answers & Explanation) */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-4 bg-surface-container-lowest/50 rounded-xl p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                            Answers & Explanations:
                          </h4>
                          <div className="space-y-3 font-solaiman">
                            {item.answer?.answerA && (
                              <div className="flex items-start gap-2 pl-2">
                                <span className="font-bold text-xs text-primary shrink-0 pt-0.5">ক. উত্তর:</span>
                                <p className="text-sm text-on-surface-variant">{item.answer.answerA}</p>
                              </div>
                            )}
                            {item.answer?.answerB && (
                              <div className="flex items-start gap-2 pl-2">
                                <span className="font-bold text-xs text-primary shrink-0 pt-0.5">খ. উত্তর:</span>
                                <p className="text-sm text-on-surface-variant">{item.answer.answerB}</p>
                              </div>
                            )}
                            {item.answer?.answerC && (
                              <div className="flex items-start gap-2 pl-2">
                                <span className="font-bold text-xs text-primary shrink-0 pt-0.5">গ. উত্তর:</span>
                                <p className="text-sm text-on-surface-variant">{item.answer.answerC}</p>
                              </div>
                            )}
                            {item.answer?.answerD && (
                              <div className="flex items-start gap-2 pl-2">
                                <span className="font-bold text-xs text-primary shrink-0 pt-0.5">ঘ. উত্তর:</span>
                                <p className="text-sm text-on-surface-variant">{item.answer.answerD}</p>
                              </div>
                            )}
                            {item.answer?.explanation && (
                              <div className="mt-2 pl-2 pt-2 border-t border-outline-variant/20">
                                <span className="font-bold text-xs text-secondary block mb-1">ব্যাখ্যা (Explanation):</span>
                                <p className="text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                                  {item.answer.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions (Edit, Delete, Expand) */}
                  <div className="flex md:flex-col items-center justify-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-outline-variant/30 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(item.id)}
                      className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 h-9 rounded-xl border border-outline-variant/60 bg-white font-semibold text-xs text-on-surface hover:bg-surface-variant cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          <span>Collapse</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          <span>Answers</span>
                        </>
                      )}
                    </Button>

                    <div className="flex gap-2 flex-1 md:flex-initial w-full md:w-auto">
                      <Link
                        href={`/cqs/${item.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-outline-variant/60 bg-white font-semibold text-xs text-on-surface hover:bg-surface-variant cursor-pointer transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => onDelete(item.id, item.questionA)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-error-container/30 bg-error/5 font-semibold text-xs text-error hover:bg-error/10 cursor-pointer transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-outline">Items per page:</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(val) => onLimitChange?.(Number(val))}
            >
              <SelectTrigger className="w-16 rounded-lg border bg-white h-8 text-xs font-semibold py-1 px-2.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border text-xs">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="rounded-lg px-3 py-1.5 text-xs font-bold border outline-none cursor-pointer h-8"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1
              const isActive = p === currentPage
              return (
                <Button
                  key={p}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => onPageChange(p)}
                  className={cn(
                    "rounded-lg w-8 h-8 p-0 text-xs font-bold border outline-none cursor-pointer",
                    isActive ? "bg-primary text-white" : ""
                  )}
                >
                  {p}
                </Button>
              )
            })}
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="rounded-lg px-3 py-1.5 text-xs font-bold border outline-none cursor-pointer h-8"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

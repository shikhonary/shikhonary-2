"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import "katex/dist/katex.min.css"
import { ChevronLeft, ChevronRight, Edit3, Trash2, ArrowRightLeft } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

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
 * Renders the 2 columns of Dan-Bam Milkoron in a clean bordered grid
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
    <div className="w-full max-w-2xl overflow-x-auto my-2 rounded-lg border border-outline-variant/60 bg-white">
      <table className="w-full border-collapse text-left text-xs sm:text-sm bg-white">
        <thead>
          <tr className="bg-surface-container-high/50 border-b border-outline-variant/40">
            <th className="px-3 py-1.5 font-bold text-primary border-r border-outline-variant/40 w-1/2 text-xs uppercase tracking-wider">
              বাম পাশ (Left Column)
            </th>
            <th className="px-3 py-1.5 font-bold text-primary w-1/2 text-xs uppercase tracking-wider">
              ডান পাশ (Right Column)
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxRows }).map((_, idx) => (
            <tr
              key={idx}
              className={cn(
                "border-b last:border-b-0 border-outline-variant/30 hover:bg-surface-container-low/40 transition-colors",
                idx % 2 === 0 ? "bg-white" : "bg-surface-container-lowest/30"
              )}
            >
              <td className="px-3 py-2 border-r border-outline-variant/30 font-medium text-on-surface align-top">
                {leftColumn[idx] !== undefined ? (
                  <div className="flex items-start gap-1.5">
                    <span className="text-[11px] font-bold text-primary/70 shrink-0 select-none">
                      ({idx + 1})
                    </span>
                    <span className="leading-relaxed">
                      <RenderMath text={leftColumn[idx]} />
                    </span>
                  </div>
                ) : (
                  <span className="text-outline italic text-xs">-</span>
                )}
              </td>
              <td className="px-3 py-2 font-medium text-on-surface align-top">
                {rightColumn[idx] !== undefined ? (
                  <div className="flex items-start gap-1.5">
                    <span className="text-[11px] font-bold text-secondary/70 shrink-0 select-none">
                      ({String.fromCharCode(0x0995 + idx)})
                    </span>
                    <span className="leading-relaxed">
                      <RenderMath text={rightColumn[idx]} />
                    </span>
                  </div>
                ) : (
                  <span className="text-outline italic text-xs">-</span>
                )}
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
  totalPages,
  onPageChange,
  onLimitChange,
}: DanBamMilkoronTableProps) {
  const displayStart = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)
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
                onClick={() => {
                  onBulkDelete(selectedIds)
                  setSelectedIds([])
                }}
                className="h-8 px-3 text-xs font-bold bg-error text-white hover:bg-error/90 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Selected</span>
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs text-outline font-medium">
          Showing {displayStart}–{displayEnd} of {totalItems} items
        </div>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 w-full animate-pulse rounded-xl bg-surface-container-low border border-outline-variant/30"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-error/30 bg-error/5 p-8 text-center text-error">
          <p className="font-bold text-base">Failed to load dan bam milkoron</p>
          <p className="text-xs mt-1 text-on-surface-variant">
            Please check your network connection or try refreshing the page.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-lowest p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <ArrowRightLeft className="h-6 w-6" />
          </div>
          <h3 className="font-headline-sm text-lg font-bold text-on-surface">
            No Dan Bam Milkoron Found
          </h3>
          <p className="mt-1 text-xs text-on-surface-variant max-w-md mx-auto">
            Try adjusting your search criteria or create a new dan bam milkoron question.
          </p>
          <Button asChild className="mt-4 bg-primary text-white text-xs font-bold rounded-lg cursor-pointer">
            <Link href="/dan-bam-milkoron/create">Create Dan Bam Milkoron</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => {
            const isSelected = selectedIds.includes(item.id)
            const itemSnippet = item.leftColumn?.[0] || item.rightColumn?.[0] || `ডান-বাম মিলকরণ #${(currentPage - 1) * itemsPerPage + idx + 1}`

            return (
              <div
                key={item.id}
                className={cn(
                  "relative flex flex-col justify-between gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-5 transition-all hover:shadow-md",
                  isSelected && "border-primary/50 bg-primary/5 shadow-xs"
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                    className="mt-1.5 h-4 w-4 rounded-sm border-outline-variant text-primary focus:ring-primary cursor-pointer shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-outline">
                        #{(currentPage - 1) * itemsPerPage + idx + 1}
                      </span>

                      {/* Subject */}
                      {item.subject && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                          {item.subject.nameEn}
                          {item.subject.nameBn && ` (${item.subject.nameBn})`}
                        </span>
                      )}

                      {/* Chapter */}
                      {item.academicChapter && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container-high text-on-surface-variant border border-outline-variant/40">
                          অধ্যায়: {item.academicChapter.nameEn}
                        </span>
                      )}

                      {/* Difficulty */}
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border",
                          item.difficulty === "EASY"
                            ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                            : item.difficulty === "MEDIUM"
                            ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                            : "bg-red-500/10 text-red-700 border-red-500/20"
                        )}
                      >
                        {item.difficulty}
                      </span>

                      {/* References */}
                      {item.reference && item.reference.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.reference.map((ref, rIdx) => (
                            <span
                              key={rIdx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-surface-container-high text-on-surface-variant border border-outline-variant/40"
                            >
                              {ref}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Source */}
                      {item.source && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-surface-container-high text-on-surface-variant border border-outline-variant/40">
                          উৎস: {item.source}
                        </span>
                      )}

                      {/* Session */}
                      {item.session && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-surface-container-high text-on-surface-variant border border-outline-variant/40">
                          সেশন: {item.session}
                        </span>
                      )}
                    </div>

                    {/* 2-Column Grid View */}
                    <DanBamMilkoronGrid
                      leftColumn={item.leftColumn}
                      rightColumn={item.rightColumn}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-outline hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                      title="Edit Question"
                    >
                      <Link href={`/dan-bam-milkoron/${item.id}/edit`}>
                        <Edit3 className="h-4 w-4" />
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item.id, itemSnippet)}
                      className="h-8 w-8 p-0 text-outline hover:text-error hover:bg-error/10 rounded-lg cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-outline font-medium">Rows per page:</span>
            {onLimitChange && (
              <Select
                value={String(itemsPerPage)}
                onValueChange={(val) => onLimitChange(Number(val))}
              >
                <SelectTrigger className="h-8 w-[70px] text-xs bg-white border-outline-variant rounded-md">
                  <SelectValue placeholder={String(itemsPerPage)} />
                </SelectTrigger>
                <SelectContent className="bg-white border-outline-variant shadow-md">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 px-3 text-xs font-bold border-outline-variant rounded-lg cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>

            <span className="text-xs text-on-surface font-semibold px-2">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 px-3 text-xs font-bold border-outline-variant rounded-lg cursor-pointer disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

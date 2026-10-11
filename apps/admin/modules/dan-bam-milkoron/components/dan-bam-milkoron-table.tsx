"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import "katex/dist/katex.min.css"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit3, Trash2, ArrowRightLeft, MoreHorizontal } from "lucide-react"
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

function getPaginationItems(currentPage: number, totalPages: number): (number | "ellipsis-start" | "ellipsis-end")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-end", totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis-start", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, "ellipsis-start", currentPage - 1, currentPage, currentPage + 1, "ellipsis-end", totalPages]
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

      {/* Loading State */}
      {isLoading && (
        <div className="py-16 text-center text-on-surface-variant rounded-xl border border-outline-variant bg-white">
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="animate-spin text-primary text-sm font-bold">
              Loading...
            </span>
            <span className="font-body-md text-sm font-medium">Loading Dan Bam Milkoron...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="py-16 text-center text-error rounded-xl border border-error/30 bg-error-container/20">
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="text-xl font-bold">⚠️ Error</span>
            <span className="font-body-md text-sm font-medium">
              Error loading dan bam milkoron. Please try refreshing.
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="py-16 text-center text-on-surface-variant rounded-xl border border-outline-variant bg-white">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <p className="font-headline-md text-xl font-bold text-on-surface">
              No Dan Bam Milkoron Found
            </p>
            <p className="font-body-md text-sm text-outline max-w-md">
              Try adjusting filters or create a new dan bam milkoron to the bank.
            </p>
            <Button asChild className="mt-2 bg-primary text-white text-xs font-bold rounded-lg cursor-pointer">
              <Link href="/dan-bam-milkoron/create">Create Dan Bam Milkoron</Link>
            </Button>
          </div>
        </div>
      )}
      {/* CARD VIEW LAYOUT */}
      {!isLoading && !isError && items.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {items.map((item, idx) => {
            const isSelected = selectedIds.includes(item.id)
            const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1
            const itemSnippet = item.leftColumn?.[0] || item.rightColumn?.[0] || `ডান-বাম মিলকরণ #${globalIndex}`

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
                        {item.subject && (
                          <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded font-label-sm text-xs font-bold border border-primary/20">
                            {item.subject.nameBn || item.subject.nameEn}
                          </span>
                        )}

                        {/* Chapter Badge */}
                        {item.academicChapter && (
                          <span className="px-2.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded font-label-sm text-xs font-semibold">
                            {item.academicChapter.nameBn || item.academicChapter.nameEn}
                          </span>
                        )}

                        {/* Popularity Badge */}
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded font-label-sm text-[11px] font-bold border border-blue-100 uppercase">
                          👁️ {item.popularityCount} Views
                        </span>

                        {/* Difficulty Badge */}
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded font-label-sm text-[11px] font-bold border uppercase",
                            item.difficulty === "EASY" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                            item.difficulty === "MEDIUM" && "bg-amber-50 text-amber-700 border-amber-200",
                            item.difficulty === "HARD" && "bg-red-50 text-red-700 border-red-200"
                          )}
                        >
                          {item.difficulty}
                        </span>
                      </div>

                      {/* 2-Column Grid Box */}
                      <div className="rounded-xl border border-secondary/20 bg-secondary-container/10 p-4 text-sm text-on-surface leading-relaxed">
                        <DanBamMilkoronGrid
                          leftColumn={item.leftColumn}
                          rightColumn={item.rightColumn}
                        />
                      </div>

                      {/* Reference Tags & ID Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/30 pt-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(item.source || item.session) && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[11px] font-semibold border border-primary/20">
                              📚 {item.source || "N/A"}{item.session ? ` (${item.session})` : ""}
                            </span>
                          )}
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
                            !(item.source || item.session) && (
                              <span className="text-[11px] text-muted-foreground italic">No reference tags</span>
                            )
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
                      href={`/dan-bam-milkoron/${item.id}/edit`}
                      className="p-2.5 hover:bg-surface-container-high rounded-xl text-primary transition-all cursor-pointer border border-outline-variant/40 hover:border-primary/40 text-center flex-1 md:flex-initial"
                      title="Edit Question"
                    >
                      <Edit3 className="size-5 mx-auto" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => onDelete(item.id, itemSnippet)}
                      className="p-2.5 hover:bg-error-container/30 rounded-xl text-error transition-all cursor-pointer border border-outline-variant/40 hover:border-error/40 flex-1 md:flex-initial"
                      title="Delete Question"
                    >
                      <Trash2 className="size-5 mx-auto" />
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
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border border-outline-variant bg-surface-container-low rounded-2xl p-4 shadow-xs">
          {/* Left: Summary & Rows Per Page */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full lg:w-auto">
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant text-center sm:text-left">
              Showing <span className="font-bold text-on-surface">{displayStart}-{displayEnd}</span> of{" "}
              <span className="font-bold text-on-surface">{totalItems}</span> items
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

          {/* Right: Responsive Page Navigation */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center w-full lg:w-auto">
            {/* First Page Button */}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(1)}
              title="First page"
              className="size-8 sm:size-9 rounded-lg border border-outline-variant bg-white transition-colors hover:bg-surface-container-high disabled:opacity-30 cursor-pointer"
            >
              <ChevronsLeft className="size-4" />
            </Button>

            {/* Previous Page Button */}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              title="Previous page"
              className="size-8 sm:size-9 rounded-lg border border-outline-variant bg-white transition-colors hover:bg-surface-container-high disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </Button>

            {/* Numbered Page Buttons & Ellipses */}
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {getPaginationItems(currentPage, totalPages).map((pItem, i) => {
                if (pItem === "ellipsis-start" || pItem === "ellipsis-end") {
                  return (
                    <span
                      key={`${pItem}-${i}`}
                      className="flex size-8 sm:size-9 items-center justify-center text-xs text-muted-foreground select-none"
                    >
                      <MoreHorizontal className="size-4" />
                    </span>
                  )
                }

                const pageNum = pItem as number
                const isCurrent = currentPage === pageNum

                return (
                  <Button
                    key={pageNum}
                    variant={isCurrent ? "default" : "outline"}
                    size="icon"
                    onClick={() => onPageChange(pageNum)}
                    className={cn(
                      "size-8 sm:size-9 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      isCurrent
                        ? "bg-primary font-bold text-white hover:bg-primary shadow-xs"
                        : "border-outline-variant/60 bg-white hover:bg-surface-container-high text-on-surface hover:text-primary"
                    )}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            {/* Next Page Button */}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              title="Next page"
              className="size-8 sm:size-9 rounded-lg border border-outline-variant bg-white transition-colors hover:bg-surface-container-high disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </Button>

            {/* Last Page Button */}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(totalPages)}
              title="Last page"
              className="size-8 sm:size-9 rounded-lg border border-outline-variant bg-white transition-colors hover:bg-surface-container-high disabled:opacity-30 cursor-pointer"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

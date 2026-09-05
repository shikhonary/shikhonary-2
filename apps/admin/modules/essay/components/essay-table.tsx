"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import "katex/dist/katex.min.css"
import { ChevronLeft, ChevronRight, Edit3, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

export interface EssayItem {
  id: string
  title: string
  reference: string[]
  difficulty: string
  popularityCount: number
  createdAt: Date | string
  updatedAt: Date | string
  subject: {
    id: string
    nameEn: string
    nameBn: string
  }
}

interface EssayTableProps {
  items: EssayItem[]
  isLoading: boolean
  isError: boolean
  onDelete: (id: string, titleSnippet: string) => void
  onBulkDelete: (selectedIds: string[]) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export function EssayTable({
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
}: EssayTableProps) {
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
                className="flex items-center gap-1.5 rounded-lg bg-error px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-error/90 cursor-pointer h-auto"
              >
                <Trash2 className="size-3.5" />
                <span>Delete Selected</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Table / Cards View */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-40 w-full animate-pulse rounded-2xl border border-outline-variant/40 bg-surface-container-low/50"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-error/40 p-12 text-center bg-error/5">
          <p className="font-headline-sm text-base font-bold text-error">
            Failed to load Essays
          </p>
          <p className="mt-1 font-body-md text-xs text-outline">
            There was an error communicating with the server. Please try refreshing.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant p-12 text-center bg-surface-container-lowest">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-container-high text-outline mb-3">
            <Trash2 className="size-6 opacity-40" />
          </div>
          <p className="font-headline-sm text-base font-bold text-on-surface">
            No Essays Found
          </p>
          <p className="mt-1 max-w-sm font-body-md text-xs text-outline">
            No essay questions match the chosen search criteria. Try modifying your filters or create a new essay prompt.
          </p>
          <div className="mt-4">
            <Button asChild size="sm" className="rounded-xl font-bold bg-primary text-white">
              <Link href="/essays/create">Add First Essay</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => {
            const isSelected = selectedIds.includes(item.id)
            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1
            const snippet = item.title.slice(0, 100) + (item.title.length > 100 ? "..." : "")

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

                        {/* Popularity Badge */}
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded font-label-sm text-[11px] font-bold border border-blue-100 uppercase">
                          👁️ {item.popularityCount} Views
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
                      </div>

                      {/* Essay Prompt / Title Box */}
                      <div className="rounded-xl border border-secondary/20 bg-secondary-container/10 p-4 text-sm text-on-surface leading-relaxed">
                        <div className={cn(
                          "whitespace-pre-wrap font-medium",
                          /[\u0980-\u09FF]/.test(item.title) && "font-solaiman text-base"
                        )}>
                          <RenderMath text={item.title} isMath={true} />
                        </div>
                      </div>

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
                      href={`/essays/${item.id}/edit`}
                      className="p-2.5 hover:bg-surface-container-high rounded-xl text-primary transition-all cursor-pointer border border-outline-variant/40 hover:border-primary/40 text-center flex-1 md:flex-initial"
                      title="Edit Essay"
                    >
                      <Edit3 className="size-5 mx-auto" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => onDelete(item.id, snippet)}
                      className="p-2.5 hover:bg-error-container/30 rounded-xl text-error transition-all cursor-pointer border border-outline-variant/40 hover:border-error/40 flex-1 md:flex-initial"
                      title="Delete Essay"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-outline-variant bg-surface-container-low rounded-xl p-4">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
              Showing <span className="font-bold">{displayStart}-{displayEnd}</span> of <span className="font-bold">{totalItems}</span> essays
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
              className="size-8 sm:size-10 rounded-lg border border-outline-variant bg-white transition-colors hover:bg-surface-container-high disabled:opacity-30 cursor-pointer animate-fade-in"
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
              className="size-8 sm:size-10 rounded-lg border border-outline-variant bg-white transition-colors hover:bg-surface-container-high disabled:opacity-30 cursor-pointer animate-fade-in"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

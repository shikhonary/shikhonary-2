"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import { toBengaliDigits } from "@workspace/utils/helpers/bengali"

function getPaginationPages(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages]
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
}

function getMobilePaginationPages(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (currentPage <= 2) {
    return [1, 2, "...", totalPages]
  }
  if (currentPage >= totalPages - 1) {
    return [1, "...", totalPages - 1, totalPages]
  }
  return [1, "...", currentPage, "...", totalPages]
}

export interface DataTablePaginationProps {
  page: number
  limit: number
  totalItems: number
  onPageChange: (newPage: number) => void
  onLimitChange?: (newLimit: number) => void
  pageSizeOptions?: number[]
  entityName?: string
  isLoading?: boolean
  className?: string
  showingLabel?: string
  ofLabel?: string
  perPageLabel?: string
  prevLabel?: string
  nextLabel?: string
  formatNumber?: (num: number) => string | number
}

export function DataTablePagination({
  page,
  limit,
  totalItems,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
  entityName = "টি রেকর্ড",
  isLoading = false,
  className,
  showingLabel = "দেখাচ্ছে",
  ofLabel = "/",
  perPageLabel = "প্রতি পৃষ্ঠায়:",
  prevLabel = "পূর্ববর্তী",
  nextLabel = "পরবর্তী",
  formatNumber = (n) => toBengaliDigits(n),
}: DataTablePaginationProps) {
  if (totalItems === 0) return null

  const totalPages = Math.max(1, Math.ceil(totalItems / limit))
  const startItem = totalItems > 0 ? (page - 1) * limit + 1 : 0
  const endItem = Math.min(page * limit, totalItems)

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-200/80 dark:border-white/[0.08] w-full select-none",
        className
      )}
    >
      {/* Left Item Counter & Items Per Page Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap justify-center sm:justify-start w-full sm:w-auto text-center sm:text-left">
        <div className="text-xs text-slate-500 dark:text-muted-foreground font-body">
          {showingLabel}{" "}
          <span className="font-bold text-foreground font-headline">
            {formatNumber(startItem)}
          </span>
          –
          <span className="font-bold text-foreground font-headline">
            {formatNumber(endItem)}
          </span>{" "}
          {ofLabel}{" "}
          <span className="font-bold text-foreground font-headline">
            {formatNumber(totalItems)}
          </span>{" "}
          {entityName}
        </div>

        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium font-body">{perPageLabel}</span>
            <Select
              value={String(limit)}
              onValueChange={(val) => onLimitChange(Number(val) || 10)}
              disabled={isLoading}
            >
              <SelectTrigger className="h-8 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-card px-2.5 text-xs w-auto gap-1 cursor-pointer">
                <SelectValue placeholder="Per Page" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-md rounded-lg min-w-[80px]">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {formatNumber(size)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Right Page Controls: Previous, Numbered Buttons, Next */}
      <div className="flex items-center justify-center gap-1 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
          className="h-8 px-2 sm:px-2.5 text-xs rounded-lg border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] disabled:opacity-40 cursor-pointer font-headline shrink-0"
          title={prevLabel}
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:mr-1" />
          <span className="hidden sm:inline">{prevLabel}</span>
        </Button>

        {/* Mobile Page Numbers (Fewer navigation buttons for compact fit) */}
        <div className="flex sm:hidden items-center gap-1 px-0.5">
          {getMobilePaginationPages(page, totalPages).map((p, idx) =>
            p === "..." ? (
              <span
                key={`m-dots-${idx}`}
                className="px-1 text-xs text-slate-400 dark:text-muted-foreground select-none"
              >
                ...
              </span>
            ) : (
              <button
                key={`m-page-${p}`}
                type="button"
                disabled={isLoading}
                onClick={() => onPageChange(p as number)}
                className={cn(
                  "min-w-7 h-7 px-1 rounded-lg text-xs font-semibold font-headline transition-colors cursor-pointer",
                  page === p
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-foreground"
                )}
              >
                {formatNumber(p as number)}
              </button>
            )
          )}
        </div>

        {/* Desktop Page Numbers (Full spread) */}
        <div className="hidden sm:flex items-center gap-1 px-1">
          {getPaginationPages(page, totalPages).map((p, idx) =>
            p === "..." ? (
              <span
                key={`dots-${idx}`}
                className="px-2 text-xs text-slate-400 dark:text-muted-foreground select-none"
              >
                ...
              </span>
            ) : (
              <button
                key={`page-${p}`}
                type="button"
                disabled={isLoading}
                onClick={() => onPageChange(p as number)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-semibold font-headline transition-colors cursor-pointer",
                  page === p
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-foreground"
                )}
              >
                {formatNumber(p as number)}
              </button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
          className="h-8 px-2 sm:px-2.5 text-xs rounded-lg border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] disabled:opacity-40 cursor-pointer font-headline shrink-0"
          title={nextLabel}
        >
          <span className="hidden sm:inline">{nextLabel}</span>
          <ChevronRight className="w-3.5 h-3.5 sm:ml-1" />
        </Button>
      </div>
    </div>
  )
}

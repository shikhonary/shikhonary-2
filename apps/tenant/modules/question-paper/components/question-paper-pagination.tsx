"use client"

import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

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

interface QuestionPaperPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export const QuestionPaperPagination: React.FC<QuestionPaperPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  if (totalItems === 0) return null

  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, totalItems)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-slate-200/80 dark:border-white/[0.08] w-full">
      {/* Left Item Counter & Items Per Page Dropdown */}
      <div className="flex items-center gap-3.5 flex-wrap justify-center sm:justify-start">
        <div className="text-xs text-slate-500 dark:text-muted-foreground font-body">
          মোট <span className="font-bold text-foreground font-solaiman">{toBengaliDigits(totalItems)}</span>টি প্রশ্নপত্রের মধ্যে{" "}
          <span className="font-bold text-foreground font-solaiman">{toBengaliDigits(startItem)}</span>–
          <span className="font-bold text-foreground font-solaiman">{toBengaliDigits(endItem)}</span> প্রদর্শিত হচ্ছে
        </div>

        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">প্রতি পাতায়:</span>
            <Select
              value={String(limit)}
              onValueChange={(val) => onLimitChange(Number(val) || 10)}
            >
              <SelectTrigger className="h-8 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-card px-2.5 text-xs w-auto gap-1">
                <SelectValue placeholder="Per Page" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-md rounded-lg min-w-[80px]">
                <SelectItem value="5">৫</SelectItem>
                <SelectItem value="10">১০</SelectItem>
                <SelectItem value="15">১৫</SelectItem>
                <SelectItem value="20">২০</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Right Page Controls: Previous, Numbered Buttons, Next */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2.5 text-xs rounded-lg border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          <span>পূর্ববর্তী</span>
        </Button>

        <div className="flex items-center gap-1 px-1">
          {getPaginationPages(currentPage, totalPages).map((p, idx) =>
            p === "..." ? (
              <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400 dark:text-muted-foreground">
                ...
              </span>
            ) : (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p as number)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold font-headline transition-colors cursor-pointer ${
                  currentPage === p
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-foreground"
                }`}
              >
                {toBengaliDigits(p)}
              </button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2.5 text-xs rounded-lg border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] disabled:opacity-40 cursor-pointer"
        >
          <span>পরবর্তী</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  )
}

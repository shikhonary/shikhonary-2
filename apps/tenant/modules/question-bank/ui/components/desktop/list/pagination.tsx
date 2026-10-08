"use client"

import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

interface DesktopPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  limit: number
  onPageChange: (page: number) => void
}

export const DesktopPagination: React.FC<DesktopPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
}) => {
  if (totalItems === 0) return null

  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, totalItems)

  const pages: (number | string)[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push("...")
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push("...")
    pages.push(totalPages)
  }

  return (
    <div className="p-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-muted-foreground font-body bg-card/60">
      <div>
        সর্বমোট{" "}
        <span className="font-semibold text-foreground">
          {toBengaliDigits(totalItems)}
        </span>
        টি প্রশ্নের মধ্যে{" "}
        <span className="font-semibold text-foreground">
          {toBengaliDigits(startItem)}–{toBengaliDigits(endItem)}
        </span>{" "}
        প্রদর্শিত
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2.5 text-xs border-white/[0.08] hover:bg-white/[0.04] disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          <span>পূর্ববর্তী</span>
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`dots-${idx}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              )
            }
            const pageNum = p as number
            const isCurrent = pageNum === currentPage
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                  isCurrent
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                )}
              >
                {toBengaliDigits(pageNum)}
              </button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2.5 text-xs border-white/[0.08] hover:bg-white/[0.04] disabled:opacity-40 cursor-pointer"
        >
          <span>পরবর্তী</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  )
}

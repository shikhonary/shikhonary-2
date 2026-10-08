"use client"

import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

interface MobilePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

export const MobilePagination: React.FC<MobilePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  if (totalItems === 0) return null

  return (
    <div className="px-4 py-3 flex items-center justify-between text-xs text-muted-foreground font-body">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-8 px-3 text-xs border-white/[0.08] hover:bg-white/[0.04] disabled:opacity-40"
      >
        <ChevronLeft className="w-3.5 h-3.5 mr-1" />
        <span>পূর্ববর্তী</span>
      </Button>

      <div className="font-semibold text-foreground text-xs font-body">
        পৃষ্ঠা {toBengaliDigits(currentPage)} / {toBengaliDigits(totalPages)}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-8 px-3 text-xs border-white/[0.08] hover:bg-white/[0.04] disabled:opacity-40"
      >
        <span>পরবর্তী</span>
        <ChevronRight className="w-3.5 h-3.5 ml-1" />
      </Button>
    </div>
  )
}

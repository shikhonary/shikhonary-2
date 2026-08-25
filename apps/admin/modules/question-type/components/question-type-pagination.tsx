"use client"

import { useTransition } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useQuestionTypeSearchParams } from "../hooks/use-question-type-search-params"

interface QuestionTypePaginationProps {
  totalItems: number
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]

export function QuestionTypePagination({ totalItems }: QuestionTypePaginationProps) {
  const [{ page, limit }, setSearchParams] = useQuestionTypeSearchParams()
  const [isPending, startTransition] = useTransition()

  const totalPages = Math.max(1, Math.ceil(totalItems / limit))
  const displayStart = totalItems > 0 ? (page - 1) * limit + 1 : 0
  const displayEnd = Math.min(page * limit, totalItems)

  const goTo = (newPage: number) => {
    startTransition(() => {
      setSearchParams({ page: newPage })
    })
  }

  const setLimit = (newLimit: string) => {
    startTransition(() => {
      setSearchParams({ limit: Number(newLimit) || 10, page: 1 })
    })
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-low px-4 sm:px-6 py-4">
      <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
        <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
          Showing <span className="font-bold">{displayStart}-{displayEnd}</span> of <span className="font-bold">{totalItems}</span> question types
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-outline font-medium">Rows per page:</span>
          <Select value={String(limit)} onValueChange={setLimit}>
            <SelectTrigger className="h-8 rounded-lg border border-outline-variant bg-white px-2.5 font-body-md text-xs outline-hidden focus:ring-2 focus:ring-primary/10 w-auto gap-1 cursor-pointer">
              <SelectValue placeholder="Per Page" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg min-w-[80px]">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1 || isPending}
          onClick={() => goTo(Math.max(1, page - 1))}
          className="size-8 sm:size-10 rounded-lg border border-outline-variant transition-colors hover:bg-surface-container-high disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <Button
            key={pageNum}
            variant={page === pageNum ? "default" : "ghost"}
            onClick={() => goTo(pageNum)}
            disabled={isPending}
            className={`size-8 sm:size-10 rounded-lg font-body-md text-xs sm:text-sm transition-colors cursor-pointer ${
              page === pageNum
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
          disabled={page >= totalPages || isPending}
          onClick={() => goTo(Math.min(totalPages, page + 1))}
          className="size-8 sm:size-10 rounded-lg border border-outline-variant transition-colors hover:bg-surface-container-high disabled:opacity-30 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

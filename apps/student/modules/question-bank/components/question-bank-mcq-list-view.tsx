"use client"

import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  SlidersHorizontal,
  Bookmark,
  Layers,
  Award,
  ArrowUpDown,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { MCQ_TYPE } from "@workspace/utils/constants"
import { trpc } from "@/trpc/client"
import { QuestionBankMcqCard, QuestionBankMcqItem } from "./question-bank-mcq-card"

const MAX_PAGE_BUTTONS = 5

interface QuestionBankMcqListViewProps {
  subjectId: string
  /** Pre-select a chapter filter (e.g. from chapter chip click on detail page) */
  initialChapterId?: string
}

export function QuestionBankMcqListView({
  subjectId,
  initialChapterId,
}: QuestionBankMcqListViewProps) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    initialChapterId ?? "all"
  )
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedBoardYear, setSelectedBoardYear] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("oldest")

  // Debounce search query to prevent excessive database hits on typing
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Active filter count for mobile badge
  const activeFilterCount =
    (selectedChapterId !== "all" ? 1 : 0) +
    (selectedBoardYear !== "all" ? 1 : 0) +
    (selectedType !== "all" ? 1 : 0) +
    (sortOrder !== "oldest" ? 1 : 0)

  // Board year and text search are independent params
  const mcqsQuery = useQuery(
    trpc.questionBank.list.queryOptions({
      subjectId,
      chapterId: selectedChapterId !== "all" ? selectedChapterId : undefined,
      type: selectedType !== "all" ? selectedType : undefined,
      query: debouncedSearch || undefined,
      sort: sortOrder,
      page,
      limit: limit,
    })
  )

  const chaptersQuery = useQuery(
    trpc.questionBank.byChapter.queryOptions({ subjectId })
  )

  // Board year filter uses the chapter-scoped board years
  const boardYearsQuery = useQuery(
    trpc.questionBank.boardYears.queryOptions({
      subjectId,
      chapterId: selectedChapterId !== "all" ? selectedChapterId : undefined,
    })
  )

  const mcqData = mcqsQuery.data
  const chapters = chaptersQuery.data ?? []
  const boardYears = boardYearsQuery.data ?? []
  const isLoading = mcqsQuery.isLoading
  const isRefetching = mcqsQuery.isFetching && !mcqsQuery.isLoading

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedChapterId("all")
    setSelectedType("all")
    setSelectedBoardYear("all")
    setSortOrder("oldest")
    setPage(1)
  }

  const hasActiveQuery = Boolean(searchQuery && searchQuery.trim() !== "")
  const hasActiveChapter = Boolean(selectedChapterId && selectedChapterId !== "all")
  const hasActiveBoard = Boolean(selectedBoardYear && selectedBoardYear !== "all")
  const hasActiveType = Boolean(selectedType && selectedType !== "all")
  const hasActiveSort = Boolean(sortOrder && sortOrder !== "oldest")

  const hasAnyFilter =
    hasActiveQuery ||
    hasActiveChapter ||
    hasActiveBoard ||
    hasActiveType ||
    hasActiveSort

  const totalItems = mcqData?.totalItems ?? 0
  const displayStart = totalItems > 0 ? (page - 1) * limit + 1 : 0
  const displayEnd = Math.min(page * limit, totalItems)

  // Build numbered page buttons array
  const buildPageButtons = (current: number, total: number): (number | "…")[] => {
    if (total <= MAX_PAGE_BUTTONS) return Array.from({ length: total }, (_, i) => i + 1)
    const half = Math.floor(MAX_PAGE_BUTTONS / 2)
    let start = Math.max(1, current - half)
    let end = Math.min(total, start + MAX_PAGE_BUTTONS - 1)
    if (end - start < MAX_PAGE_BUTTONS - 1) start = Math.max(1, end - MAX_PAGE_BUTTONS + 1)

    const pages: (number | "…")[] = []
    if (start > 1) { pages.push(1); if (start > 2) pages.push("…") }
    for (let p = start; p <= end; p++) pages.push(p)
    if (end < total) { if (end < total - 1) pages.push("…"); pages.push(total) }
    return pages
  }

  // Shared filter controls (used in both Drawer and desktop bar)
  const renderFilterControls = (isMobile: boolean = false) => (
    <>
      {/* Chapter Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[180px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <Bookmark className="h-3.5 w-3.5 text-primary" />
            Chapter
          </label>
        )}
        <Select
          value={selectedChapterId}
          onValueChange={(val) => {
            setSelectedChapterId(val ?? "all")
            setSelectedBoardYear("all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="All Chapters" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64">
            <SelectItem value="all">All Chapters</SelectItem>
            {chapters.map((ch) => (
              <SelectItem key={ch.id} value={ch.id}>
                {typeof ch.position === "number" && ch.position > 0 ? `${ch.position}. ` : ""}
                {ch.name} ({ch.mcqCount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Board Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[150px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-primary" />
            Board / Year
          </label>
        )}
        <Select
          value={selectedBoardYear}
          onValueChange={(val) => {
            setSelectedBoardYear(val ?? "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="All Boards" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64">
            <SelectItem value="all">All Boards</SelectItem>
            {boardYears.map((item) => (
              <SelectItem key={item.rawRef} value={item.rawRef}>
                🎓 {item.boardName} 20{item.year} ({item.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Question Type Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[140px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary" />
            Question Type
          </label>
        )}
        <Select
          value={selectedType}
          onValueChange={(val) => {
            setSelectedType(val ?? "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={MCQ_TYPE.SINGLE}>Knowledge Based</SelectItem>
            <SelectItem value={MCQ_TYPE.MULTIPLE}>Multiple Choice</SelectItem>
            <SelectItem value={MCQ_TYPE.CONTEXTUAL}>Contextual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Select */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[160px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
            Sort Order
          </label>
        )}
        <Select
          value={sortOrder}
          onValueChange={(val: any) => {
            setSortOrder(val ?? "oldest")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="Default Sort" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )

  const pageButtons = buildPageButtons(page, mcqData?.totalPages ?? 1)

  return (
    <div className="space-y-5 font-solaiman">
      {/* Primary Filter Toolbar */}
      <div className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 sm:p-4">
        {/* Search Input Filter */}
        <div className="relative flex-1 min-w-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            filter_list
          </span>
          <Input
            type="text"
            placeholder="Search question, explanation, context..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-outline-variant bg-white py-2.5 pl-10 pr-8 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("")
                setPage(1)
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Drawer Button (Visible ONLY on mobile: md:hidden) */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="md:hidden flex items-center gap-2 h-10 px-3.5 bg-white border-outline-variant/40 text-sm font-medium shrink-0 rounded-lg cursor-pointer"
              type="button"
            >
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              {activeFilterCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold font-solaiman">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DrawerTrigger>

          <DrawerContent className="p-6 space-y-5 bg-white border-t border-outline-variant/40 max-h-[90vh] overflow-y-auto">
            <DrawerHeader className="p-0 text-left">
              <DrawerTitle className="text-base font-bold text-on-surface flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                Filter MCQs
              </DrawerTitle>
              <DrawerDescription className="text-xs text-on-surface-variant">
                Select filters, sorting, and page options to refine MCQ records.
              </DrawerDescription>
            </DrawerHeader>

            {/* Stacked Filter Selects */}
            <div className="space-y-4 pt-1">
              {renderFilterControls(true)}
            </div>

            <DrawerFooter className="p-0 pt-3 flex flex-row items-center gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={handleResetFilters}
                className="flex-1 h-10 text-xs font-bold border-outline-variant/40 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
              <DrawerClose asChild>
                <Button className="flex-1 h-10 text-xs font-bold bg-primary text-white cursor-pointer" type="button">
                  Apply Filters
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Desktop Filter Selects (Visible ONLY on desktop: hidden md:flex) */}
        <div className="hidden md:flex flex-wrap items-center gap-3">
          {renderFilterControls(false)}
        </div>
      </div>

      {/* Active Filter Badges & Reset Row */}
      {hasAnyFilter && (
        <div className="flex flex-col gap-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:bg-transparent sm:border-0 sm:p-0 sm:px-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-outline text-[11px] sm:text-xs uppercase tracking-wider">
              Active Filters:
            </span>

            {/* Search Query Badge */}
            {hasActiveQuery && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal max-w-[200px] truncate"
              >
                <span className="truncate">Search: &quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setPage(1); }}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="Remove search filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Chapter Badge */}
            {hasActiveChapter && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0"
              >
                <span>Chapter: {chapters.find(c => c.id === selectedChapterId)?.name || selectedChapterId}</span>
                <button
                  type="button"
                  onClick={() => { setSelectedChapterId("all"); setSelectedBoardYear("all"); setPage(1); }}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="Remove chapter filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Board Badge */}
            {hasActiveBoard && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0"
              >
                <span>
                  Board:{" "}
                  {(() => {
                    const matched = boardYears.find((item: any) => item.rawRef === selectedBoardYear)
                    return matched ? `${matched.boardName} 20${matched.year}` : selectedBoardYear
                  })()}
                </span>
                <button
                  type="button"
                  onClick={() => { setSelectedBoardYear("all"); setPage(1); }}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="Remove board filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Type Badge */}
            {hasActiveType && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0"
              >
                <span>Type: {selectedType === MCQ_TYPE.SINGLE ? "Knowledge Based" : selectedType === MCQ_TYPE.MULTIPLE ? "Multiple Choice" : "Contextual"}</span>
                <button
                  type="button"
                  onClick={() => { setSelectedType("all"); setPage(1); }}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="Remove type filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Sort Badge */}
            {hasActiveSort && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0"
              >
                <span>Sort: {sortOrder === "newest" ? "Newest First" : "Oldest First"}</span>
                <button
                  type="button"
                  onClick={() => { setSortOrder("oldest"); setPage(1); }}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="Remove sort filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>

          {/* Reset All Badge */}
          <div className="flex justify-end border-t border-outline-variant/20 pt-2 sm:border-0 sm:pt-0">
            <button
              type="button"
              onClick={handleResetFilters}
              className="cursor-pointer focus:outline-hidden"
              title="Reset all active filters"
            >
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 rounded-md border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-primary hover:bg-primary/20 transition-colors normal-case tracking-normal font-solaiman"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset All</span>
              </Badge>
            </button>
          </div>
        </div>
      )}

      {/* ── Result meta bar ── */}
      {mcqData && (
        <div className="flex items-center justify-between px-1 text-xs text-on-surface-variant font-solaiman">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">quiz</span>
            <span>
              <strong className="font-bold text-on-background">{mcqData.totalItems}</strong>{" "}
              question{mcqData.totalItems !== 1 ? "s" : ""}
            </span>
            {isRefetching && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            )}
          </div>
          {mcqData.totalPages > 1 && (
            <span>
              Page{" "}
              <strong className="font-bold text-on-background">{page}</strong>{" "}
              of {mcqData.totalPages}
            </span>
          )}
        </div>
      )}

      {/* ── Loading skeletons ── */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, n) => (
            <Card key={n} className="space-y-4 rounded-2xl border border-outline-variant/40 p-5">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-28 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded" />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <Skeleton className="h-9 w-32 rounded-lg" />
            </Card>
          ))}
        </div>
      ) : mcqData?.items && mcqData.items.length > 0 ? (
        <>
          {/* ── MCQ cards ── */}
          <div className="space-y-4">
            {mcqData.items.map((item, idx) => (
              <QuestionBankMcqCard
                key={item.id}
                item={item as unknown as QuestionBankMcqItem}
                index={(page - 1) * limit + idx}
              />
            ))}
          </div>

          {/* ── Pagination Footer ── */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-outline-variant bg-surface-container-low rounded-xl p-4 mt-6 font-solaiman">
              <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                  Showing <span className="font-bold">{displayStart}-{displayEnd}</span> of <span className="font-bold">{totalItems}</span> questions
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-outline font-medium">Rows per page:</span>
                  <Select
                    value={String(limit)}
                    onValueChange={(val) => {
                      setLimit(Number(val) || 10)
                      setPage(1)
                    }}
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
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className="h-9 w-9 rounded-lg p-0 text-xs cursor-pointer border border-outline-variant bg-white transition-colors hover:bg-surface-container-high disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {pageButtons.map((pb, i) =>
                  pb === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-xs text-on-surface-variant">
                      …
                    </span>
                  ) : (
                    <button
                      key={pb}
                      onClick={() => setPage(pb as number)}
                      className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg px-2 text-xs font-semibold transition-colors cursor-pointer ${
                        page === pb
                          ? "bg-primary text-on-primary"
                          : "border border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low"
                      }`}
                      aria-current={page === pb ? "page" : undefined}
                    >
                      {pb}
                    </button>
                  )
                )}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (mcqData?.totalPages ?? 1)}
                  onClick={() => setPage(Math.min(mcqData?.totalPages ?? 1, page + 1))}
                  className="h-9 w-9 rounded-lg p-0 text-xs cursor-pointer border border-outline-variant bg-white transition-colors hover:bg-surface-container-high disabled:opacity-30"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ── Empty state ── */
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-8 text-center font-solaiman">
          <span className="material-symbols-outlined mb-3 text-5xl text-outline">quiz</span>
          <h3 className="mb-1 text-base font-bold text-on-background">No questions found</h3>
          <p className="mb-5 max-w-xs text-sm text-on-surface-variant">
            Try adjusting your search or removing a filter.
          </p>
          <Button
            onClick={handleResetFilters}
            variant="outline"
            size="sm"
            className="gap-2 text-xs cursor-pointer font-solaiman"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  )
}

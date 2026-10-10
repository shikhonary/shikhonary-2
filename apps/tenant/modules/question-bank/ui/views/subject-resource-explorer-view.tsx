"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Button } from "@workspace/ui/components/button"
import { useQuestionBankSubjectDetails } from "../../services/use-question-bank"
import { useBookmarkedQuestionsStore } from "../../store/use-bookmarked-questions-store"
import { SubjectExplorerHeader } from "../components/subject-explorer/subject-explorer-header"
import { QuestionTypesTabs } from "../components/subject-explorer/question-types-tabs"
import { SubjectExplorerFilters } from "../components/subject-explorer/subject-explorer-filters"
import { SubjectExplorerGrid } from "../components/subject-explorer/subject-explorer-grid"
import { MobileSubjectExplorer } from "../components/subject-explorer/mobile-subject-explorer"
import { QuestionPreviewDrawer } from "../components/modals/question-preview-drawer"
import { CurriculumGuideBanner } from "../components/classes/curriculum-guide-banner"
import type { QuestionTypeCode } from "@workspace/utils"

interface SubjectResourceExplorerViewProps {
  classId: string
  subjectId: string
}

export const SubjectResourceExplorerView: React.FC<SubjectResourceExplorerViewProps> = ({
  classId,
  subjectId,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlCategory = searchParams.get("category") || "ALL"
  const urlChapterId = searchParams.get("chapterId") || "All"
  const urlBoard = searchParams.get("board") || "All"
  const urlSource = searchParams.get("source") || "All"
  const urlDifficulty = searchParams.get("difficulty") || "All"
  const urlSearch = searchParams.get("search") || ""
  const urlSort = (searchParams.get("sort") as "newest" | "oldest") || "newest"
  const urlPage = parseInt(searchParams.get("page") || "1", 10)
  const urlBookmarkedOnly = searchParams.get("bookmarked") === "true"

  const [search, setSearch] = useState(urlSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch)
  const [isBookmarkedOnly, setIsBookmarkedOnly] = useState(urlBookmarkedOnly)

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)
    return () => clearTimeout(handler)
  }, [search])

  const { data, isLoading, error } = useQuestionBankSubjectDetails(classId, subjectId)

  // Fetch dynamic Reference (Board & Year) and Source options like the builder picker
  const { data: boardYearsData } = useQuery({
    ...trpc.questionPaper.getAvailableBoardYears.queryOptions({
      subjectId,
      chapterId: urlChapterId !== "All" ? urlChapterId : undefined,
      category: urlCategory !== "ALL" ? (urlCategory as QuestionTypeCode) : undefined,
    }),
    enabled: Boolean(subjectId),
  })
  const boardYears = boardYearsData ?? []

  const { data: sourcesData } = useQuery({
    ...trpc.questionPaper.getAvailableSources.queryOptions({
      subjectId,
      chapterId: urlChapterId !== "All" ? urlChapterId : undefined,
      category: urlCategory !== "ALL" ? (urlCategory as QuestionTypeCode) : undefined,
    }),
    enabled: Boolean(subjectId),
  })
  const sources = sourcesData ?? []

  // Bookmarking store integration
  const bookmarks = useBookmarkedQuestionsStore((s) => s.bookmarks)
  const bookmarkedIdsForSubject = useMemo(() => {
    return Object.values(bookmarks)
      .filter((b) => b.subjectId === subjectId)
      .map((b) => b.id)
  }, [bookmarks, subjectId])
  const bookmarkedCount = bookmarkedIdsForSubject.length

  const questionTypes = data?.questionTypes || []
  const chapters = data?.chapters || []
  const totalQuestions = data?.totalQuestions || 0

  // Active filters calculation
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (urlChapterId !== "All") count++
    if (urlBoard !== "All") count++
    if (urlSource !== "All") count++
    if (urlDifficulty !== "All") count++
    if (debouncedSearch.trim() !== "") count++
    if (urlSort !== "newest") count++
    return count
  }, [urlChapterId, urlBoard, urlSource, urlDifficulty, debouncedSearch, urlSort])

  const updateUrlParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "All" && value !== "ALL" && value !== "") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset page to 1 on filter changes
    if (key !== "page") {
      params.delete("page")
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleSelectCategory = (categoryCode: string) => {
    updateUrlParam("category", categoryCode === "ALL" ? null : categoryCode)
  }

  const handleChapterChange = (chapterId: string) => {
    updateUrlParam("chapterId", chapterId === "All" ? null : chapterId)
  }

  const handleBoardChange = (board: string) => {
    updateUrlParam("board", board === "All" ? null : board)
  }

  const handleSourceChange = (source: string) => {
    updateUrlParam("source", source === "All" ? null : source)
  }

  const handleDifficultyChange = (diff: string) => {
    updateUrlParam("difficulty", diff === "All" ? null : diff)
  }

  const handleSortChange = (sort: "newest" | "oldest") => {
    updateUrlParam("sort", sort === "newest" ? null : sort)
  }

  const handlePageChange = (newPage: number) => {
    updateUrlParam("page", newPage === 1 ? null : newPage.toString())
  }

  const handleResetFilters = () => {
    setSearch("")
    setDebouncedSearch("")
    setIsBookmarkedOnly(false)
    const params = new URLSearchParams()
    if (urlCategory !== "ALL") params.set("category", urlCategory)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleToggleBookmarkedOnly = () => {
    const next = !isBookmarkedOnly
    setIsBookmarkedOnly(next)
    updateUrlParam("bookmarked", next ? "true" : null)
  }

  if (error || (!isLoading && !data?.subject)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-card rounded-2xl border border-border/50 max-w-lg mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-headline text-foreground">
          বিষয় পাওয়া যায়নি
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground font-body mt-1 max-w-sm">
          অনুরোধকৃত বিষয়ের তথ্য খুঁজে পাওয়া যায়নি অথবা তা নিষ্ক্রিয় করা হয়েছে।
        </p>
        <Button asChild className="mt-6 rounded-xl text-xs font-bold" size="sm">
          <Link href={`/question-bank/${classId}`}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            <span>শ্রেণি বিবরণীতে ফিরে যান</span>
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* ── Desktop View (Hidden on mobile) ───────────────────────── */}
      <div className="hidden md:block min-h-screen bg-slate-50/50 dark:bg-background relative isolate w-full min-w-0">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10 space-y-6 w-full min-w-0">
          {/* Header */}
          <SubjectExplorerHeader
            classId={classId}
            subjectId={subjectId}
            data={data}
            isLoading={isLoading}
            bookmarkedCount={bookmarkedCount}
          />

          {/* Sticky Question Types Horizontal Tabs */}
          <QuestionTypesTabs
            questionTypes={questionTypes}
            activeCategory={urlCategory}
            onSelectCategory={handleSelectCategory}
            totalQuestions={totalQuestions}
            bookmarkedCount={bookmarkedCount}
            isBookmarkedOnly={isBookmarkedOnly}
            onToggleBookmarkedOnly={handleToggleBookmarkedOnly}
            isLoading={isLoading}
          />

          {/* Filter Bar */}
          <SubjectExplorerFilters
            search={search}
            onSearchChange={setSearch}
            selectedChapterId={urlChapterId}
            onChapterChange={handleChapterChange}
            chapters={chapters}
            selectedBoard={urlBoard}
            onBoardChange={handleBoardChange}
            boardYears={boardYears}
            selectedSource={urlSource}
            onSourceChange={handleSourceChange}
            sources={sources}
            selectedDifficulty={urlDifficulty}
            onDifficultyChange={handleDifficultyChange}
            selectedSort={urlSort}
            onSortChange={handleSortChange}
            onResetFilters={handleResetFilters}
            activeFiltersCount={activeFiltersCount}
            isLoading={isLoading}
          />

          {/* Question Grid */}
          <SubjectExplorerGrid
            subjectId={subjectId}
            category={urlCategory as QuestionTypeCode}
            search={debouncedSearch}
            chapterId={urlChapterId}
            board={urlBoard}
            source={urlSource}
            difficulty={urlDifficulty}
            sort={urlSort}
            page={urlPage}
            limit={20}
            onPageChange={handlePageChange}
            isBookmarkedOnly={isBookmarkedOnly}
          />

          {/* Curriculum Guide Banner */}
          <CurriculumGuideBanner />
        </main>
      </div>

      {/* ── Mobile View (Hidden on desktop) ────────────────────────── */}
      <div className="md:hidden -m-4 sm:-m-6">
        <MobileSubjectExplorer
          classId={classId}
          subjectId={subjectId}
          data={data}
          isLoading={isLoading}
          activeCategory={urlCategory}
          onSelectCategory={handleSelectCategory}
          search={search}
          onSearchChange={setSearch}
          selectedChapterId={urlChapterId}
          onChapterChange={handleChapterChange}
          selectedBoard={urlBoard}
          onBoardChange={handleBoardChange}
          boardYears={boardYears}
          selectedSource={urlSource}
          onSourceChange={handleSourceChange}
          sources={sources}
          selectedDifficulty={urlDifficulty}
          onDifficultyChange={handleDifficultyChange}
          selectedSort={urlSort}
          onSortChange={handleSortChange}
          onResetFilters={handleResetFilters}
          activeFiltersCount={activeFiltersCount}
          bookmarkedCount={bookmarkedCount}
          isBookmarkedOnly={isBookmarkedOnly}
          onToggleBookmarkedOnly={handleToggleBookmarkedOnly}
          page={urlPage}
          onPageChange={handlePageChange}
        />
      </div>

      {/* ── Question Full Preview Drawer Modal ────────────────────── */}
      <QuestionPreviewDrawer />
    </>
  )
}

"use client"

import React, { useState } from "react"
import { MobileHeader } from "./header"
import { MobileStats } from "./stats"
import { MobileCard } from "./card"
import { MobilePagination } from "./pagination"
import { MobileFilterSheet } from "./filter-sheet"
import { Sparkles } from "lucide-react"
import type { QuestionBankItem } from "@/modules/question-bank/types"
import { useQuestionBankSearchParams } from "@/modules/question-bank/hooks/use-question-bank-search-params"
import {
  useQuestionBankList,
  useQuestionBankStats,
  useQuestionBankFilterOptions,
} from "@/modules/question-bank/services/use-question-bank"

export const QuestionBankMobileList: React.FC = () => {
  const [params, setParams] = useQuestionBankSearchParams()
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)

  // Queries
  const { data: listData, isLoading: isListLoading } = useQuestionBankList({
    search: params.search || undefined,
    classId: params.classId === "All" ? undefined : params.classId,
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
    category: params.category === "ALL" ? undefined : params.category,
    difficulty: params.difficulty === "All" ? undefined : params.difficulty,
    board: params.board === "All" ? undefined : params.board,
    sort: params.sort,
    page: params.page,
    limit: 10,
  })

  const { data: statsData, isLoading: isStatsLoading } = useQuestionBankStats({
    classId: params.classId === "All" ? undefined : params.classId,
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
  })

  const { data: filterOpts } = useQuestionBankFilterOptions({
    classId: params.classId === "All" ? undefined : params.classId,
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
  })

  const questions = listData?.items ?? []
  const totalItems = listData?.totalItems ?? 0
  const totalPages = listData?.totalPages ?? 1

  const activeFiltersCount = [
    params.classId !== "All",
    params.subjectId !== "All",
    params.chapterId !== "All",
    params.difficulty !== "All",
    params.category !== "MCQ",
  ].filter(Boolean).length

  const handleResetFilters = () => {
    setParams({
      search: "",
      classId: "All",
      subjectId: "All",
      chapterId: "All",
      category: "MCQ",
      difficulty: "All",
      page: 1,
    })
    setIsFilterSheetOpen(false)
  }

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col pb-24">
      {/* Sticky Mobile Header */}
      <MobileHeader
        search={params.search}
        onSearchChange={(search) => setParams({ search, page: 1 })}
        onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Main Content Stream */}
      <main className="flex-grow py-3 flex flex-col gap-3">
        {/* Horizontal Stats Pills */}
        <MobileStats stats={statsData} isLoading={isStatsLoading} />

        {/* Card Stream */}
        <div className="px-4 space-y-3">
          {isListLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-card rounded-xl border border-white/[0.06] animate-pulse"
                />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground mb-3">
                <Sparkles className="w-5 h-5 text-primary/60" />
              </div>
              <h3 className="text-sm font-semibold text-foreground font-headline">
                কোনো প্রশ্ন মেলেনি
              </h3>
              <p className="text-xs text-muted-foreground font-body mt-1">
                অনুগ্রহ করে ফিল্টার পরিবর্তন করুন
              </p>
            </div>
          ) : (
            questions.map((q: QuestionBankItem) => <MobileCard key={q.id} question={q} />)
          )}
        </div>
      </main>

      {/* Mobile Pagination */}
      <MobilePagination
        currentPage={params.page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={(page) => setParams({ page })}
      />

      {/* Filter Bottom Sheet */}
      <MobileFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        classId={params.classId}
        onClassChange={(classId) =>
          setParams({ classId, subjectId: "All", chapterId: "All", page: 1 })
        }
        subjectId={params.subjectId}
        onSubjectChange={(subjectId) =>
          setParams({ subjectId, chapterId: "All", page: 1 })
        }
        chapterId={params.chapterId}
        onChapterChange={(chapterId) => setParams({ chapterId, page: 1 })}
        category={params.category}
        onCategoryChange={(category) => setParams({ category, page: 1 })}
        difficulty={params.difficulty}
        onDifficultyChange={(difficulty) => setParams({ difficulty, page: 1 })}
        classes={filterOpts?.classes ?? []}
        subjects={filterOpts?.subjects ?? []}
        chapters={filterOpts?.chapters ?? []}
        categories={filterOpts?.categories ?? []}
        onReset={handleResetFilters}
      />
    </div>
  )
}

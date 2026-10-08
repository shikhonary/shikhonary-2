"use client"

import React from "react"
import { DesktopHeader } from "./header"
import { DesktopStats } from "./stats"
import { DesktopFilters } from "./filters"
import { DesktopQuestionGrid } from "./question-grid"
import { DesktopQuestionTable } from "./question-table"
import { DesktopPagination } from "./pagination"
import { useQuestionBankSearchParams } from "@/modules/question-bank/hooks/use-question-bank-search-params"
import {
  useQuestionBankList,
  useQuestionBankStats,
  useQuestionBankFilterOptions,
} from "@/modules/question-bank/services/use-question-bank"

export const QuestionBankDesktopList: React.FC = () => {
  const [params, setParams] = useQuestionBankSearchParams()

  // Queries
  const {
    data: listData,
    isLoading: isListLoading,
    refetch: refetchList,
    isRefetching,
  } = useQuestionBankList({
    search: params.search || undefined,
    classId: params.classId === "All" ? undefined : params.classId,
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
    category: params.category === "ALL" ? undefined : params.category,
    difficulty: params.difficulty === "All" ? undefined : params.difficulty,
    board: params.board === "All" ? undefined : params.board,
    sort: params.sort,
    page: params.page,
    limit: params.limit,
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

  const hasActiveFilters =
    Boolean(params.search) ||
    params.classId !== "All" ||
    params.subjectId !== "All" ||
    params.chapterId !== "All" ||
    params.difficulty !== "All" ||
    params.board !== "All"

  const handleResetFilters = () => {
    setParams({
      search: "",
      classId: "All",
      subjectId: "All",
      chapterId: "All",
      difficulty: "All",
      board: "All",
      page: 1,
    })
  }

  return (
    <div className="min-h-screen bg-background relative isolate">
      <main className="container mx-auto px-6 py-10 lg:px-12 max-w-7xl relative z-10 space-y-8">
        {/* Page Header */}
        <DesktopHeader
          onRefresh={() => refetchList()}
          isRefreshing={isRefetching}
        />

        {/* 4-Card Hero Stats Row */}
        <DesktopStats stats={statsData} isLoading={isStatsLoading} />

        {/* Main Content Card: Filters + View Content + Pagination */}
        <div className="bg-card rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col shadow-sm">
          {/* Filters Toolbar */}
          <DesktopFilters
            search={params.search}
            onSearchChange={(search) => setParams({ search, page: 1 })}
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
            sort={params.sort}
            onSortChange={(sort) => setParams({ sort, page: 1 })}
            viewMode={params.viewMode}
            onViewModeChange={(viewMode) => setParams({ viewMode })}
            classes={filterOpts?.classes ?? []}
            subjects={filterOpts?.subjects ?? []}
            chapters={filterOpts?.chapters ?? []}
            categories={filterOpts?.categories ?? []}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Dual View Modes: Table vs Grid */}
          <div className="relative flex-grow">
            {params.viewMode === "grid" ? (
              <div className="p-6 bg-card">
                <DesktopQuestionGrid
                  questions={questions}
                  isLoading={isListLoading}
                />
              </div>
            ) : (
              <DesktopQuestionTable
                questions={questions}
                isLoading={isListLoading}
                currentPage={params.page}
                limit={params.limit}
              />
            )}
          </div>

          {/* Pagination */}
          <DesktopPagination
            currentPage={params.page}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={params.limit}
            onPageChange={(page) => setParams({ page })}
          />
        </div>
      </main>
    </div>
  )
}

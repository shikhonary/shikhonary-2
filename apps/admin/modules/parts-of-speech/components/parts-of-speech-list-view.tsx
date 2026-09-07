"use client"

import { useState } from "react"
import {
  usePartsOfSpeechList,
  usePartsOfSpeechStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
} from "../services/use-parts-of-speech"
import { usePartsOfSpeechSearchParams } from "../hooks/use-parts-of-speech-search-params"
import { useDeletePartsOfSpeechModalStore } from "../store/use-delete-parts-of-speech-modal-store"
import { PartsOfSpeechListHeader } from "./parts-of-speech-list-header"
import { PartsOfSpeechStatsCards } from "./parts-of-speech-stats-cards"
import { PartsOfSpeechFilters } from "./parts-of-speech-filters"
import { PartsOfSpeechTable } from "./parts-of-speech-table"
import { DeletePartsOfSpeechModal } from "./delete-parts-of-speech-modal"

export function PartsOfSpeechListView() {
  const [params, setParams] = usePartsOfSpeechSearchParams()
  const { openModal, openBulkModal } = useDeletePartsOfSpeechModalStore()
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState("All")

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )

  const { data: statsData, isLoading: isStatsLoading } = usePartsOfSpeechStats(
    params.subjectId !== "All" ? { subjectId: params.subjectId } : undefined
  )

  const { data: listData, isLoading: isListLoading, isError } = usePartsOfSpeechList({
    page: params.page,
    limit: params.limit,
    query: params.query || undefined,
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    difficulty: params.difficulty !== "All" ? params.difficulty : undefined,
    sort: params.sort !== "All" ? params.sort : undefined,
  })

  return (
    <div className="w-full space-y-6">
      <PartsOfSpeechListHeader />

      <PartsOfSpeechStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isStatsLoading}
      />

      <PartsOfSpeechFilters
        searchQuery={params.query}
        onSearchChange={(query) => setParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={(clsId) => {
          setSelectedAcademicClassId(clsId)
          setParams({ subjectId: "All", page: 1 })
        }}
        academicClasses={academicClasses}
        selectedSubjectId={params.subjectId}
        onSubjectChange={(subjectId) => setParams({ subjectId, page: 1 })}
        subjects={subjects}
        selectedDifficulty={params.difficulty}
        onDifficultyChange={(difficulty) => setParams({ difficulty, page: 1 })}
        selectedSort={params.sort}
        onSortChange={(sort) => setParams({ sort: sort as any, page: 1 })}
      />

      <PartsOfSpeechTable
        items={listData?.items ?? []}
        isLoading={isListLoading}
        isError={isError}
        currentPage={params.page}
        itemsPerPage={params.limit}
        totalItems={listData?.totalItems ?? 0}
        totalPages={listData?.totalPages ?? 1}
        onPageChange={(page) => setParams({ page })}
        onLimitChange={(limit) => setParams({ limit, page: 1 })}
        onDelete={(id, contentSnippet) => openModal(id, contentSnippet)}
        onBulkDelete={(ids) => openBulkModal(ids)}
      />

      <DeletePartsOfSpeechModal />
    </div>
  )
}

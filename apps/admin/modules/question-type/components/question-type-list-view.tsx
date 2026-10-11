"use client"

import React, { useState } from "react"
import { useQuestionTypesList, useToggleQuestionTypeStatus } from "../services/use-question-type"
import { useDeleteQuestionTypeModalStore } from "../store/use-delete-question-type-modal-store"
import { QuestionTypeListHeader } from "./question-type-list-header"
import { QuestionTypeFilters } from "./question-type-filters"
import { QuestionTypeTable } from "./question-type-table"
import { DeleteQuestionTypeModal } from "./delete-question-type-modal"
import { QuestionTypePagination } from "./question-type-pagination"
import { BatchCreditPricingModal } from "./batch-credit-pricing-modal"
import { useQuestionTypeSearchParams } from "../hooks/use-question-type-search-params"

export function QuestionTypeListView() {
  const [isBatchPricingOpen, setIsBatchPricingOpen] = useState(false)
  const [{ query: searchQuery, sort: selectedSort, page: currentPage, limit }, setSearchParams] =
    useQuestionTypeSearchParams()

  const openDeleteModal = useDeleteQuestionTypeModalStore((state) => state.openModal)
  const toggleStatusMutation = useToggleQuestionTypeStatus()

  const { data: listData, isLoading, isError } = useQuestionTypesList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    sort: selectedSort || undefined,
  })

  const displayItems = listData?.questionTypes ?? []
  const totalItems = listData?.totalItems ?? 0

  return (
    <div className="w-full">
      {/* Header */}
      <QuestionTypeListHeader onOpenBatchPricing={() => setIsBatchPricingOpen(true)} />

      {/* Filters & Action Bar */}
      <QuestionTypeFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchParams({ query, page: 1 })
        }}
        selectedSort={selectedSort}
        onSortChange={(sort) => {
          setSearchParams({ sort: sort as any, page: 1 })
        }}
      />

      {/* Data Table */}
      <QuestionTypeTable
        items={displayItems}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, name) => openDeleteModal(id, name)}
        onToggleActive={(id) => toggleStatusMutation.mutate({ id })}
      />

      {/* Pagination */}
      {!isLoading && !isError && totalItems > 0 && (
        <QuestionTypePagination totalItems={totalItems} />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteQuestionTypeModal />

      {/* Batch Credit Pricing Modal */}
      <BatchCreditPricingModal
        open={isBatchPricingOpen}
        onOpenChange={setIsBatchPricingOpen}
      />
    </div>
  )
}


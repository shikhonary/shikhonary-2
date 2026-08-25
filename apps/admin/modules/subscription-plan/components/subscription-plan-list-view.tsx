"use client"

import { useSubscriptionPlansList } from "../services/use-subscription-plan"
import { useDeleteSubscriptionPlanModalStore } from "../store/use-delete-subscription-plan-modal-store"
import { SubscriptionPlanListHeader } from "./subscription-plan-list-header"
import { SubscriptionPlanFilters } from "./subscription-plan-filters"
import { SubscriptionPlanGrid } from "./subscription-plan-grid"
import { Pagination } from "./pagination"
import { DeleteSubscriptionPlanModal } from "./delete-subscription-plan-modal"
import { useSubscriptionPlanSearchParams } from "../hooks/use-subscription-plan-search-params"

export function SubscriptionPlanListView() {
  const [{ query: searchQuery, sort: selectedSort, page: currentPage, limit }, setSearchParams] =
    useSubscriptionPlanSearchParams()

  const openDeleteModal = useDeleteSubscriptionPlanModalStore((state) => state.openModal)

  const { data: plansData, isLoading, isError } = useSubscriptionPlansList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    sort: selectedSort || undefined,
  })

  const displayItems = plansData?.plans ?? []
  const totalItems = plansData?.totalItems ?? 0

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <SubscriptionPlanListHeader />

      {/* Filters & Action Bar */}
      <SubscriptionPlanFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchParams({ query, page: 1 })
        }}
        selectedSort={selectedSort}
        onSortChange={(sort) => {
          setSearchParams({ sort: sort as any, page: 1 })
        }}
      />

      {/* Data Grid */}
      <SubscriptionPlanGrid
        items={displayItems}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, name) => openDeleteModal(id, name)}
      />

      {/* Pagination */}
      {!isLoading && !isError && totalItems > 0 && (
        <Pagination totalItems={totalItems} />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteSubscriptionPlanModal />
    </div>
  )
}

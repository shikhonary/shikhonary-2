"use client"

import { useState } from "react"
import {
  useAcademicYearsList,
  useAcademicYearStats,
  useToggleAcademicYearStatus,
  useDeleteAcademicYear,
} from "../services/use-academic-year"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@workspace/ui/components/sonner"
import { Calendar, Plus } from "lucide-react"

import { AcademicYearStatsCards } from "./academic-year-stats-cards"
import { AcademicYearFilters } from "./academic-year-filters"
import { AcademicYearTable, type AcademicYearItem } from "./academic-year-table"
import { CreateAcademicYearModal } from "./create-academic-year-modal"
import { EditAcademicYearModal } from "./edit-academic-year-modal"
import { useAcademicYearSearchParams } from "../hooks/use-academic-year-search-params"
import { useCreateAcademicYearModalStore } from "../store/use-create-academic-year-modal-store"
import { useEditAcademicYearModalStore } from "../store/use-edit-academic-year-modal-store"

export function AcademicYearListView() {
  const [
    {
      query: searchQuery,
      sort: selectedSort,
      page: currentPage,
      limit,
      isActive: selectedIsActive,
      isCurrent: selectedIsCurrent,
    },
    setSearchParams,
  ] = useAcademicYearSearchParams()

  const openCreateModal = useCreateAcademicYearModalStore((state) => state.openModal)
  const openEditModal = useEditAcademicYearModalStore((state) => state.openModal)

  // Local state for delete dialog matching MCQ module
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const deleteMutation = useDeleteAcademicYear()
  const toggleStatusMutation = useToggleAcademicYearStatus()

  // Query stats
  const { data: statsData, isLoading: isStatsLoading } = useAcademicYearStats()

  // Query years list with search & filters
  const { data: yearsData, isLoading, isError } = useAcademicYearsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    isActive:
      selectedIsActive === "ACTIVE"
        ? true
        : selectedIsActive === "INACTIVE"
        ? false
        : undefined,
    isCurrent:
      selectedIsCurrent === "CURRENT"
        ? true
        : selectedIsCurrent === "NOT_CURRENT"
        ? false
        : undefined,
    sort: selectedSort === "All" ? undefined : selectedSort,
  })

  const items = (yearsData?.academicYears as AcademicYearItem[]) ?? []
  const totalItems = yearsData?.totalItems ?? items.length
  const totalPages = yearsData?.totalPages ?? 1

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success("শিক্ষাবর্ষটি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "শিক্ষাবর্ষ ডিলিট করা সম্ভব হয়নি")
    }
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header matching MCQ */}
      <PageHeader
        title="একাডেমিক শিক্ষাবর্ষ (Academic Years)"
        description="বিদ্যালয়ের শিক্ষাবর্ষ, সময়সীমা এবং বর্তমান সেশন পরিচালনা করুন।"
        icon={Calendar}
        badge={{ label: "শিক্ষাবর্ষ মডিউল", variant: "indigo" }}
        action={{
          label: "নতুন শিক্ষাবর্ষ যোগ করুন",
          onClick: openCreateModal,
          icon: Plus,
        }}
      />

      {/* Stats Cards matching MCQ */}
      <AcademicYearStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        currentYearName={statsData?.currentYearName}
        isLoading={isStatsLoading}
      />

      {/* Filters matching MCQ */}
      <AcademicYearFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedIsCurrent={selectedIsCurrent}
        onIsCurrentChange={(isCurrent) => setSearchParams({ isCurrent, page: 1 })}
        selectedIsActive={selectedIsActive}
        onIsActiveChange={(isActive) => setSearchParams({ isActive, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table / Cards matching MCQ */}
      <AcademicYearTable
        items={items}
        isLoading={isLoading}
        isError={isError}
        onEdit={(item) => openEditModal(item.id)}
        onDelete={(id, name) => setDeleteTarget({ id, name })}
        onToggleActive={(id) => toggleStatusMutation.mutate({ id })}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
        onCreateNew={openCreateModal}
      />

      {/* Shared Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="শিক্ষাবর্ষ ডিলিট করতে চান?"
        itemName={deleteTarget?.name}
        warningText="এই শিক্ষাবর্ষটি মুছে ফেললে এর সাথে সংশ্লিষ্ট বিষয়, অধ্যায় এবং পাঠ্যসূচি ক্ষতিগ্রস্ত হতে পারে।"
        isLoading={deleteMutation.isPending}
      />

      {/* Create Modal */}
      <CreateAcademicYearModal />

      {/* Edit Modal */}
      <EditAcademicYearModal />
    </div>
  )
}

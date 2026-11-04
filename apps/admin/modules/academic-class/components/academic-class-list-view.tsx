"use client"

import { useState } from "react"
import {
  useAcademicClassesList,
  useAcademicClassStats,
  useToggleAcademicClassStatus,
  useDeleteAcademicClass,
  useAcademicYearsForSelection,
} from "../services/use-academic-class"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@workspace/ui/components/sonner"
import { GraduationCap, Plus } from "lucide-react"

import { AcademicClassStatsCards } from "./academic-class-stats-cards"
import { AcademicClassFilters } from "./academic-class-filters"
import { AcademicClassTable, type AcademicClassItem } from "./academic-class-table"
import { CreateAcademicClassModal } from "./create-academic-class-modal"
import { EditAcademicClassModal } from "./edit-academic-class-modal"
import { useAcademicClassSearchParams } from "../hooks/use-academic-class-search-params"
import { useCreateAcademicClassModalStore } from "../store/use-create-academic-class-modal-store"
import { useEditAcademicClassModalStore } from "../store/use-edit-academic-class-modal-store"

export function AcademicClassListView() {
  const [
    {
      query: searchQuery,
      sort: selectedSort,
      page: currentPage,
      limit,
      academicYearId: selectedYear,
      isActive: selectedIsActive,
    },
    setSearchParams,
  ] = useAcademicClassSearchParams()

  const openCreateModal = useCreateAcademicClassModalStore((state) => state.openModal)
  const openEditModal = useEditAcademicClassModalStore((state) => state.openModal)

  // Local state for delete dialog matching MCQ module
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const deleteMutation = useDeleteAcademicClass()
  const toggleStatusMutation = useToggleAcademicClassStatus()

  // Query stats
  const { data: statsData, isLoading: isStatsLoading } = useAcademicClassStats({
    academicYearId: selectedYear !== "All" ? selectedYear : undefined,
  })

  // Query academic years for filtering
  const { data: yearsData } = useAcademicYearsForSelection()
  const academicYears = yearsData?.academicYears ?? []

  // Query classes list with search & filters
  const { data: classesData, isLoading, isError } = useAcademicClassesList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    academicYearId: selectedYear === "All" ? undefined : selectedYear,
    isActive:
      selectedIsActive === "ACTIVE"
        ? true
        : selectedIsActive === "INACTIVE"
        ? false
        : undefined,
    sort: selectedSort === "All" ? undefined : selectedSort,
  })

  const items = (classesData?.academicClasses as AcademicClassItem[]) ?? []
  const totalItems = classesData?.totalItems ?? items.length
  const totalPages = classesData?.totalPages ?? 1

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success("শ্রেণিটি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "শ্রেণি ডিলিট করা সম্ভব হয়নি")
    }
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header matching MCQ */}
      <PageHeader
        title="একাডেমিক শ্রেণি ব্যবস্থাপনা (Classes)"
        description="বিদ্যালয়ের বিভিন্ন শ্রেণি, গ্রেড লেভেল এবং বিষয়সমূহের বিন্যাস পরিচালনা করুন।"
        icon={GraduationCap}
        badge={{ label: "শ্রেণি মডিউল", variant: "indigo" }}
        action={{
          label: "নতুন শ্রেণি যোগ করুন",
          onClick: openCreateModal,
          icon: Plus,
        }}
      />

      {/* Stats Cards matching MCQ */}
      <AcademicClassStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        subjectCount={statsData?.subjectCount}
        isLoading={isStatsLoading}
      />

      {/* Filters matching MCQ */}
      <AcademicClassFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedYear={selectedYear}
        onYearChange={(academicYearId) => setSearchParams({ academicYearId, page: 1 })}
        academicYears={academicYears}
        selectedIsActive={selectedIsActive}
        onIsActiveChange={(isActive) => setSearchParams({ isActive, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table / Cards matching MCQ */}
      <AcademicClassTable
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
        title="শ্রেণি ডিলিট করতে চান?"
        itemName={deleteTarget?.name}
        warningText="এই শ্রেণিটি ডিলিট করলে এর সাথে সংশ্লিষ্ট সমস্ত বিষয়, অধ্যায় ও প্রশ্নপত্র ক্ষতিগ্রস্ত হতে পারে।"
        isLoading={deleteMutation.isPending}
      />

      {/* Create Modal */}
      <CreateAcademicClassModal />

      {/* Edit Modal */}
      <EditAcademicClassModal />
    </div>
  )
}

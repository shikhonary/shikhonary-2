"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  useSubjectsList,
  useSubjectStats,
  useToggleSubjectStatus,
  useDeleteSubject,
  useAcademicClassesForSelection,
  useAcademicYearsForSelection,
} from "../services/use-subject"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@workspace/ui/components/sonner"
import { BookOpen, Plus } from "lucide-react"
import { SubjectStatsCards } from "./subject-stats-cards"
import { SubjectFilters } from "./subject-filters"
import { SubjectTable, type SubjectItem } from "./subject-table"
import { useSubjectSearchParams } from "../hooks/use-subject-search-params"

export function SubjectManagementView() {
  const router = useRouter()
  const [
    {
      query: searchQuery,
      sort: selectedSort,
      page: currentPage,
      limit,
      academicYearId: selectedYear,
      classId: selectedClass,
      group: selectedGroup,
      isActive: selectedIsActive,
    },
    setSearchParams,
  ] = useSubjectSearchParams()

  // Local state for delete dialog matching MCQ module
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const deleteMutation = useDeleteSubject()
  const toggleStatusMutation = useToggleSubjectStatus()

  // Query stats
  const { data: statsData, isLoading: isStatsLoading } = useSubjectStats({
    academicYearId: selectedYear !== "All" ? selectedYear : undefined,
    classId: selectedClass !== "All" ? selectedClass : undefined,
  })

  // Dropdown data options
  const { data: yearsData } = useAcademicYearsForSelection()
  const academicYears = yearsData?.academicYears ?? []

  const { data: classesData } = useAcademicClassesForSelection(
    selectedYear === "All" ? undefined : selectedYear
  )
  const academicClasses = classesData?.academicClasses ?? []

  // Query subjects list with search & filters
  const { data: subjectsData, isLoading, isError } = useSubjectsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    academicYearId: selectedYear === "All" ? undefined : selectedYear,
    classId: selectedClass === "All" ? undefined : selectedClass,
    group: selectedGroup === "All" ? undefined : selectedGroup,
    isActive:
      selectedIsActive === "ACTIVE"
        ? true
        : selectedIsActive === "INACTIVE"
        ? false
        : undefined,
    sort: selectedSort as any,
  })

  const items = (subjectsData?.academicSubjects as SubjectItem[]) ?? []
  const totalItems = subjectsData?.totalItems ?? items.length
  const totalPages = subjectsData?.totalPages ?? 1

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success("বিষয়টি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "বিষয় ডিলিট করা সম্ভব হয়নি")
    }
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header matching MCQ */}
      <PageHeader
        title="একাডেমিক বিষয় ব্যবস্থাপনা (Subjects)"
        description="শ্রেণি ও শিক্ষাবর্ষভিত্তিক পাঠ্যবিষয়, গ্রুপ, বিষয় কোড এবং প্রশ্ন কাঠামোর রূপরেখা পরিচালনা করুন।"
        icon={BookOpen}
        badge={{ label: "বিষয় মডিউল", variant: "indigo" }}
        action={{
          label: "নতুন বিষয় যোগ করুন",
          href: "/subjects/create",
          icon: Plus,
        }}
      />

      {/* Stats Cards matching MCQ */}
      <SubjectStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        classesCount={statsData?.classesCount}
        isLoading={isStatsLoading}
      />

      {/* Filters matching MCQ */}
      <SubjectFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedClass={selectedClass}
        onClassChange={(classId) => setSearchParams({ classId, page: 1 })}
        academicClasses={academicClasses}
        selectedYear={selectedYear}
        onYearChange={(academicYearId) =>
          setSearchParams({
            academicYearId,
            classId: "All",
            page: 1,
          })
        }
        academicYears={academicYears}
        selectedGroup={selectedGroup}
        onGroupChange={(group) => setSearchParams({ group, page: 1 })}
        selectedIsActive={selectedIsActive}
        onIsActiveChange={(isActive) => setSearchParams({ isActive, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table / Cards matching MCQ */}
      <SubjectTable
        items={items}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, name) => setDeleteTarget({ id, name })}
        onToggleActive={(id) => toggleStatusMutation.mutate({ id })}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />

      {/* Shared Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="বিষয় ডিলিট করতে চান?"
        itemName={deleteTarget?.name}
        warningText="এই বিষয়টি ডিলিট করলে এর সাথে সংশ্লিষ্ট সমস্ত অধ্যায়, MCQ ও সৃজনশীল প্রশ্ন ক্ষতিগ্রস্ত হতে পারে।"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

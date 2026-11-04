"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  useChaptersList,
  useToggleChapterStatus,
  useDeleteChapter,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useAcademicYearsForSelection,
} from "../services/use-chapter"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@workspace/ui/components/sonner"
import { ChapterPageHeader } from "./chapter-page-header"
import { ChapterFilters } from "./chapter-filters"
import { ChapterTable, type ChapterItem } from "./chapter-table"
import { useChapterSearchParams } from "../hooks/use-chapter-search-params"

export function ChapterManagementView() {
  const router = useRouter()
  const [
    {
      query: searchQuery,
      sort: selectedSort,
      page: currentPage,
      limit,
      subjectId: selectedSubject,
      academicYearId: selectedYear,
      classId: selectedClass,
      isActive: selectedIsActive,
    },
    setSearchParams,
  ] = useChapterSearchParams()

  // Local state for delete dialog
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const deleteMutation = useDeleteChapter()
  const toggleStatusMutation = useToggleChapterStatus()

  // Dropdown data options
  const { data: yearsData } = useAcademicYearsForSelection()
  const academicYears = yearsData?.academicYears ?? []

  const { data: classesData } = useAcademicClassesForSelection(
    selectedYear === "All" ? undefined : selectedYear
  )
  const academicClasses = classesData?.academicClasses ?? []

  const { data: subjectsData } = useSubjectsForSelection(
    selectedYear === "All" ? undefined : selectedYear,
    selectedClass === "All" ? undefined : selectedClass
  )
  const subjects = subjectsData?.academicSubjects ?? []

  // Query chapters list with search & filters
  const { data: chaptersData, isLoading, isError } = useChaptersList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubject === "All" ? undefined : selectedSubject,
    academicYearId: selectedYear === "All" ? undefined : selectedYear,
    classId: selectedClass === "All" ? undefined : selectedClass,
    isActive:
      selectedIsActive === "ACTIVE"
        ? true
        : selectedIsActive === "INACTIVE"
        ? false
        : undefined,
    sort: selectedSort as any,
  })

  const items = (chaptersData?.academicChapters as ChapterItem[]) ?? []
  const totalItems = chaptersData?.totalItems ?? items.length
  const totalPages = chaptersData?.totalPages ?? 1

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success("অধ্যায়টি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "অধ্যায় ডিলিট করা সম্ভব হয়নি")
    }
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header matching Subject module */}
      <ChapterPageHeader />

      {/* Filters */}
      <ChapterFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedClass={selectedClass}
        onClassChange={(classId) =>
          setSearchParams({ classId, subjectId: "All", page: 1 })
        }
        academicClasses={academicClasses}
        selectedSubject={selectedSubject}
        onSubjectChange={(subjectId) => setSearchParams({ subjectId, page: 1 })}
        subjects={subjects}
        selectedYear={selectedYear}
        onYearChange={(academicYearId) =>
          setSearchParams({
            academicYearId,
            classId: "All",
            subjectId: "All",
            page: 1,
          })
        }
        academicYears={academicYears}
        selectedIsActive={selectedIsActive}
        onIsActiveChange={(isActive) => setSearchParams({ isActive, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table / Cards */}
      <ChapterTable
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

      {/* Shared Single Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="অধ্যায় ডিলিট করতে চান?"
        itemName={deleteTarget?.name}
        warningText="এই অধ্যায়টি ডিলিট করলে এর সাথে সংশ্লিষ্ট সমস্ত MCQ, সৃজনশীল প্রশ্ন ও অন্যান্য কনটেন্ট ক্ষতিগ্রস্ত হতে পারে।"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

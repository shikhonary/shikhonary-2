"use client"

import { useState } from "react"
import Link from "next/link"
import {
  useJuktobornoList,
  useJuktobornoStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
  useBoardYearsForSelection,
  useDeleteJuktoborno,
  useBulkDeleteJuktoborno,
} from "../services/use-juktoborno"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { toBengaliDigits } from "@workspace/utils/helpers/bengali"
import { BookOpen, Plus, Upload } from "lucide-react"
import { JuktobornoStatsCards } from "./juktoborno-stats-cards"
import { JuktobornoFilters } from "./juktoborno-filters"
import { JuktobornoTable } from "./juktoborno-table"
import { useJuktobornoSearchParams, type JuktobornoSortOption } from "../hooks/use-juktoborno-search-params"

export function JuktobornoListView() {
  const [
    {
      query: searchQuery,
      classId: selectedAcademicClassId,
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId,
      board: selectedBoard,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = useJuktobornoSearchParams()

  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const handleAcademicClassChange = (classId: string) => {
    setSearchParams({
      classId,
      subjectId: "All",
      chapterId: "All",
      board: "All",
      page: 1,
    })
  }

  // Local state for single & bulk delete (Zero Zustand stores)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; juktoborno: string } | null>(null)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<string[] | null>(null)

  const deleteMutation = useDeleteJuktoborno()
  const bulkDeleteMutation = useBulkDeleteJuktoborno()

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success("যুক্তবর্ণটি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "যুক্তবর্ণ ডিলিট করা সম্ভব হয়নি")
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteTarget) return
    try {
      const res = await bulkDeleteMutation.mutateAsync({ ids: bulkDeleteTarget })
      toast.success(`সফলভাবে ${toBengaliDigits(res.deletedCount)}টি যুক্তবর্ণ মুছে ফেলা হয়েছে।`)
      setBulkDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "যুক্তবর্ণসমূহ ডিলিট করা সম্ভব হয়নি")
    }
  }

  // Parse board / year
  let boardSource: string | undefined = undefined
  let boardYear: number | undefined = undefined
  if (selectedBoard !== "All") {
    const parts = selectedBoard.split("-")
    const possibleYear = Number(parts[parts.length - 1])
    if (!isNaN(possibleYear) && parts.length > 1) {
      boardYear = possibleYear
      boardSource = parts.slice(0, parts.length - 1).join("-")
    } else {
      boardSource = selectedBoard
    }
  }

  // Dependent queries
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId && selectedAcademicClassId !== "All"
      ? { academicClassId: selectedAcademicClassId }
      : undefined
  )

  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId && selectedSubjectId !== "All"
      ? { subjectId: selectedSubjectId }
      : undefined
  )

  const { data: boardYears = [] } = useBoardYearsForSelection({
    subjectId: selectedSubjectId && selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
  })

  // Primary list query
  const {
    data: listData,
    isLoading: isListLoading,
    isError,
  } = useJuktobornoList({
    query: searchQuery || undefined,
    academicClassId: selectedAcademicClassId === "All" ? undefined : selectedAcademicClassId,
    subjectId: selectedSubjectId === "All" ? undefined : selectedSubjectId,
    academicChapterId: selectedChapterId === "All" ? undefined : selectedChapterId,
    source: boardSource,
    year: boardYear,
    sort: selectedSort === "All" ? undefined : selectedSort,
    page: currentPage,
    limit,
  })

  // Summary statistics query
  const { data: statsData, isLoading: isStatsLoading } = useJuktobornoStats({
    academicClassId: selectedAcademicClassId === "All" ? undefined : selectedAcademicClassId,
    subjectId: selectedSubjectId === "All" ? undefined : selectedSubjectId,
    academicChapterId: selectedChapterId === "All" ? undefined : selectedChapterId,
  })

  const items = listData?.items ?? []
  const totalItems = listData?.totalItems ?? 0
  const totalPages = listData?.totalPages ?? 1

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Shared Page Header */}
      <PageHeader
        title="যুক্তবর্ণ প্রশ্ন ব্যাংক (Juktoborno)"
        description="যুক্তবর্ণ দিয়ে অনুশীলনের অধ্যায়ভিত্তিক প্রশ্ন ও যুক্তবর্ণ ভাণ্ডার ব্যবস্থাপনা করুন।"
        badge={{ label: "Juktoborno মডিউল", variant: "indigo" }}
        icon={BookOpen}
        action={{
          label: "নতুন যুক্তবর্ণ যোগ করুন",
          href: "/juktoborno/create",
          icon: Plus,
        }}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2 font-headline cursor-pointer"
        >
          <Link href="/juktoborno/import" prefetch={true}>
            <Upload className="w-4 h-4" />
            <span>JSON ইমপোর্ট</span>
          </Link>
        </Button>
      </PageHeader>

      {/* Summary Counts Cards */}
      <JuktobornoStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        hardCount={statsData?.difficultyCounts?.HARD}
        isLoading={isStatsLoading || isListLoading}
      />

      {/* Filters Form */}
      <JuktobornoFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={handleAcademicClassChange}
        academicClasses={academicClasses}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={(subjectId) => setSearchParams({ subjectId, chapterId: "All", board: "All", page: 1 })}
        subjects={subjects}
        selectedChapterId={selectedChapterId}
        onChapterChange={(chapterId) => setSearchParams({ chapterId, board: "All", page: 1 })}
        chapters={chapters}
        selectedBoard={selectedBoard}
        onBoardChange={(board) => setSearchParams({ board, page: 1 })}
        boardYears={boardYears}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as JuktobornoSortOption, page: 1 })}
        onResetAll={() =>
          setSearchParams({
            query: "",
            classId: "All",
            subjectId: "All",
            chapterId: "All",
            board: "All",
            sort: "All",
            page: 1,
          })
        }
      />

      {/* Questions List Cards & Table */}
      <JuktobornoTable
        items={items as any}
        isLoading={isListLoading}
        isError={isError}
        onDelete={(id, snippet) => setDeleteTarget({ id, juktoborno: snippet })}
        onBulkDelete={(ids) => setBulkDeleteTarget(ids)}
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
        title="যুক্তবর্ণটি ডিলিট করতে চান?"
        itemName={deleteTarget?.juktoborno}
        warningText="এই যুক্তবর্ণটি ডিলিট করলে এটি স্থায়ীভাবে মুছে যাবে।"
        isLoading={deleteMutation.isPending}
      />

      {/* Shared Bulk Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(bulkDeleteTarget && bulkDeleteTarget.length > 0)}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={handleConfirmBulkDelete}
        title="নির্বাচিত যুক্তবর্ণগুলো ডিলিট করতে চান?"
        itemName={bulkDeleteTarget ? `${toBengaliDigits(bulkDeleteTarget.length)}টি যুক্তবর্ণ` : ""}
        warningText="নির্বাচিত যুক্তবর্ণসমূহ স্থায়ীভাবে মুছে ফেলা হবে।"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}

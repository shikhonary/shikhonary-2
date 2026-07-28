"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { RenderMath } from "@workspace/ui/components/render-math"
import "katex/dist/katex.min.css"
import { trpc } from "@/trpc/client"
import { useExamById, useUpdateExamSubjectMcqs, useExamMcqsForAssignment } from "../services/use-exam"
import { useChaptersForSelection } from "../../chapter/services/use-chapter"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs"
import {
  BookOpen,
  HelpCircle,
  Plus,
  ExternalLink,
  Clock,
  School,
  CheckCircle2,
  XCircle,
  BookmarkCheck,
  X,
  RotateCcw,
} from "lucide-react"

const romanNumerals = ["i.", "ii.", "iii.", "iv.", "v.", "vi."]
const optionLetters = ["A", "B", "C", "D", "E", "F"]

interface SubjectMcqListProps {
  examId: string
  examSubjectId: string
  subjectId: string
  subjectName: string
  subjectNameBn?: string
  academicClassId: string
  assignedMcqIds: string[]
  selectedMcqIds: string[]
  setSelectedMcqIds: (ids: string[]) => void
  globalTotalSelectedCount: number
  globalTotalAssignedCount: number
  examTotalMcq: number
}

function SubjectMcqSection({
  examId,
  examSubjectId,
  subjectId,
  subjectName,
  subjectNameBn,
  academicClassId,
  assignedMcqIds,
  selectedMcqIds,
  setSelectedMcqIds,
  globalTotalSelectedCount,
  globalTotalAssignedCount,
  examTotalMcq,
}: SubjectMcqListProps) {
  const updateSubjectMcqsMutation = useUpdateExamSubjectMcqs()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("All")
  const [chapterFilter, setChapterFilter] = useState<string>("All")
  const [boardFilter, setBoardFilter] = useState<string>("All")
  const [page, setPage] = useState(1)
  const [actionType, setActionType] = useState<"assign" | "unassign" | null>(null)

  const { data: chaptersData } = useChaptersForSelection({ subjectId })
  const chapters = chaptersData ?? []

  // Fetch Board + Year combinations for this subject / chapter
  const { data: boardYearsData } = useQuery(
    trpc.questionBank.boardYears.queryOptions({
      subjectId,
      chapterId: chapterFilter === "All" ? undefined : chapterFilter,
    })
  )
  const boardYears = boardYearsData ?? []

  const { data: mcqsData, isLoading } = useExamMcqsForAssignment({
    examId,
    subjectId,
    chapterId: chapterFilter === "All" ? undefined : chapterFilter,
    board: boardFilter === "All" ? undefined : boardFilter,
    query: searchQuery,
    type: typeFilter,
    assignedStatus: "All",
    limit: 50,
    page,
  })

  const mcqs = mcqsData?.items ?? []
  const totalMcqs = mcqsData?.totalItems ?? mcqs.length

  const hasActiveQuery = searchQuery.trim() !== ""
  const hasActiveType = typeFilter !== "All"
  const hasActiveChapter = chapterFilter !== "All"
  const hasActiveBoard = boardFilter !== "All"
  const hasAnyFilter =
    hasActiveQuery ||
    hasActiveType ||
    hasActiveChapter ||
    hasActiveBoard

  const handleResetAll = () => {
    setSearchQuery("")
    setTypeFilter("All")
    setChapterFilter("All")
    setBoardFilter("All")
    setPage(1)
  }

  const unassignedMcqs = mcqs.filter((m: any) => !assignedMcqIds.includes(m.id))
  const allSelected = unassignedMcqs.length > 0 && unassignedMcqs.every((m: any) => selectedMcqIds.includes(m.id))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const otherSubjectsSelectedCount = globalTotalSelectedCount - selectedMcqIds.length
      const remaining = examTotalMcq - globalTotalAssignedCount - otherSubjectsSelectedCount

      if (remaining <= 0) {
        toast.warning(`Cannot select more questions. Already reached the exam limit of ${examTotalMcq}.`)
        return
      }

      const unselectedVisible = mcqs.filter(
        (m: any) => !selectedMcqIds.includes(m.id) && !assignedMcqIds.includes(m.id)
      )
      if (unselectedVisible.length === 0) return

      if (unselectedVisible.length <= remaining) {
        setSelectedMcqIds([...selectedMcqIds, ...unselectedVisible.map((m: any) => m.id)])
      } else {
        const toSelect = unselectedVisible.slice(0, remaining).map((m: any) => m.id)
        setSelectedMcqIds([...selectedMcqIds, ...toSelect])
        toast.info(`Selected ${remaining} question(s) to reach the exam limit of ${examTotalMcq}.`)
      }
    } else {
      setSelectedMcqIds([])
    }
  }

  const handleRandomSelect = () => {
    const otherSubjectsSelectedCount = globalTotalSelectedCount - selectedMcqIds.length
    const remaining = examTotalMcq - globalTotalAssignedCount - otherSubjectsSelectedCount

    if (remaining <= 0) {
      toast.warning(`Cannot select more questions. Already reached the exam limit of ${examTotalMcq}.`)
      return
    }

    const unselectedMcqs = mcqs.filter(
      (m: any) => !selectedMcqIds.includes(m.id) && !assignedMcqIds.includes(m.id)
    )
    if (unselectedMcqs.length === 0) {
      toast.info("All currently visible questions are already selected or assigned")
      return
    }

    const countToSelect = Math.min(10, remaining, unselectedMcqs.length)
    const shuffled = [...unselectedMcqs].sort(() => 0.5 - Math.random())
    const selectedSubset = shuffled.slice(0, countToSelect).map((m: any) => m.id)

    setSelectedMcqIds([...selectedMcqIds, ...selectedSubset])
    
    if (countToSelect === remaining) {
      toast.success(`Randomly selected ${countToSelect} question(s) to reach the exam limit of ${examTotalMcq}.`)
    } else {
      toast.success(`Randomly selected ${countToSelect} question(s)`)
    }
  }

  const handleToggleSelect = (id: string) => {
    const isSelecting = !selectedMcqIds.includes(id)
    if (isSelecting) {
      if (assignedMcqIds.includes(id)) {
        toast.warning("This question is already assigned to the exam.")
        return
      }
      const otherSubjectsSelectedCount = globalTotalSelectedCount - selectedMcqIds.length
      const remaining = examTotalMcq - globalTotalAssignedCount - otherSubjectsSelectedCount
      if (remaining <= 0) {
        toast.warning(`Cannot select more questions. Already reached the exam limit of ${examTotalMcq}.`)
        return
      }
    }

    const nextSelected = isSelecting
      ? [...selectedMcqIds, id]
      : selectedMcqIds.filter((i: string) => i !== id)
    setSelectedMcqIds(nextSelected)
  }

  const handleToggleAssign = async (mcqIdsToToggle: string[], assign: boolean) => {
    let newMcqIds: string[]
    if (assign) {
      newMcqIds = Array.from(new Set([...assignedMcqIds, ...mcqIdsToToggle]))
    } else {
      newMcqIds = assignedMcqIds.filter((id) => !mcqIdsToToggle.includes(id))
    }

    try {
      await updateSubjectMcqsMutation.mutateAsync({
        examId,
        examSubjectId,
        mcqIds: newMcqIds,
      })
      if (assign) {
        toast.success(`Assigned ${mcqIdsToToggle.length} MCQ(s) to exam`)
      } else {
        toast.info(`Removed ${mcqIdsToToggle.length} MCQ(s) from exam`)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update assigned MCQs")
    }
  }

  const handleBulkAssignSelected = async () => {
    if (selectedMcqIds.length === 0) return
    setActionType("assign")
    try {
      await handleToggleAssign(selectedMcqIds, true)
      setSelectedMcqIds([])
    } finally {
      setActionType(null)
    }
  }

  const handleBulkUnassignSelected = async () => {
    if (selectedMcqIds.length === 0) return
    setActionType("unassign")
    try {
      await handleToggleAssign(selectedMcqIds, false)
      setSelectedMcqIds([])
    } finally {
      setActionType(null)
    }
  }

  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs space-y-6">
      {/* Header for Subject Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 p-1.5 text-primary">
              <BookOpen className="h-4 w-4" />
            </span>
            <h3 className="font-headline-md text-lg font-bold text-on-surface">
              {subjectName} {subjectNameBn && <span className="font-bengali text-sm text-outline font-normal">({subjectNameBn})</span>}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-outline font-mono">
            <span>Exam Subject ID: <strong className="text-on-surface-variant font-medium">{examSubjectId}</strong></span>
            <span>•</span>
            <span>Subject ID: <strong className="text-on-surface-variant font-medium">{subjectId}</strong></span>
          </div>
        </div>
      </div>

      {/* Local Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 sm:p-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            filter_list
          </span>
          <Input
            type="text"
            placeholder="Search questions by text..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-outline-variant bg-white py-2 pl-10 pr-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
          />
        </div>


        {/* Chapter Filter */}
        <div className="min-w-[150px] w-full md:w-auto">
          <Select
            value={chapterFilter}
            onValueChange={(val) => {
              setChapterFilter(val)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
              <SelectValue placeholder="All Chapters" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
              <SelectItem value="All">All Chapters</SelectItem>
              {chapters.map((ch: any) => (
                <SelectItem key={ch.id} value={ch.id}>
                  {ch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Board Filter */}
        <div className="min-w-[150px] w-full md:w-auto">
          <Select
            value={boardFilter}
            onValueChange={(val) => {
              setBoardFilter(val)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
              <SelectValue placeholder="All Boards" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-[300px]">
              <SelectItem value="All">All Boards</SelectItem>
              {boardYears.map((item: any) => (
                <SelectItem key={item.rawRef} value={item.rawRef}>
                  🎓 {item.boardName} ২০{item.year} ({item.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="min-w-[150px] w-full md:w-auto">
          <Select
            value={typeFilter}
            onValueChange={(val) => {
              setTypeFilter(val)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="SINGLE">জ্ঞানমূলক (Single MCQ)</SelectItem>
              <SelectItem value="MULTIPLE">বহুপদী (Multiple Response)</SelectItem>
              <SelectItem value="CONTEXTUAL">অভিন্ন তথ্যভিত্তিক (Stimulus MCQ)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applied Filter Badges */}
      {hasAnyFilter && (
        <div className="flex flex-col gap-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:bg-transparent sm:border-0 sm:p-0 sm:px-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-outline text-[11px] sm:text-xs uppercase tracking-wider">
              Applied Filters:
            </span>

            {/* Search Query Badge */}
            {hasActiveQuery && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal max-w-[200px] truncate"
              >
                <span className="truncate">Search: &quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}


            {/* Type Filter Badge */}
            {hasActiveType && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0"
              >
                <span>Type: {typeFilter}</span>
                <button
                  type="button"
                  onClick={() => setTypeFilter("All")}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Chapter Filter Badge */}
            {hasActiveChapter && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0"
              >
                <span>
                  Chapter:{" "}
                  {chapters.find((ch: any) => ch.id === chapterFilter)?.name ||
                    "Selected Chapter"}
                </span>
                <button
                  type="button"
                  onClick={() => setChapterFilter("All")}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Board Filter Badge */}
            {hasActiveBoard && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0"
              >
                <span>
                  Board:{" "}
                  {boardYears.find((item: any) => item.rawRef === boardFilter)
                    ? (() => {
                      const matched = boardYears.find((item: any) => item.rawRef === boardFilter)
                      return matched ? `${matched.boardName} ২০${matched.year}` : boardFilter
                    })()
                    : boardFilter}
                </span>
                <button
                  type="button"
                  onClick={() => setBoardFilter("All")}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>

          {/* Reset All Badge */}
          <div className="flex justify-end border-t border-outline-variant/20 pt-2 sm:border-0 sm:pt-0">
            <button
              type="button"
              onClick={handleResetAll}
              className="cursor-pointer focus:outline-hidden"
              title="Reset all active filters"
            >
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 rounded-md border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-primary hover:bg-primary/20 transition-colors normal-case tracking-normal"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset All</span>
              </Badge>
            </button>
          </div>
        </div>
      )}
      {/* Selection Actions (Below Filters) */}
      <div className="flex flex-wrap items-center gap-3 border-t border-outline-variant/20 pt-4">
        {mcqs.length > 0 && (
          <div
            onClick={() => handleSelectAll(!allSelected)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-white px-3.5 py-2 font-bold text-xs text-on-surface hover:bg-surface-container-high cursor-pointer h-8 select-none"
          >
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              className="rounded-md pointer-events-none"
            />
            <span>{allSelected ? "Deselect All" : "Select All"}</span>
          </div>
        )}

        {mcqs.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRandomSelect}
            className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-white px-3.5 py-2 font-bold text-xs text-on-surface hover:bg-surface-container-high cursor-pointer h-auto"
          >
            <span className="material-symbols-outlined text-[14px] text-outline shrink-0">shuffle</span>
            <span>Random Selection</span>
          </Button>
        )}
      </div>

      {/* Bulk Action Bar (When MCQs are Selected) */}
      {selectedMcqIds.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-primary">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shrink-0">
              {selectedMcqIds.length}
            </span>
            <span className="text-xs font-bold">
              {selectedMcqIds.length} MCQ{selectedMcqIds.length === 1 ? "" : "s"} selected for bulk action
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              size="sm"
              onClick={handleBulkAssignSelected}
              disabled={actionType !== null}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs cursor-pointer h-auto disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
            >
              {actionType === "assign" ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <BookmarkCheck className="h-4 w-4" />
                  <span>Assign {selectedMcqIds.length} MCQs to Exam</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBulkUnassignSelected}
              disabled={actionType !== null}
              className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-white px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container-high cursor-pointer h-auto disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
            >
              {actionType === "unassign" ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  <span>Unassigning...</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-outline" />
                  <span>Unassign Selected</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* MCQs Card List for Subject */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-on-surface-variant text-xs">
          <span className="material-symbols-outlined animate-spin text-2xl text-primary mr-3">
            progress_activity
          </span>
          Loading MCQ question cards for {subjectName}...
        </div>
      ) : mcqs.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low/50">
          <HelpCircle className="h-10 w-10 text-outline mx-auto mb-2" />
          <h4 className="font-bold text-sm text-on-surface">No MCQs Found for {subjectName}</h4>
          <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
            There are currently no MCQs created for this subject ID. Click below to add your first question for this subject.
          </p>
          <div className="mt-4">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-lg text-xs font-bold cursor-pointer"
            >
              <Link href={`/mcqs/create?subjectId=${subjectId}&academicClassId=${academicClassId}`}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Create First MCQ
              </Link>
            </Button>
          </div>
        </div>
      ) : mcqs.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low/50">
          <HelpCircle className="h-10 w-10 text-outline mx-auto mb-2" />
          <h4 className="font-bold text-sm text-on-surface">No Questions Match Filters</h4>
          <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
            Try adjusting your search query, type, or assignment status filters to find the questions you are looking for.
          </p>
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              className="rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {mcqs.map((item: any, idx: number) => {
            const isSelected = selectedMcqIds.includes(item.id)
            const isAssigned = assignedMcqIds.includes(item.id)

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl p-6 transition-all hover:border-primary/40 hover:shadow-md relative group ${isSelected
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : isAssigned
                    ? "border-emerald-300 bg-emerald-50/20"
                    : "border-outline-variant/60"
                  }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  {/* Selection Checkbox & Main Content */}
                  <div className="flex items-start gap-4 flex-1 min-w-0 w-full relative md:static">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleSelect(item.id)}
                      className="absolute top-0.5 left-0 md:relative md:top-0 md:left-0 md:mt-1 rounded-md cursor-pointer shrink-0 border-outline-variant data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    />

                    <div className="flex-1 space-y-4 min-w-0 pl-8 md:pl-0">
                      {/* Badges Header Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Index Badge */}
                        <span className="px-2 py-0.5 bg-surface-container-high font-mono text-[11px] font-bold text-on-surface-variant rounded">
                          #{idx + 1}
                        </span>

                        {/* Subject Badge */}
                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded font-label-sm text-xs font-bold border border-primary/20">
                          {item.subject?.name || subjectName}
                        </span>

                        {/* Chapter Badge */}
                        {item.chapter && (
                          <span className="px-2.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded font-label-sm text-xs font-semibold">
                            {item.chapter.name}
                          </span>
                        )}

                        {/* Type Badge */}
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded font-label-sm text-[11px] font-bold border border-blue-100 uppercase">
                          {item.type}
                        </span>

                        {/* Math Badge */}
                        {item.isMath && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded font-label-sm text-[11px] font-bold border border-amber-200">
                            <span className="material-symbols-outlined text-[14px]">functions</span>
                            <span>Math</span>
                          </span>
                        )}

                        {/* Active Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded font-label-sm text-xs font-bold ${item.isActive
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>

                        {/* Assigned Status Badge */}
                        {isAssigned && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[11px] shadow-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Assigned to Exam</span>
                          </span>
                        )}
                      </div>

                      {/* Context / Comprehension Passage (If Present) */}
                      {item.context && (
                        <div className="rounded-xl border border-secondary/20 bg-secondary-container/10 p-3.5 text-xs text-on-surface-variant leading-relaxed">
                          <div className="font-bold text-secondary flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">article</span>
                            Context / Passage:
                          </div>
                          <p className="whitespace-pre-wrap">
                            <RenderMath text={item.context} isMath={item.isMath} />
                          </p>
                        </div>
                      )}

                      {/* Question Title / Text */}
                      <Link
                        href={`/mcqs/${item.id}`}
                        className="block font-headline-md text-base md:text-lg font-bold text-on-surface leading-snug hover:text-primary transition-colors"
                      >
                        <RenderMath text={item.question} isMath={item.isMath} />
                      </Link>

                      {/* Statements / Sub-questions (If Present) */}
                      {Array.isArray(item.statements) && item.statements.length > 0 && (
                        <div className="space-y-1.5 pl-3 border-l-2 border-primary/40 py-1 bg-surface-container-low/40 rounded-r-lg p-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">
                            Statements:
                          </span>
                          {item.statements.map((stmt: any, sIdx: number) => (
                            <div key={sIdx} className="flex items-start gap-2 text-xs text-on-surface-variant font-medium">
                              <span className="font-mono font-bold text-secondary shrink-0">
                                {romanNumerals[sIdx] || `${sIdx + 1}.`}
                              </span>
                              <span>
                                <RenderMath text={stmt} isMath={item.isMath} />
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Option Choices Grid */}
                      {Array.isArray(item.options) && item.options.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                            Option Choices ({item.options.length}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.options.map((opt: any, optIdx: number) => {
                              const isCorrect = item.answer === opt
                              const letter = optionLetters[optIdx] || String(optIdx + 1)

                              return (
                                <div
                                  key={optIdx}
                                  className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs transition-colors ${isCorrect
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500/20"
                                    : "border-outline-variant/40 bg-surface-container-lowest text-on-surface"
                                    }`}
                                >
                                  <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold ${isCorrect
                                      ? "bg-emerald-600 text-white"
                                      : "bg-surface-container-high text-on-surface-variant"
                                      }`}
                                  >
                                    {letter}
                                  </span>
                                  <span className="flex-1 min-w-0 whitespace-normal break-words">
                                    <RenderMath text={opt} isMath={item.isMath} />
                                  </span>
                                  {isCorrect && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                                      ✓ Correct
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Explanation / Solution Notes (If Present) */}
                      {item.explanation && (
                        <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low/60 p-3 text-xs text-on-surface-variant">
                          <span className="font-bold text-on-surface block mb-0.5">Explanation:</span>
                          <p className="whitespace-pre-wrap">{item.explanation}</p>
                        </div>
                      )}

                      {/* Reference Tags & Actions Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/30 pt-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {Array.isArray(item.reference) && item.reference.length > 0 ? (
                            item.reference.map((ref: any, rIdx: number) => (
                              <span
                                key={rIdx}
                                className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-[11px] font-medium"
                              >
                                🏷️ {ref}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-outline italic">No reference tags</span>
                          )}
                        </div>


                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface AssignMcqViewProps {
  examId: string
}

export function AssignMcqView({ examId }: AssignMcqViewProps) {
  const router = useRouter()
  const { data: exam, isLoading, isError } = useExamById(examId)
  const [selectedMcqIdsMap, setSelectedMcqIdsMap] = useState<Record<string, string[]>>({})

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">
          progress_activity
        </span>
        <span className="ml-3 font-body-md text-sm">Loading exam configuration...</span>
      </div>
    )
  }

  if (isError || !exam) {
    return (
      <div className="mx-auto max-w-2xl p-12 text-center">
        <span className="material-symbols-outlined text-5xl text-error">error</span>
        <h3 className="mt-4 font-headline-md text-xl font-bold text-on-surface">
          Exam Not Found
        </h3>
        <p className="mt-2 font-body-md text-sm text-on-surface-variant">
          The requested exam module record could not be loaded.
        </p>
        <div className="mt-6">
          <Button
            type="button"
            onClick={() => router.push("/exams")}
            className="rounded-lg bg-primary px-6 py-2.5 font-bold text-white hover:bg-primary/90 h-auto cursor-pointer"
          >
            Back to Exams
          </Button>
        </div>
      </div>
    )
  }

  const examSubjects = exam.examSubjects ?? []
  const totalAssignedMcqCount = examSubjects.reduce(
    (acc, es) => acc + (es.mcqIds?.length ?? 0),
    0
  )
  const totalSelectedCount = Object.values(selectedMcqIdsMap).flat().length

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="mb-6 sm:mb-10 flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/exams"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Exams
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link
              href={`/exams/${examId}`}
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              {exam.title}
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Assign MCQs</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Assign MCQs: {exam.title}
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Manage linked subject groups and assign specific MCQ questions to this exam.
          </p>
        </div>
      </div>

      {/* Overview Banner Card (Sticky & Tiny) */}
      <div className="sticky top-16 z-20 rounded-xl border border-outline-variant/30 bg-surface-container-lowest/95 backdrop-blur-md py-2 px-3 sm:py-3 sm:px-6 shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="font-bold text-primary">Target Exam:</span>
            <span className="font-semibold text-on-surface">{exam.title}</span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 text-[10.5px] sm:text-xs font-bold w-full sm:w-auto overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-outline">Needed:</span>
              <span className="text-on-surface">{exam.totalMcq}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-outline">Assigned:</span>
              <span className="text-blue-600">{totalAssignedMcqCount}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-outline">Selected:</span>
                <span className="text-emerald-600">{totalSelectedCount}</span>
              </div>

              {examSubjects.length > 1 && totalSelectedCount > 0 && (
                <div className="hidden sm:inline-flex items-center gap-1.5 pl-2 border-l border-outline-variant/40">
                  {examSubjects.map((es) => {
                    const count = selectedMcqIdsMap[es.subjectId]?.length ?? 0
                    if (count === 0) return null
                    return (
                      <Badge
                        key={es.id}
                        variant="outline"
                        className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 font-bold text-[10px] text-emerald-700 border-0 shadow-none uppercase shrink-0"
                      >
                        {es.subject?.name}: {count}
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-outline">Unselected:</span>
              <span className="text-amber-600">{Math.max(0, exam.totalMcq - totalSelectedCount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Subjects Sections */}
      <div className="space-y-6">
        <Tabs defaultValue={examSubjects[0]?.id} className="w-full space-y-6">
          <TabsList className="flex flex-wrap gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30 w-full sm:w-auto h-auto justify-start">
            {examSubjects.map((es) => {
              const count = selectedMcqIdsMap[es.subjectId]?.length ?? 0
              return (
                <TabsTrigger
                  key={es.id}
                  value={es.id}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold text-on-surface-variant hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xs cursor-pointer transition-all"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{es.subject?.name}</span>
                  {count > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 rounded-md px-1.5 py-0.5 text-[10px] bg-emerald-500 text-white hover:bg-emerald-600 border-0 shadow-none font-bold"
                    >
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {examSubjects.map((es) => (
            <TabsContent key={es.id} value={es.id} className="focus-visible:outline-hidden">
              <SubjectMcqSection
                examId={examId}
                examSubjectId={es.id}
                subjectId={es.subjectId}
                subjectName={es.subject?.name ?? "Subject"}
                subjectNameBn={undefined}
                academicClassId={exam.academicClassId}
                assignedMcqIds={es.mcqIds ?? []}
                selectedMcqIds={selectedMcqIdsMap[es.subjectId] ?? []}
                setSelectedMcqIds={(ids) =>
                  setSelectedMcqIdsMap((prev) => ({
                    ...prev,
                    [es.subjectId]: ids,
                  }))
                }
                globalTotalSelectedCount={totalSelectedCount}
                globalTotalAssignedCount={totalAssignedMcqCount}
                examTotalMcq={exam.totalMcq}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

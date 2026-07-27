"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { RenderMath } from "@workspace/ui/components/render-math"
import "katex/dist/katex.min.css"
import { useExamById, useUpdateExamSubjectMcqs } from "../services/use-exam"
import { useMcqsList } from "../../mcq/services/use-mcq"
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Plus,
  ExternalLink,
  Award,
  Clock,
  School,
  CheckCircle2,
  XCircle,
  CheckSquare,
  Square,
  Sparkles,
  BookmarkCheck,
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
}

function SubjectMcqSection({
  examId,
  examSubjectId,
  subjectId,
  subjectName,
  subjectNameBn,
  academicClassId,
  assignedMcqIds,
}: SubjectMcqListProps) {
  const router = useRouter()
  const updateSubjectMcqsMutation = useUpdateExamSubjectMcqs()
  const { data: mcqsData, isLoading } = useMcqsList({
    subjectId,
    limit: 50,
  })

  const mcqs = mcqsData?.items ?? []
  const totalMcqs = mcqsData?.totalItems ?? mcqs.length

  const [selectedMcqIds, setSelectedMcqIds] = useState<string[]>([])

  const allSelected = mcqs.length > 0 && mcqs.every((m) => selectedMcqIds.includes(m.id))
  const someSelected = mcqs.some((m) => selectedMcqIds.includes(m.id))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMcqIds(mcqs.map((m) => m.id))
    } else {
      setSelectedMcqIds([])
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedMcqIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
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
    await handleToggleAssign(selectedMcqIds, true)
    setSelectedMcqIds([])
  }

  const handleBulkUnassignSelected = async () => {
    if (selectedMcqIds.length === 0) return
    await handleToggleAssign(selectedMcqIds, false)
    setSelectedMcqIds([])
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Select All Checkbox Control */}
          {mcqs.length > 0 && (
            <div
              onClick={() => handleSelectAll(!allSelected)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant bg-white px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer select-none"
            >
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                className="rounded-md pointer-events-none"
              />
              <span>{allSelected ? "Deselect All" : "Select All"}</span>
            </div>
          )}

          <Button
            asChild
            size="sm"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 font-bold text-xs text-on-primary hover:bg-primary/90 shadow-2xs h-auto cursor-pointer"
          >
            <Link href={`/mcqs/create?subjectId=${subjectId}&academicClassId=${academicClassId}`}>
              <Plus className="h-3.5 w-3.5" />
              <span>Add MCQ for Subject</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant bg-white px-3.5 py-2 font-bold text-xs text-on-surface hover:bg-surface-container-high h-auto cursor-pointer"
          >
            <Link href={`/mcqs?subjectId=${subjectId}`}>
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Question Bank ({totalMcqs})</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Bulk Action Bar (When MCQs are Selected) */}
      {selectedMcqIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-primary">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {selectedMcqIds.length}
            </span>
            <span className="text-xs font-bold">
              {selectedMcqIds.length} MCQ{selectedMcqIds.length === 1 ? "" : "s"} selected for bulk action
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleBulkAssignSelected}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs cursor-pointer h-auto"
            >
              <BookmarkCheck className="h-4 w-4" />
              <span>Assign {selectedMcqIds.length} MCQs to Exam</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBulkUnassignSelected}
              className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-white px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container-high cursor-pointer h-auto"
            >
              <XCircle className="h-4 w-4 text-outline" />
              <span>Unassign Selected</span>
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
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {mcqs.map((item, idx) => {
            const isSelected = selectedMcqIds.includes(item.id)
            const isAssigned = assignedMcqIds.includes(item.id)

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl p-6 transition-all hover:border-primary/40 hover:shadow-md relative group ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : isAssigned
                    ? "border-emerald-300 bg-emerald-50/20"
                    : "border-outline-variant/60"
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  {/* Selection Checkbox & Main Content */}
                  <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleSelect(item.id)}
                      className="mt-1 rounded-md cursor-pointer shrink-0 border-outline-variant data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    />

                    <div className="flex-1 space-y-4 min-w-0">
                      {/* Badges Header Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Index Badge */}
                        <span className="px-2 py-0.5 bg-surface-container-high font-mono text-[11px] font-bold text-on-surface-variant rounded">
                          #{idx + 1}
                        </span>

                        {/* Subject Badge */}
                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded font-label-sm text-xs font-bold border border-primary/20">
                          {item.subject?.nameBn || item.subject?.name || subjectName}
                        </span>

                        {/* Chapter Badge */}
                        {item.chapter && (
                          <span className="px-2.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded font-label-sm text-xs font-semibold">
                            {item.chapter.nameBn || item.chapter.name}
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
                          className={`px-2.5 py-0.5 rounded font-label-sm text-xs font-bold ${
                            item.isActive
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
                          {item.statements.map((stmt, sIdx) => (
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
                            {item.options.map((opt, optIdx) => {
                              const isCorrect = item.answer === opt
                              const letter = optionLetters[optIdx] || String(optIdx + 1)

                              return (
                                <div
                                  key={optIdx}
                                  className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs transition-colors ${
                                    isCorrect
                                      ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500/20"
                                      : "border-outline-variant/40 bg-surface-container-lowest text-on-surface"
                                  }`}
                                >
                                  <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                                      isCorrect
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
                            item.reference.map((ref, rIdx) => (
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

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant={isAssigned ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleToggleAssign([item.id], !isAssigned)}
                            className={`rounded-lg text-xs font-bold h-auto py-1.5 px-3 cursor-pointer ${
                              isAssigned
                                ? "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                                : "bg-primary text-white hover:bg-primary/90"
                            }`}
                          >
                            {isAssigned ? "✓ Assigned" : "+ Assign to Exam"}
                          </Button>

                          <Button
                            asChild
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7 text-outline hover:text-primary cursor-pointer"
                            title="Edit MCQ"
                          >
                            <Link href={`/mcqs/${item.id}/edit`}>
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </Link>
                          </Button>
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

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => router.push(`/exams/${examId}`)}
            className="rounded-xl border border-outline-variant/60 bg-white text-on-surface hover:bg-surface-container-high"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-outline">
              <Link href="/exams" className="hover:text-primary transition-colors">Exams</Link>
              <span>/</span>
              <Link href={`/exams/${examId}`} className="hover:text-primary transition-colors">{exam.title}</Link>
              <span>/</span>
              <span className="font-semibold text-on-surface">Assign MCQs</span>
            </div>
            <h1 className="font-headline-md text-2xl font-extrabold text-on-surface">
              Assign MCQs: {exam.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Overview Banner Card */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <School className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-outline">Academic Class</p>
              <p className="text-sm font-bold text-on-surface">{exam.academicClass?.name ?? "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-secondary-container/20 p-3 text-secondary">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-outline">MCQs Target</p>
              <p className="text-sm font-bold text-on-surface">{exam.totalMcq} Questions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-outline">Assigned Questions</p>
              <p className="text-sm font-bold text-emerald-700">{totalAssignedMcqCount} / {exam.totalMcq}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-outline">Duration</p>
              <p className="text-sm font-bold text-on-surface">{exam.duration} Minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Subjects Sections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-xl font-bold text-on-surface">
            Subject Questions ({examSubjects.length} Linked Subject{examSubjects.length === 1 ? "" : "s"})
          </h2>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-bold cursor-pointer"
          >
            <Link href={`/exams/${examId}/edit`}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Manage Linked Subjects
            </Link>
          </Button>
        </div>

        {examSubjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/60 bg-surface-container-lowest p-12 text-center">
            <BookOpen className="h-10 w-10 text-outline mx-auto mb-3" />
            <h3 className="font-headline-md text-base font-bold text-on-surface">No Subjects Linked to Exam</h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
              Please link at least one subject to this exam in order to manage and assign questions.
            </p>
            <div className="mt-4">
              <Button
                asChild
                className="rounded-xl bg-primary text-xs font-bold text-white cursor-pointer"
              >
                <Link href={`/exams/${examId}/edit`}>
                  Edit Exam & Add Subjects
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          examSubjects.map((es) => (
            <SubjectMcqSection
              key={es.id}
              examId={examId}
              examSubjectId={es.id}
              subjectId={es.subjectId}
              subjectName={es.subject?.name ?? "Subject"}
              subjectNameBn={es.subject?.nameBn}
              academicClassId={exam.academicClassId}
              assignedMcqIds={es.mcqIds ?? []}
            />
          ))
        )}
      </div>
    </div>
  )
}

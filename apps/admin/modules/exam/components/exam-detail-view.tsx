"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { RenderMath } from "@workspace/ui/components/render-math"
import "katex/dist/katex.min.css"
import {
  useExamById,
  useToggleExamStatus,
} from "../services/use-exam"
import { useMcqsList } from "../../mcq/services/use-mcq"
import { useDeleteExamModalStore } from "../store/use-delete-exam-modal-store"
import {
  ArrowLeft,
  ClipboardList,
  Pen,
  Trash,
  Clock,
  Award,
  HelpCircle,
  Calendar,
  BookOpen,
  GraduationCap,
  CheckCircle,
  Archive,
  Shuffle,
  Dices,
  AlertTriangle,
  ExternalLink,
  Plus,
  CheckCircle2,
} from "lucide-react"

const romanNumerals = ["i.", "ii.", "iii.", "iv.", "v.", "vi."]
const optionLetters = ["A", "B", "C", "D", "E", "F"]

interface SubjectMcqSectionProps {
  subjectId: string
  subjectName: string
  subjectNameBn?: string
  assignedMcqIds?: string[]
}

function SubjectMcqSection({
  subjectId,
  subjectName,
  subjectNameBn,
  assignedMcqIds = [],
}: SubjectMcqSectionProps) {
  const { data: mcqsData, isLoading } = useMcqsList({
    subjectId,
    limit: 50,
  })

  const allMcqs = mcqsData?.items ?? []
  const mcqs = assignedMcqIds.length > 0
    ? allMcqs.filter((m) => assignedMcqIds.includes(m.id))
    : allMcqs
  const totalMcqs = assignedMcqIds.length > 0 ? mcqs.length : (mcqsData?.totalItems ?? mcqs.length)

  return (
    <div className="space-y-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-outline-variant/30 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-base text-on-surface">
            {subjectName} {subjectNameBn && <span className="font-bengali text-xs text-outline font-normal">({subjectNameBn})</span>}
          </h3>
          <Badge variant="outline" className="text-[10px] font-mono">
            {totalMcqs} MCQs
          </Badge>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-lg text-xs font-bold bg-white cursor-pointer h-auto py-1 px-3"
        >
          <Link href={`/mcqs?subjectId=${subjectId}`}>
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Manage Question Bank
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-6 text-xs text-outline">
          <span className="material-symbols-outlined animate-spin text-lg text-primary mr-2">
            progress_activity
          </span>
          Loading MCQs for {subjectName}...
        </div>
      ) : mcqs.length === 0 ? (
        <p className="text-xs text-outline italic py-4 text-center">
          No MCQs found for {subjectName}.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {mcqs.map((item, idx) => (
            <div
              key={item.id}
              className="rounded-xl border border-outline-variant/40 bg-white p-4 space-y-3 shadow-2xs"
            >
              {/* Question Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-surface-container-high font-mono text-[11px] font-bold text-on-surface-variant rounded">
                    #{idx + 1}
                  </span>
                  {item.chapter && (
                    <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-[11px] font-semibold">
                      {item.chapter.name}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase border border-blue-100">
                    {item.type}
                  </span>
                </div>

                <Link
                  href={`/mcqs/${item.id}`}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>View Full Details</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              {/* Question Text */}
              <p className="font-bold text-sm md:text-base text-on-surface leading-snug">
                <RenderMath text={item.question} isMath={item.isMath} />
              </p>

              {/* Context if present */}
              {item.context && (
                <div className="rounded-lg border border-secondary/20 bg-secondary-container/10 p-3 text-xs text-on-surface-variant">
                  <span className="font-bold text-secondary text-[11px] uppercase tracking-wider block mb-1">
                    Passage / Context:
                  </span>
                  <p className="whitespace-pre-wrap">
                    <RenderMath text={item.context} isMath={item.isMath} />
                  </p>
                </div>
              )}

              {/* Statements if present */}
              {Array.isArray(item.statements) && item.statements.length > 0 && (
                <div className="space-y-1 pl-3 border-l-2 border-primary/40 py-1 bg-surface-container-low/40 rounded-r-lg p-2 text-xs">
                  {item.statements.map((stmt, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2 text-on-surface-variant font-medium">
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

              {/* Options Grid */}
              {Array.isArray(item.options) && item.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {item.options.map((opt, optIdx) => {
                    const isCorrect = item.answer === opt
                    const letter = optionLetters[optIdx] || String(optIdx + 1)

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2 rounded-lg border p-2 text-xs ${isCorrect
                            ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold"
                            : "border-outline-variant/40 bg-surface-container-lowest text-on-surface"
                          }`}
                      >
                        <span
                          className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ${isCorrect
                              ? "bg-emerald-600 text-white"
                              : "bg-surface-container-high text-on-surface-variant"
                            }`}
                        >
                          {letter}
                        </span>
                        <span className="flex-1 min-w-0">
                          <RenderMath text={opt} isMath={item.isMath} />
                        </span>
                        {isCorrect && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface ExamDetailViewProps {
  examId: string
}

export function ExamDetailView({ examId }: ExamDetailViewProps) {
  const router = useRouter()
  const { data: exam, isLoading, isError } = useExamById(examId)
  const openDeleteModal = useDeleteExamModalStore((state) => state.openModal)
  const toggleStatusMutation = useToggleExamStatus()

  const handleToggleStatus = async (newStatus: string) => {
    try {
      await toggleStatusMutation.mutateAsync({ id: examId, status: newStatus })
      toast.success(`Exam status updated to ${newStatus}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to update exam status")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
        <span className="ml-3 font-body-md text-base">Loading exam details...</span>
      </div>
    )
  }

  if (isError || !exam) {
    return (
      <div className="p-12 text-center text-error">
        <span className="material-symbols-outlined text-5xl">error</span>
        <h3 className="mt-4 font-headline-md text-lg font-bold">Exam Not Found</h3>
        <Button
          variant="outline"
          onClick={() => router.push("/exams")}
          className="mt-4 rounded-xl"
        >
          Return to Exams Catalog
        </Button>
      </div>
    )
  }

  const startDateStr = new Date(exam.startDate).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
  const endDateStr = new Date(exam.endDate).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Navigation & Actions Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => router.push("/exams")}
            className="rounded-xl border border-outline-variant/60 bg-white text-on-surface hover:bg-surface-container-high"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-outline">
              <ClipboardList className="h-3.5 w-3.5 text-primary" />
              <span>Exams</span>
              <span>/</span>
              <span className="font-semibold text-on-surface">Overview</span>
            </div>
            <h1 className="font-headline-md text-2xl font-extrabold text-on-surface">
              {exam.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/exams/${examId}/edit`)}
            className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-white px-4 py-2 font-bold text-xs text-on-surface hover:bg-surface-container-high cursor-pointer h-auto"
          >
            <Pen className="h-3.5 w-3.5" />
            <span>Edit Exam</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push(`/exams/${examId}/mcq`)}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-4 py-2 font-bold text-xs text-primary hover:bg-primary/10 cursor-pointer h-auto"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Assign MCQs</span>
          </Button>

          {exam.status !== "Published" && (
            <Button
              onClick={() => handleToggleStatus("Published")}
              disabled={toggleStatusMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-xs text-white hover:bg-emerald-700 shadow-xs cursor-pointer h-auto"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Publish</span>
            </Button>
          )}

          {exam.status !== "Archived" && (
            <Button
              variant="outline"
              onClick={() => handleToggleStatus("Archived")}
              disabled={toggleStatusMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer h-auto"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Archive</span>
            </Button>
          )}

          <Button
            variant="destructive"
            onClick={() => openDeleteModal(exam.id, exam.title)}
            className="inline-flex items-center gap-2 rounded-xl bg-error px-4 py-2 font-bold text-xs text-on-error hover:bg-on-error-container shadow-xs cursor-pointer h-auto"
          >
            <Trash className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Main Stats Summary Banner */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Status Card */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-xs">
          <p className="font-label-sm text-xs font-semibold uppercase tracking-wider text-outline">
            Exam Status
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${exam.status === "Published"
                  ? "bg-emerald-500 animate-pulse"
                  : exam.status === "Pending"
                    ? "bg-amber-500"
                    : "bg-slate-400"
                }`}
            />
            <span className="font-headline-md text-xl font-extrabold text-on-surface">
              {exam.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">
            Type: {exam.type} {(exam as any).isOffline ? "• Offline Exam" : "• Online Exam"}
          </p>
        </div>

        {/* Target Academic Class */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-xs">
          <p className="font-label-sm text-xs font-semibold uppercase tracking-wider text-outline">
            Target Academic Class
          </p>
          <div className="mt-2 flex items-center gap-2 text-primary">
            <GraduationCap className="h-5 w-5" />
            <span className="font-headline-md text-xl font-extrabold text-on-surface">
              {exam.academicClass?.name ?? "Unassigned"}
            </span>
          </div>
        </div>

        {/* Total Marks */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-xs">
          <p className="font-label-sm text-xs font-semibold uppercase tracking-wider text-outline">
            Total Marks & MCQs
          </p>
          <div className="mt-2 flex items-center gap-2 text-primary">
            <Award className="h-5 w-5" />
            <span className="font-headline-md text-2xl font-extrabold text-on-surface">
              {exam.total} pts
            </span>
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">{exam.totalMcq} MCQs total</p>
        </div>

        {/* Duration */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-xs">
          <p className="font-label-sm text-xs font-semibold uppercase tracking-wider text-outline">
            Time Limit
          </p>
          <div className="mt-2 flex items-center gap-2 text-amber-600">
            <Clock className="h-5 w-5" />
            <span className="font-headline-md text-2xl font-extrabold text-on-surface">
              {exam.duration} mins
            </span>
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">Per student attempt</p>
        </div>
      </div>

      {/* Schedule & Rules Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Schedule Info */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-3">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Availability Window
            </h2>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center p-3 rounded-xl bg-surface-container-low">
              <span className="font-semibold text-on-surface-variant">Start Time:</span>
              <span className="font-bold text-on-surface">{startDateStr}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-surface-container-low">
              <span className="font-semibold text-on-surface-variant">End Time:</span>
              <span className="font-bold text-on-surface">{endDateStr}</span>
            </div>
          </div>
        </div>

        {/* Rules & Configuration */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-3">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Rules & Features
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
              <div className="flex items-center gap-2">
                <Shuffle className="h-4 w-4 text-primary" />
                <span className="font-medium text-on-surface">Shuffle Questions</span>
              </div>
              <Badge variant={exam.hasSuffle ? "default" : "outline"}>
                {exam.hasSuffle ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
              <div className="flex items-center gap-2">
                <Dices className="h-4 w-4 text-secondary" />
                <span className="font-medium text-on-surface">Randomized MCQ Order</span>
              </div>
              <Badge variant={exam.hasRandom ? "default" : "outline"}>
                {exam.hasRandom ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-on-surface">Negative Marking</span>
              </div>
              {exam.hasNegativeMark ? (
                <Badge className="bg-error/10 text-error border-0 font-bold">
                  -{exam.negativeMark} Marks / Incorrect
                </Badge>
              ) : (
                <Badge variant="outline">Disabled</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Associated Exam Groups Card */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-primary">layers</span>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Associated Exam Groups & Model Tests
            </h2>
          </div>
          <span className="text-xs font-semibold text-outline">
            {exam.examGroupItems?.length ?? 0} group(s)
          </span>
        </div>

        {!exam.examGroupItems || exam.examGroupItems.length === 0 ? (
          <div className="p-4 rounded-xl bg-surface-container-low text-center text-xs text-outline">
            This exam is standalone and not currently bundled into any Exam Group.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {exam.examGroupItems.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/40 bg-white"
              >
                <div>
                  <Link
                    href={`/exam-groups/${item.examGroup.id}`}
                    className="font-bold text-sm text-on-surface hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <span>{item.examGroup.title}</span>
                    <ExternalLink className="h-3 w-3 text-outline" />
                  </Link>
                  <p className="text-xs text-outline mt-0.5">
                    Mode: {item.examGroup.calculationType} | Weight: {item.weightage}%
                  </p>
                </div>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                  {item.examGroup.type.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Linked Subjects Summary */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Linked Academic Subjects
            </h2>
          </div>
          <span className="text-xs font-semibold text-outline">
            {exam.examSubjects?.length ?? 0} subject(s)
          </span>
        </div>

        {exam.examSubjects && exam.examSubjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exam.examSubjects.map((es) => (
              <div
                key={es.id}
                className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/40 bg-surface-container-low"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-on-surface">
                    {es.subject?.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-outline italic">No subjects currently linked to this exam.</p>
        )}
      </div>

      {/* Assigned Exam MCQs Section */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-outline-variant/30 pb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-headline-md text-lg font-bold text-on-surface">
                Assigned Exam MCQs
              </h2>
              <p className="text-xs text-on-surface-variant">
                Questions assigned to this exam module by subject ID
              </p>
            </div>
          </div>

          <Button
            asChild
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer h-auto"
          >
            <Link href={`/exams/${examId}/mcq`}>
              <Plus className="h-3.5 w-3.5" />
              <span>Assign & Manage Questions</span>
            </Link>
          </Button>
        </div>

        {exam.examSubjects && exam.examSubjects.length > 0 ? (
          <div className="space-y-6">
            {exam.examSubjects.map((es) => (
              <SubjectMcqSection
                key={es.id}
                subjectId={es.subjectId}
                subjectName={es.subject?.name ?? "Subject"}
                assignedMcqIds={es.mcqIds ?? []}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low/50">
            <HelpCircle className="h-8 w-8 text-outline mx-auto mb-2" />
            <h4 className="font-bold text-sm text-on-surface">No Subjects or Questions Linked</h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
              Please link subjects and assign MCQs to this exam to view questions here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

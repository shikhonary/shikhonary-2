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
  SlidersHorizontal,
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
    limit: 100,
  })

  const allMcqs = mcqsData?.items ?? []
  const mcqs = allMcqs.filter((m) => assignedMcqIds.includes(m.id))
  const totalMcqs = mcqs.length

  return (
    <div className="space-y-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-2">
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
          {mcqs.map((item: any, idx: number) => (
            <div
              key={item.id}
              className="bg-white border border-outline-variant/60 rounded-2xl p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-md relative group"
            >
              <div className="space-y-2.5 sm:space-y-4">
                {/* Badges Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-2.5">
                  <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                    {/* Index Badge */}
                    <span className="px-2 py-0.5 bg-surface-container-high font-mono text-[11px] font-bold text-on-surface-variant rounded">
                      #{idx + 1}
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
                  </div>

                  <Link
                    href={`/mcqs/${item.id}`}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>View Full Details</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                {/* Context / Passage if present */}
                {item.context && (
                  <div className="rounded-xl border border-secondary/20 bg-secondary-container/10 p-2.5 sm:p-3.5 text-xs text-on-surface-variant leading-relaxed">
                    <div className="font-bold text-secondary flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                      <span className="material-symbols-outlined text-sm">article</span>
                      Context / Passage:
                    </div>
                    <p className="whitespace-pre-wrap">
                      <RenderMath text={item.context} isMath={item.isMath} />
                    </p>
                  </div>
                )}

                {/* Question Title */}
                <div className="font-headline-md text-sm sm:text-base md:text-lg font-bold text-on-surface leading-snug">
                  <RenderMath text={item.question} isMath={item.isMath} />
                </div>

                {/* Statements / Sub-questions if present */}
                {Array.isArray(item.statements) && item.statements.length > 0 && (
                  <div className="space-y-1.5 pl-3 border-l-2 border-primary/40 py-1 bg-surface-container-low/40 rounded-r-lg p-1.5 sm:p-2.5 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">
                      Statements:
                    </span>
                    {item.statements.map((stmt: any, sIdx: number) => (
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

                {/* Option Choices Grid */}
                {Array.isArray(item.options) && item.options.length > 0 && (
                  <div className="space-y-1.5 pt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                      Option Choices ({item.options.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                      {item.options.map((opt: any, optIdx: number) => {
                        const isCorrect = item.answer === opt
                        const letter = optionLetters[optIdx] || String(optIdx + 1)

                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2.5 rounded-lg border p-2 sm:p-2.5 text-xs transition-colors ${isCorrect
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

                {/* Explanation / Solution Notes if present */}
                {item.explanation && (
                  <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low/60 p-2.5 sm:p-3 text-xs text-on-surface-variant">
                    <span className="font-bold text-on-surface block mb-0.5">Explanation:</span>
                    <p className="whitespace-pre-wrap">{item.explanation}</p>
                  </div>
                )}

                {/* Reference Tags & Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/30 pt-2 sm:pt-3">
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
  const [activeTab, setActiveTab] = useState<"questions" | "config">("questions")

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

      {/* Main Metadata Details Header Card */}
      <div className="rounded-xl border border-outline-variant/30 bg-surface p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <span className="text-xs font-semibold text-outline tracking-wider uppercase">Class</span>
            <p className="mt-1 font-bold text-on-surface text-sm sm:text-base">
              {exam.academicClass?.name ?? "Unassigned"}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-outline tracking-wider uppercase">Evaluation</span>
            <p className="mt-1 font-bold text-on-surface text-sm sm:text-base">
              {exam.total} Marks ({exam.totalMcq} MCQs)
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-outline tracking-wider uppercase">Time Limit</span>
            <p className="mt-1 font-bold text-on-surface text-sm sm:text-base">
              {exam.duration} Mins
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-outline tracking-wider uppercase">Type & Status</span>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="bg-secondary-container/20 text-secondary border-secondary-container/30 text-[10px] font-bold py-0.5 shadow-none uppercase">
                {exam.type} {(exam as any).isOffline ? "(Offline)" : "(Online)"}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] font-bold py-0.5 shadow-none ${exam.status === "Published"
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                  : exam.status === "Pending"
                    ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                    : "bg-slate-500/10 text-slate-700 border-slate-500/20"
                  }`}
              >
                {exam.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex flex-wrap bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30 w-full sm:w-auto h-auto justify-start self-start gap-1.5">
        <Button
          variant={activeTab === "questions" ? "default" : "ghost"}
          onClick={() => setActiveTab("questions")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold cursor-pointer transition-all grow sm:grow-0 w-auto ${activeTab === "questions"
            ? "bg-primary text-white hover:bg-primary shadow-xs"
            : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
            }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Questions</span>
        </Button>
        <Button
          variant={activeTab === "config" ? "default" : "ghost"}
          onClick={() => setActiveTab("config")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold cursor-pointer transition-all grow sm:grow-0 w-auto ${activeTab === "config"
            ? "bg-primary text-white hover:bg-primary shadow-xs"
            : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
            }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Configuration</span>
        </Button>
      </div>

      {/* Tab Panels */}
      {activeTab === "questions" ? (
        /* Assigned Exam MCQs Section */
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
      ) : (
        /* Configuration Panel */
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
              <SlidersHorizontal className="h-5 w-5 text-primary" />
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
      )}
    </div>
  )
}

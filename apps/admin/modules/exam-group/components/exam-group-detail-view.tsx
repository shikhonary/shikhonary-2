"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { toast } from "@workspace/ui/components/sonner"
import {
  useExamGroupById,
  useAddExamGroupItem,
  useRemoveExamGroupItem,
  useCalculateExamGroupResults,
  useExamGroupResults,
  useTogglePublishExamGroup,
} from "../services/use-exam-group"
import { useExamsList } from "../../exam/services/use-exam"
import {
  ArrowLeft,
  Calculator,
  Edit3,
  Layers,
  Plus,
  Trash2,
  Award,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  User,
} from "lucide-react"

interface ExamGroupDetailViewProps {
  id: string
}

export function ExamGroupDetailView({ id }: ExamGroupDetailViewProps) {
  const { data: groupData, isLoading, isError } = useExamGroupById(id)
  const addExamItemMutation = useAddExamGroupItem()
  const removeExamItemMutation = useRemoveExamGroupItem()
  const calculateResultsMutation = useCalculateExamGroupResults()
  const togglePublishMutation = useTogglePublishExamGroup()

  const { data: availableExamsData } = useExamsList({ limit: 100 })
  const availableExams = availableExamsData?.items ?? []

  // Active Tab state
  const [activeTab, setActiveTab] = useState<"items" | "results">("items")

  // Results search & filter state
  const [resultQuery, setResultQuery] = useState("")
  const [resultPage, setResultPage] = useState(1)

  const { data: resultsData, isLoading: isResultsLoading } = useExamGroupResults(
    {
      examGroupId: id,
      query: resultQuery || undefined,
      page: resultPage,
      limit: 20,
    },
    activeTab === "results"
  )

  const [selectedExamToAdd, setSelectedExamToAdd] = useState<string>("none")

  const handleAddExam = async () => {
    if (!selectedExamToAdd || selectedExamToAdd === "none") return

    try {
      await addExamItemMutation.mutateAsync({
        examGroupId: id,
        examId: selectedExamToAdd,
        weightage: 100,
        isRequired: true,
      })
      toast.success("Exam added to group successfully")
      setSelectedExamToAdd("none")
    } catch (err: any) {
      toast.error(err.message || "Failed to add exam to group")
    }
  }

  const handleRemoveExam = async (examId: string, title?: string) => {
    try {
      await removeExamItemMutation.mutateAsync({
        examGroupId: id,
        examId,
      })
      toast.success(`Removed exam "${title || examId}" from group`)
    } catch (err: any) {
      toast.error(err.message || "Failed to remove exam from group")
    }
  }

  const handleCalculateResults = async () => {
    try {
      toast.loading("Calculating student results & merit positions...", { id: "calc-toast" })
      const res = await calculateResultsMutation.mutateAsync({ examGroupId: id })
      toast.success(`Calculated results for ${res.count} students!`, { id: "calc-toast" })
      setActiveTab("results")
    } catch (err: any) {
      toast.error(err.message || "Failed to calculate group results", { id: "calc-toast" })
    }
  }

  const handleTogglePublish = async () => {
    if (!groupData) return
    try {
      await togglePublishMutation.mutateAsync({
        id: groupData.id,
        isPublished: !groupData.isPublished,
      })
      toast.success(`Group ${!groupData.isPublished ? "published" : "moved to draft"}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle publish status")
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 py-6">
        <Skeleton className="h-10 w-48 bg-surface-container-high rounded-lg" />
        <Skeleton className="h-40 w-full bg-surface-container-high rounded-xl" />
        <Skeleton className="h-64 w-full bg-surface-container-high rounded-xl" />
      </div>
    )
  }

  if (isError || !groupData) {
    return (
      <div className="rounded-xl border border-error/20 bg-error-container/10 p-8 text-center">
        <p className="font-semibold text-error text-base">Exam Group not found.</p>
        <div className="mt-4">
          <Link href="/exam-groups">
            <Button variant="outline">Back to Exam Groups</Button>
          </Link>
        </div>
      </div>
    )
  }

  const items = groupData.items ?? []
  const existingExamIds = new Set(items.map((it) => it.examId))
  const examsToSelect = availableExams.filter((ex) => !existingExamIds.has(ex.id))

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Back Button & Top Action Bar */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <Link href="/exam-groups">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-extrabold text-2xl text-on-surface tracking-tight">
                {groupData.title}
              </h1>
              {groupData.isPublished ? (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold text-xs bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Published
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 font-semibold text-xs bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <XCircle className="h-3.5 w-3.5" /> Draft
                </span>
              )}
            </div>
            {groupData.code && (
              <p className="font-mono text-xs text-outline mt-0.5">Code: {groupData.code}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Calculate Results Button */}
          <Button
            onClick={handleCalculateResults}
            disabled={calculateResultsMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 font-semibold shadow-xs cursor-pointer"
          >
            <Calculator className="h-4 w-4" />
            <span>Calculate Results</span>
          </Button>

          {/* Toggle Publish */}
          <Button
            variant="outline"
            onClick={handleTogglePublish}
            disabled={togglePublishMutation.isPending}
            className="cursor-pointer text-xs"
          >
            {groupData.isPublished ? "Unpublish (Draft)" : "Publish Group"}
          </Button>

          {/* Edit Button */}
          <Link href={`/exam-groups/${id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2 cursor-pointer text-xs">
              <Edit3 className="h-4 w-4" />
              <span>Edit Metadata</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Group Details Header Card */}
      <div className="rounded-xl border border-outline-variant/30 bg-surface p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">Class</span>
            <p className="mt-1 font-bold text-on-surface">
              {groupData.academicClass?.name || "Global / All Classes"}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">Type</span>
            <div className="mt-1">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                {groupData.type.replace("_", " ")}
              </Badge>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">Calculation Mode</span>
            <div className="mt-1">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {groupData.calculationType === "BEST_OF_N"
                  ? `BEST OF ${groupData.bestOfNCount || "N"}`
                  : groupData.calculationType.replace("_", " ")}
              </Badge>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">Total / Pass Marks</span>
            <p className="mt-1 font-bold text-on-surface">
              {groupData.totalMarks ? `${groupData.totalMarks} Total` : "Dynamic Sum"}
              {groupData.passMarks && ` (${groupData.passMarks} Pass)`}
            </p>
          </div>
        </div>

        {groupData.description && (
          <div className="border-t border-outline-variant/20 pt-4">
            <p className="text-xs text-outline font-medium">Description:</p>
            <p className="text-sm text-on-surface mt-0.5">{groupData.description}</p>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-outline-variant/30 gap-6">
        <button
          onClick={() => setActiveTab("items")}
          className={`pb-3 font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "items"
              ? "border-b-2 border-primary text-primary"
              : "text-outline hover:text-on-surface"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Included Exams ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("results")}
          className={`pb-3 font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "results"
              ? "border-b-2 border-primary text-primary"
              : "text-outline hover:text-on-surface"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Calculated Leaderboard ({groupData._count?.groupResults ?? 0})</span>
        </button>
      </div>

      {/* Tab 1: Included Exams */}
      {activeTab === "items" && (
        <div className="space-y-4">
          {/* Add Exam Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
            <div>
              <h3 className="font-bold text-base text-on-surface">Add Exam to this Group</h3>
              <p className="text-xs text-outline">Select an existing exam to attach into this evaluation group.</p>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedExamToAdd} onValueChange={(val) => setSelectedExamToAdd(val ?? "none")}>
                <SelectTrigger className="w-[260px] bg-white text-xs cursor-pointer">
                  <SelectValue placeholder="Select Exam to add..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="none">Select Exam...</SelectItem>
                  {examsToSelect.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.title} ({ex.total} Marks)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleAddExam}
                disabled={selectedExamToAdd === "none" || addExamItemMutation.isPending}
                className="bg-primary text-on-primary hover:bg-primary/90 text-xs font-semibold cursor-pointer flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Exam</span>
              </Button>
            </div>
          </div>

          {/* Items List */}
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant p-12 text-center text-outline">
              <FileText className="mx-auto h-10 w-10 text-outline mb-2" />
              <p className="font-semibold text-sm">No exams attached to this group yet.</p>
              <p className="text-xs mt-1">Use the dropdown above to add individual exams.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-outline-variant/30 bg-surface-container-low font-label-md text-xs uppercase tracking-wider text-outline">
                  <tr>
                    <th className="px-6 py-3.5">#</th>
                    <th className="px-6 py-3.5">Exam Title</th>
                    <th className="px-4 py-3.5">Total Marks</th>
                    <th className="px-4 py-3.5 text-center">Weightage</th>
                    <th className="px-4 py-3.5 text-center">Required</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-xs text-outline">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/exams/${item.exam.id}`}
                          className="font-bold text-on-surface hover:text-primary transition-colors"
                        >
                          {item.exam.title}
                        </Link>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs">{item.exam.total} Marks</td>
                      <td className="px-4 py-4 text-center font-bold text-xs text-indigo-600">
                        {item.weightage}%
                      </td>
                      <td className="px-4 py-4 text-center">
                        {item.isRequired ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            Required
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-[10px]">
                            Optional
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExam(item.examId, item.exam.title)}
                          disabled={removeExamItemMutation.isPending}
                          className="h-8 w-8 p-0 text-outline hover:text-error hover:bg-error-container/20 rounded-lg cursor-pointer"
                          title="Remove from group"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Calculated Leaderboard & Results */}
      {activeTab === "results" && (
        <div className="space-y-4">
          {/* Results Toolbar */}
          <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
              <Input
                type="text"
                placeholder="Search student name or roll..."
                value={resultQuery}
                onChange={(e) => setResultQuery(e.target.value)}
                className="w-full bg-white pl-9 text-xs h-9"
              />
            </div>
          </div>

          {/* Results Table */}
          {isResultsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-surface-container-high rounded-xl" />
              ))}
            </div>
          ) : !resultsData?.items || resultsData.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant p-12 text-center text-outline">
              <Award className="mx-auto h-10 w-10 text-outline mb-2" />
              <p className="font-semibold text-sm">No calculated results found yet.</p>
              <p className="text-xs mt-1">Click "Calculate Results" above to process student attempts.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-outline-variant/30 bg-surface-container-low font-label-md text-xs uppercase tracking-wider text-outline">
                  <tr>
                    <th className="px-6 py-3.5 text-center">Rank</th>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-4 py-3.5 text-center">Exams Taken</th>
                    <th className="px-4 py-3.5 text-center">Score</th>
                    <th className="px-4 py-3.5 text-center">% Percentage</th>
                    <th className="px-4 py-3.5 text-center">GPA / Grade</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {resultsData.items.map((res: any) => (
                    <tr key={res.id} className="hover:bg-surface-container-low/60 transition-colors">
                      {/* Merit Rank */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-extrabold text-xs ${
                          res.meritPosition === 1
                            ? "bg-amber-100 text-amber-800 border border-amber-300 shadow-xs"
                            : res.meritPosition === 2
                            ? "bg-slate-200 text-slate-800 border border-slate-300"
                            : res.meritPosition === 3
                            ? "bg-amber-700/10 text-amber-900 border border-amber-700/20"
                            : "bg-surface-container-high text-on-surface"
                        }`}>
                          #{res.meritPosition ?? "-"}
                        </span>
                      </td>

                      {/* Student info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-outline" />
                          <div>
                            <p className="font-bold text-on-surface">{res.student?.user?.name || "Student"}</p>
                            <p className="text-xs text-outline">{res.student?.user?.email || res.studentId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Exams Attempted */}
                      <td className="px-4 py-4 text-center text-xs">
                        <span className="font-semibold">{res.examsAttempted}</span> / {res.totalExamsInGroup}
                      </td>

                      {/* Score */}
                      <td className="px-4 py-4 text-center font-mono font-bold text-sm text-primary">
                        {res.totalObtainedMarks} <span className="text-xs text-outline font-normal">/ {res.totalMaxMarks}</span>
                      </td>

                      {/* Percentage */}
                      <td className="px-4 py-4 text-center font-bold text-xs">
                        {res.percentage.toFixed(1)}%
                      </td>

                      {/* GPA / Grade */}
                      <td className="px-4 py-4 text-center text-xs">
                        {res.gpa !== null ? (
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                            GPA {res.gpa.toFixed(2)} ({res.grade || "A+"})
                          </span>
                        ) : (
                          <span className="text-outline">-</span>
                        )}
                      </td>

                      {/* Pass/Fail Status */}
                      <td className="px-6 py-4 text-center">
                        {res.status === "PASSED" ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            PASSED
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            {res.status}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

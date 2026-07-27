"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  useExamById,
  useUpdateExam,
  useAddExamSubjects,
  useRemoveExamSubject,
} from "../services/use-exam"
import { useSubjectsForSelection } from "../../subject/services/use-subject"
import { useAcademicClassesForSelection } from "../../academic-class/services/use-academic-class"
import { useExamGroupsList } from "../../exam-group/services/use-exam-group"

const examTypes = [
  { label: "MCQ Exam", value: "MCQ" },
  { label: "Written Exam", value: "Written" },
  { label: "Model Test", value: "Model Test" },
  { label: "Weekly Exam", value: "Weekly" },
  { label: "Monthly Exam", value: "Monthly" },
]

const examStatuses = [
  { label: "Pending / Draft", value: "Pending" },
  { label: "Published & Active", value: "Published" },
  { label: "Archived", value: "Archived" },
]

function formatDateDisplay(d?: Date) {
  if (!d) return ""
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

interface DateTimePickerProps {
  id?: string
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  disabled?: boolean
  placeholder?: string
  icon?: string
}

function DateTimePicker({
  id,
  value,
  onChange,
  disabled,
  placeholder = "Select Date & Time...",
  icon = "event",
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [timeStr, setTimeStr] = useState(
    value
      ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
      : "09:00"
  )

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange(undefined)
      return
    }
    const [hours, minutes] = timeStr.split(":").map(Number)
    const newDate = new Date(selectedDate)
    newDate.setHours(hours || 0, minutes || 0, 0, 0)
    onChange(newDate)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTimeStr(newTime)
    if (value) {
      const [hours, minutes] = newTime.split(":").map(Number)
      const newDate = new Date(value)
      newDate.setHours(hours || 0, minutes || 0, 0, 0)
      onChange(newDate)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <div className="group relative cursor-pointer">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
            {icon}
          </span>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className="w-full justify-start rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-4 font-body-md text-left text-on-surface transition-all hover:border-primary focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto font-normal cursor-pointer"
          >
            {value ? (
              <span>{formatDateDisplay(value)}</span>
            ) : (
              <span className="text-on-surface-variant/70">{placeholder}</span>
            )}
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 bg-white border border-outline-variant shadow-lg rounded-xl" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
        />
        <div className="mt-3 pt-3 border-t border-outline-variant/40 flex items-center justify-between gap-3">
          <Label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
            Time
          </Label>
          <Input
            type="time"
            value={timeStr}
            onChange={handleTimeChange}
            className="w-32 bg-surface-container-low text-xs border border-outline-variant rounded-md py-1.5 px-2.5 h-auto font-body-md"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface EditExamViewProps {
  examId: string
}

export function EditExamView({ examId }: EditExamViewProps) {
  const router = useRouter()
  const { data: exam, isLoading: isExamLoading, isError } = useExamById(examId)
  const { data: allClasses, isLoading: isClassesLoading } = useAcademicClassesForSelection()

  const updateMutation = useUpdateExam()
  const addSubjectsMutation = useAddExamSubjects()
  const removeSubjectMutation = useRemoveExamSubject()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form State
  const [academicClassId, setAcademicClassId] = useState("")
  const [title, setTitle] = useState("")
  const [type, setType] = useState("MCQ")
  const [status, setStatus] = useState("Pending")
  const [total, setTotal] = useState<number | "">(100)
  const [duration, setDuration] = useState<number | "">(60)
  const [totalMcq, setTotalMcq] = useState<number | "">(50)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [hasSuffle, setHasSuffle] = useState(false)
  const [hasRandom, setHasRandom] = useState(false)
  const [hasNegativeMark, setHasNegativeMark] = useState(false)
  const [negativeMark, setNegativeMark] = useState<number | "">(0.25)
  const [examGroupId, setExamGroupId] = useState<string>("none")

  // Fetch exam groups for selection
  const { data: examGroupsData } = useExamGroupsList({ limit: 100 })
  const availableExamGroups = examGroupsData?.items ?? []

  // Fetch subjects assigned to selected academic class
  const { data: allSubjects } = useSubjectsForSelection(
    academicClassId ? { academicClassId } : undefined
  )

  useEffect(() => {
    if (exam) {
      setTitle(exam.title ?? "")
      setType(exam.type ?? "MCQ")
      setStatus(exam.status ?? "Pending")
      setAcademicClassId(exam.academicClassId ?? "")
      setTotal(exam.total ?? 100)
      setDuration(exam.duration ?? 60)
      setTotalMcq(exam.totalMcq ?? 50)
      setStartDate(exam.startDate ? new Date(exam.startDate) : undefined)
      setEndDate(exam.endDate ? new Date(exam.endDate) : undefined)
      setHasSuffle(Boolean(exam.hasSuffle))
      setHasRandom(Boolean(exam.hasRandom))
      setHasNegativeMark(Boolean(exam.hasNegativeMark))
      setNegativeMark(exam.negativeMark ?? 0)
      setExamGroupId((exam as any).examGroupItems?.[0]?.examGroupId || "none")
    }
  }, [exam])

  const existingSubjectIds = exam?.examSubjects?.map((es) => es.subjectId) ?? []
  const isSubmitting = updateMutation.isPending

  const handleAddSubject = async (subjectId: string) => {
    try {
      await addSubjectsMutation.mutateAsync({
        examId,
        subjectIds: [subjectId],
      })
      toast.success("Subject added to exam")
    } catch (err: any) {
      toast.error(err.message || "Failed to add subject")
    }
  }

  const handleRemoveSubject = async (subjectId: string) => {
    try {
      await removeSubjectMutation.mutateAsync({
        examId,
        subjectId,
      })
      toast.success("Subject removed from exam")
    } catch (err: any) {
      toast.error(err.message || "Failed to remove subject")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!title.trim()) {
      const msg = "Please enter an exam title"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    if (!startDate) {
      const msg = "Please select a start date & time"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    if (!endDate) {
      const msg = "Please select an end date & time"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    if (endDate <= startDate) {
      const msg = "End date must be after start date"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: examId,
        title: title.trim(),
        type,
        status,
        academicClassId,
        total: Number(total),
        duration: Number(duration),
        totalMcq: Number(totalMcq),
        startDate,
        endDate,
        hasSuffle,
        hasRandom,
        hasNegativeMark,
        negativeMark: hasNegativeMark ? Number(negativeMark) || 0 : 0,
        examGroupId: examGroupId !== "none" ? examGroupId : null,
      })

      toast.success(`Exam "${title.trim()}" updated successfully!`)
      router.push("/exams")
    } catch (err: any) {
      const msg = err.message || "Failed to update exam"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isExamLoading) {
    return (
      <div className="flex items-center justify-center p-16 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">
          progress_activity
        </span>
        <span className="ml-3 font-body-md">Loading exam details...</span>
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
          The requested exam record could not be loaded or may have been removed.
        </p>
        <div className="mt-6">
          <Button
            type="button"
            onClick={() => router.push("/exams")}
            className="rounded-lg bg-primary px-6 py-2.5 font-bold text-white hover:bg-primary/90 h-auto normal-case tracking-normal cursor-pointer"
          >
            Back to Exams
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => router.push("/exams")}
            className="rounded-xl border border-outline-variant/60 bg-white text-on-surface hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-outline">
              <span className="material-symbols-outlined text-sm text-primary">assignment</span>
              <Link href="/exams" className="hover:text-primary transition-colors">Exams</Link>
              <span>/</span>
              <span className="font-semibold text-on-surface">Edit Exam</span>
            </div>
            <h1 className="font-headline-md text-2xl font-extrabold text-on-surface">
              Edit Exam: {exam.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-error/30 bg-error-container/20 p-4 text-error">
          <span className="material-symbols-outlined">error</span>
          <span className="font-body-md text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Info & Class */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined text-xl text-primary">assignment</span>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Basic Exam Info
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Target Class */}
            <div className="space-y-2">
              <Label htmlFor="edit-class-select" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Target Academic Class
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  school
                </span>
                <Select
                  disabled={isSubmitting || isClassesLoading}
                  value={academicClassId}
                  onValueChange={setAcademicClassId}
                >
                  <SelectTrigger id="edit-class-select" className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-10 font-body-md text-on-surface transition-all cursor-pointer focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto justify-between">
                    <SelectValue placeholder={isClassesLoading ? "Loading classes..." : "Select Class..."} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                    {allClasses?.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-exam-title" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Exam Title
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  title
                </span>
                <Input
                  id="edit-exam-title"
                  type="text"
                  disabled={isSubmitting}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 font-body-md text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  required
                />
              </div>
            </div>

            {/* Exam Type */}
            <div className="space-y-2">
              <Label htmlFor="edit-type-select" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Exam Type
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  category
                </span>
                <Select
                  disabled={isSubmitting}
                  value={type}
                  onValueChange={setType}
                >
                  <SelectTrigger id="edit-type-select" className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-10 font-body-md text-on-surface transition-all cursor-pointer focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto justify-between">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                    {examTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="edit-status-select" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Status
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  published_with_changes
                </span>
                <Select
                  disabled={isSubmitting}
                  value={status}
                  onValueChange={setStatus}
                >
                  <SelectTrigger id="edit-status-select" className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-10 font-body-md text-on-surface transition-all cursor-pointer focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto justify-between">
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                    {examStatuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Attach to Exam Group Select */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-exam-group-select" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Attach to Exam Group (Optional)
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  layers
                </span>
                <Select
                  disabled={isSubmitting}
                  value={examGroupId}
                  onValueChange={(val) => setExamGroupId(val ?? "none")}
                >
                  <SelectTrigger id="edit-exam-group-select" className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-10 font-body-md text-on-surface transition-all cursor-pointer focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto justify-between">
                    <SelectValue placeholder="None / Standalone Exam..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                    <SelectItem value="none">None / Standalone Exam</SelectItem>
                    {availableExamGroups.map((eg) => (
                      <SelectItem key={eg.id} value={eg.id}>
                        {eg.title} ({eg.type.replace("_", " ")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Linked Subjects */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-primary">book</span>
              <h2 className="font-headline-md text-lg font-bold text-on-surface">
                Linked Subjects
              </h2>
            </div>
            <span className="text-xs font-semibold text-outline">
              {existingSubjectIds.length} linked
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {exam.examSubjects?.map((es) => (
                <div
                  key={es.id}
                  className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 font-medium text-xs text-primary border border-primary/20"
                >
                  <span>{es.subject?.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(es.subjectId)}
                    disabled={removeSubjectMutation.isPending}
                    className="hover:text-error transition-colors cursor-pointer"
                    title="Remove Subject"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">
                Add More Subjects (Class Specific)
              </Label>
              <div className="flex flex-wrap gap-2">
                {allSubjects
                  ?.filter((s) => !existingSubjectIds.includes(s.id))
                  .map((s) => (
                    <Button
                      key={s.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSubject(s.id)}
                      disabled={addSubjectsMutation.isPending}
                      className="rounded-lg border-dashed border-outline-variant text-xs gap-1 hover:border-primary hover:text-primary cursor-pointer h-auto py-1.5 px-3"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      <span>{s.name}</span>
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Scoring & Duration */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined text-xl text-primary">workspace_premium</span>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Scoring & Duration Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="edit-total-marks" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Total Marks
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  workspace_premium
                </span>
                <Input
                  id="edit-total-marks"
                  type="number"
                  min="1"
                  disabled={isSubmitting}
                  value={total}
                  onChange={(e) => setTotal(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 font-body-md text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-mcq-count" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Total MCQ Count
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  quiz
                </span>
                <Input
                  id="edit-mcq-count"
                  type="number"
                  min="1"
                  disabled={isSubmitting}
                  value={totalMcq}
                  onChange={(e) => setTotalMcq(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 font-body-md text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-duration" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Duration (Minutes)
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  timer
                </span>
                <Input
                  id="edit-duration"
                  type="number"
                  min="1"
                  disabled={isSubmitting}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 font-body-md text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Schedule */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined text-xl text-primary">calendar_today</span>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Schedule Window
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-start-date" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Start Date & Time
              </Label>
              <DateTimePicker
                id="edit-start-date"
                value={startDate}
                onChange={setStartDate}
                disabled={isSubmitting}
                placeholder="Select start date & time..."
                icon="event"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-end-date" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                End Date & Time
              </Label>
              <DateTimePicker
                id="edit-end-date"
                value={endDate}
                onChange={setEndDate}
                disabled={isSubmitting}
                placeholder="Select end date & time..."
                icon="event_available"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Advanced Options */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined text-xl text-primary">tune</span>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Advanced Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-white p-4">
              <div>
                <Label htmlFor="edit-shuffle-switch" className="block text-sm font-semibold text-on-surface cursor-pointer">
                  Shuffle Questions
                </Label>
                <p className="text-xs text-on-surface-variant">Randomize question order</p>
              </div>
              <Switch
                id="edit-shuffle-switch"
                checked={hasSuffle}
                onCheckedChange={setHasSuffle}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-white p-4">
              <div>
                <Label htmlFor="edit-random-switch" className="block text-sm font-semibold text-on-surface cursor-pointer">
                  Random MCQ Selection
                </Label>
                <p className="text-xs text-on-surface-variant">Pull subset from question bank</p>
              </div>
              <Switch
                id="edit-random-switch"
                checked={hasRandom}
                onCheckedChange={setHasRandom}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-white p-4 md:col-span-2">
              <div>
                <Label htmlFor="edit-negative-switch" className="block text-sm font-semibold text-on-surface cursor-pointer">
                  Negative Marking
                </Label>
                <p className="text-xs text-on-surface-variant">Deduct points for wrong answers</p>
              </div>
              <div className="flex items-center gap-4">
                {hasNegativeMark && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="edit-negative-val" className="text-xs font-semibold text-on-surface">Deduct:</Label>
                    <Input
                      id="edit-negative-val"
                      type="number"
                      step="0.05"
                      min="0"
                      disabled={isSubmitting}
                      value={negativeMark}
                      onChange={(e) => setNegativeMark(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-20 rounded-md border border-outline-variant py-1 px-2 font-body-md text-xs bg-white"
                    />
                    <span className="text-xs text-outline">pts</span>
                  </div>
                )}
                <Switch
                  id="edit-negative-switch"
                  checked={hasNegativeMark}
                  onCheckedChange={setHasNegativeMark}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => router.push("/exams")}
            className="rounded-lg border border-outline px-8 py-3 font-bold text-primary transition-all active:scale-95 hover:bg-surface-container-low sm:flex-none cursor-pointer h-auto normal-case tracking-normal disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-primary-container px-10 py-3 font-bold text-on-primary-container shadow-md transition-all active:scale-95 hover:bg-primary hover:text-white disabled:opacity-50 sm:flex-none cursor-pointer h-auto normal-case tracking-normal"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">save</span>
            )}
            <span>{isSubmitting ? "Updating..." : "Update Exam"}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

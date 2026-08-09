"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Checkbox } from "@workspace/ui/components/checkbox"
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
import { useCreateExam } from "../services/use-exam"
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

export function CreateExamView() {
  const router = useRouter()
  const createMutation = useCreateExam()
  const { data: classesData, isLoading: isClassesLoading } = useAcademicClassesForSelection()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form State
  const [academicClassId, setAcademicClassId] = useState("")
  const [isOffline, setIsOffline] = useState(false)
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
  const [examGroupId, setExamGroupId] = useState("none")
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])

  // Fetch exam groups for selection (filtered by selected academic class)
  const { data: examGroupsData } = useExamGroupsList(
    academicClassId ? { academicClassId, limit: 100 } : { limit: 100 }
  )
  const availableExamGroups = examGroupsData?.items ?? []

  // Fetch subjects based on selected academic class ID
  const { data: subjectsData, isLoading: isSubjectsLoading } = useSubjectsForSelection(
    academicClassId ? { academicClassId } : undefined
  )

  const subjects = subjectsData ?? []
  const academicClasses = classesData ?? []

  const isSubmitting = createMutation.isPending

  const handleClassChange = (newClassId: string) => {
    setAcademicClassId(newClassId)
    // Clear previously selected subject IDs and exam group when changing academic class
    setSelectedSubjectIds([])
    setExamGroupId("none")
  }

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!academicClassId) {
      const msg = "Please select an academic class for this exam"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    if (!title.trim()) {
      const msg = "Please enter an exam title"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    if (!total || Number(total) <= 0) {
      const msg = "Please specify total marks"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    if (!duration || Number(duration) <= 0) {
      const msg = "Please specify exam duration in minutes"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    if (!totalMcq || Number(totalMcq) <= 0) {
      const msg = "Please specify total MCQ count"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    if (!startDate) {
      const msg = "Please set a start date & time"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    if (!endDate) {
      const msg = "Please set an end date & time"
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
    if (selectedSubjectIds.length === 0) {
      const msg = "Please select at least one subject for this exam"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        type,
        status,
        academicClassId,
        isOffline,
        total: Number(total),
        duration: Number(duration),
        totalMcq: Number(totalMcq),
        startDate,
        endDate,
        hasSuffle,
        hasRandom,
        hasNegativeMark,
        negativeMark: hasNegativeMark ? Number(negativeMark) || 0 : 0,
        subjectIds: selectedSubjectIds,
        examGroupId: examGroupId !== "none" ? examGroupId : undefined,
      })

      toast.success(`Exam "${title.trim()}" created successfully!`)
      router.push("/exams")
    } catch (err: any) {
      const msg = err.message || "Failed to create exam"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
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
            <span className="font-label-sm text-xs font-bold text-primary">Create New</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            New Academic Exam
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Configure basic details, parameters, rules, and subject mappings for the new exam.
          </p>
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
        {/* Section 1: Basic Information */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined text-xl text-primary">assignment</span>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Basic Exam Details
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Target Academic Class Select (First Field) */}
            <div className="space-y-2">
              <Label htmlFor="academic-class-select" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Target Academic Class <span className="text-error">*</span>
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  school
                </span>
                <Select
                  disabled={isSubmitting || isClassesLoading}
                  value={academicClassId}
                  onValueChange={handleClassChange}
                >
                  <SelectTrigger id="academic-class-select" className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-10 font-body-md text-on-surface transition-all cursor-pointer focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto justify-between">
                    <SelectValue placeholder={isClassesLoading ? "Loading classes..." : "Select Class..."} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                    {academicClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title Input (Second Field) */}
            <div className="space-y-2">
              <Label htmlFor="exam-title" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Exam Title <span className="text-error">*</span>
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  title
                </span>
                <Input
                  id="exam-title"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="e.g. HSC 2026 Physics Model Test - 01"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 font-body-md text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  required
                />
              </div>
            </div>

            {/* Exam Type Select (Third Field) */}
            <div className="space-y-2">
              <Label htmlFor="exam-type-select" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Exam Type <span className="text-error">*</span>
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
                  <SelectTrigger id="exam-type-select" className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-10 font-body-md text-on-surface transition-all cursor-pointer focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto justify-between">
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

            {/* Status Select (Fourth Field) */}
            <div className="space-y-2">
              <Label htmlFor="exam-status-select" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Initial Status
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
                  <SelectTrigger id="exam-status-select" className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-10 font-body-md text-on-surface transition-all cursor-pointer focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto justify-between">
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
              <Label htmlFor="exam-group-select" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Attach to Exam Group (Optional)
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  layers
                </span>
                <Select
                  disabled={isSubmitting || !academicClassId}
                  value={examGroupId}
                  onValueChange={(val) => setExamGroupId(val ?? "none")}
                >
                  <SelectTrigger id="exam-group-select" className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-10 font-body-md text-on-surface transition-all cursor-pointer focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto justify-between disabled:opacity-50">
                    <SelectValue placeholder={!academicClassId ? "Please select academic class first..." : "None / Standalone Exam..."} />
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

        {/* Section 2: Subject Selection (Filtered by Academic Class ID) */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-primary">book</span>
              <h2 className="font-headline-md text-lg font-bold text-on-surface">
                Assign Subjects <span className="text-error">*</span>
              </h2>
            </div>
            <span className="text-xs font-semibold text-outline">
              {selectedSubjectIds.length} subject{selectedSubjectIds.length === 1 ? "" : "s"} selected
            </span>
          </div>

          <p className="text-xs text-on-surface-variant mb-4">
            Select one or more academic subjects assigned to the selected academic class.
          </p>

          {!academicClassId ? (
            <div className="p-6 text-center border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low/50">
              <span className="material-symbols-outlined text-3xl text-outline mb-1">school</span>
              <p className="text-xs font-medium text-on-surface-variant">
                Please select a Target Academic Class in the basic details section above to view available subjects.
              </p>
            </div>
          ) : isSubjectsLoading ? (
            <div className="flex items-center justify-center p-8 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-2xl text-primary">
                progress_activity
              </span>
              <span className="ml-2 text-xs">Loading subjects for class...</span>
            </div>
          ) : subjects.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low/50">
              <span className="material-symbols-outlined text-3xl text-outline mb-1">book</span>
              <p className="text-xs text-on-surface-variant">
                No subjects assigned to this academic class yet. Please assign subjects to this class first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjects.map((subj) => {
                const isSelected = selectedSubjectIds.includes(subj.id)
                return (
                  <Label
                    key={subj.id}
                    htmlFor={`subject-check-${subj.id}`}
                    className={`flex items-center justify-between p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 text-primary font-medium shadow-2xs"
                        : "border-outline-variant bg-white text-on-surface hover:border-outline"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{subj.name}</span>
                    </div>
                    <Checkbox
                      id={`subject-check-${subj.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleSubject(subj.id)}
                      disabled={isSubmitting}
                      className="rounded-md border-outline-variant data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    />
                  </Label>
                )
              })}
            </div>
          )}
        </div>

        {/* Section 3: Assessment Configuration & Scoring */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined text-xl text-primary">workspace_premium</span>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Scoring & Duration Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Total Marks */}
            <div className="space-y-2">
              <Label htmlFor="exam-total" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Total Marks <span className="text-error">*</span>
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  workspace_premium
                </span>
                <Input
                  id="exam-total"
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

            {/* Total MCQ Count */}
            <div className="space-y-2">
              <Label htmlFor="exam-mcq-count" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Total MCQ Count <span className="text-error">*</span>
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  quiz
                </span>
                <Input
                  id="exam-mcq-count"
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

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="exam-duration" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Duration (Minutes) <span className="text-error">*</span>
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  timer
                </span>
                <Input
                  id="exam-duration"
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

        {/* Section 4: Schedule Window */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined text-xl text-primary">calendar_today</span>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Exam Schedule Window
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start-date-input" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Start Date & Time <span className="text-error">*</span>
              </Label>
              <DateTimePicker
                id="start-date-input"
                value={startDate}
                onChange={setStartDate}
                disabled={isSubmitting}
                placeholder="Select start date & time..."
                icon="event"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="end-date-input" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                End Date & Time <span className="text-error">*</span>
              </Label>
              <DateTimePicker
                id="end-date-input"
                value={endDate}
                onChange={setEndDate}
                disabled={isSubmitting}
                placeholder="Select end date & time..."
                icon="event_available"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Advanced Options & Rules */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined text-xl text-primary">tune</span>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Advanced Exam Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Shuffle Questions */}
            <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-white p-4">
              <div>
                <Label htmlFor="shuffle-switch" className="block text-sm font-semibold text-on-surface cursor-pointer">
                  Shuffle Questions
                </Label>
                <p className="text-xs text-on-surface-variant">
                  Randomize question display order for every student attempt
                </p>
              </div>
              <Switch
                id="shuffle-switch"
                checked={hasSuffle}
                onCheckedChange={setHasSuffle}
                disabled={isSubmitting}
              />
            </div>

            {/* Random MCQ Selection */}
            <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-white p-4">
              <div>
                <Label htmlFor="random-switch" className="block text-sm font-semibold text-on-surface cursor-pointer">
                  Random MCQ Selection
                </Label>
                <p className="text-xs text-on-surface-variant">
                  Pull a randomized subset of MCQs from question bank
                </p>
              </div>
              <Switch
                id="random-switch"
                checked={hasRandom}
                onCheckedChange={setHasRandom}
                disabled={isSubmitting}
              />
            </div>

            {/* Negative Marking Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-white p-4 md:col-span-2">
              <div>
                <Label htmlFor="negative-mark-switch" className="block text-sm font-semibold text-on-surface cursor-pointer">
                  Negative Marking
                </Label>
                <p className="text-xs text-on-surface-variant">
                  Deduct points for incorrect student answers
                </p>
              </div>
              <div className="flex items-center gap-4">
                {hasNegativeMark && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="negative-mark-value" className="text-xs font-semibold text-on-surface">Deduct:</Label>
                    <Input
                      id="negative-mark-value"
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
                  id="negative-mark-switch"
                  checked={hasNegativeMark}
                  onCheckedChange={setHasNegativeMark}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Exam Mode */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined text-xl text-primary">lan</span>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Exam Mode & Audience
            </h2>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-white p-4">
            <div>
              <Label htmlFor="exam-is-offline" className="block text-sm font-semibold text-on-surface cursor-pointer select-none">
                Offline Exam
              </Label>
              <p className="text-xs text-on-surface-variant">
                Enable this option if the exam is to be conducted for offline students.
              </p>
            </div>
            <Switch
              id="exam-is-offline"
              checked={isOffline}
              onCheckedChange={setIsOffline}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Meta & Actions */}
        <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-outline-variant pt-6 sm:pt-8">
          <div className="flex items-center justify-center sm:justify-start space-x-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">history</span>
            <span className="text-[12px]">New Record</span>
          </div>
          <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => router.push("/exams")}
              className="w-full sm:w-auto rounded-lg border border-outline px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-primary transition-all active:scale-95 hover:bg-surface-container-low cursor-pointer h-auto normal-case tracking-normal disabled:opacity-50 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded-lg bg-primary-container px-8 sm:px-10 py-2.5 sm:py-3 font-bold text-on-primary-container shadow-md transition-all active:scale-95 hover:bg-primary hover:text-white disabled:opacity-50 cursor-pointer h-auto normal-case tracking-normal text-sm"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin text-[18px] sm:text-[20px]">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">save</span>
              )}
              <span>{isSubmitting ? "Saving..." : "Save Exam"}</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

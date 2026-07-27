"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
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
import { useCreateExamGroup } from "../services/use-exam-group"
import { useAcademicClassesForSelection } from "../../academic-class/services/use-academic-class"
import { useExamsList } from "../../exam/services/use-exam"

const groupTypes = [
  { label: "Model Test Series", value: "MODEL_TEST" },
  { label: "Term Examination", value: "TERM_EXAM" },
  { label: "Weekly Series", value: "WEEKLY_SERIES" },
  { label: "Subject Combo", value: "SUBJECT_COMBO" },
]

const calculationModes = [
  { label: "SUM (Total Marks)", value: "SUM" },
  { label: "AVERAGE (Mean Percentage)", value: "AVERAGE" },
  { label: "WEIGHTED AVERAGE (Custom Weights)", value: "WEIGHTED_AVERAGE" },
  { label: "BEST OF N (Top N Highest Scores)", value: "BEST_OF_N" },
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

export function CreateExamGroupView() {
  const router = useRouter()
  const createMutation = useCreateExamGroup()

  const { data: classesData, isLoading: isClassesLoading } = useAcademicClassesForSelection()
  const academicClasses = classesData ?? []

  const { data: examsData } = useExamsList({ limit: 100 })
  const availableExams = examsData?.items ?? []

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"MODEL_TEST" | "TERM_EXAM" | "WEEKLY_SERIES" | "SUBJECT_COMBO">("MODEL_TEST")
  const [calculationType, setCalculationType] = useState<"SUM" | "AVERAGE" | "WEIGHTED_AVERAGE" | "BEST_OF_N">("SUM")
  const [bestOfNCount, setBestOfNCount] = useState<number | "">(2)
  const [totalMarks, setTotalMarks] = useState<number | "">("")
  const [passMarks, setPassMarks] = useState<number | "">("")
  const [academicClassId, setAcademicClassId] = useState<string>("none")
  const [isPublished, setIsPublished] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // Attached Exams State
  const [selectedExamItems, setSelectedExamItems] = useState<
    Array<{ examId: string; position: number; weightage: number; isRequired: boolean }>
  >([])

  const isSubmitting = createMutation.isPending

  const handleAddExamItem = (examId: string) => {
    if (!examId || examId === "none") return
    if (selectedExamItems.some((item) => item.examId === examId)) {
      toast.error("This exam is already added to the group")
      return
    }

    setSelectedExamItems((prev) => [
      ...prev,
      {
        examId,
        position: prev.length,
        weightage: 100,
        isRequired: true,
      },
    ])
  }

  const handleRemoveExamItem = (examId: string) => {
    setSelectedExamItems((prev) => prev.filter((item) => item.examId !== examId))
  }

  const handleUpdateExamItem = (
    examId: string,
    field: "weightage" | "isRequired",
    value: any
  ) => {
    setSelectedExamItems((prev) =>
      prev.map((item) =>
        item.examId === examId ? { ...item, [field]: value } : item
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!title.trim()) {
      const msg = "Please enter an Exam Group Title"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    try {
      const payload: any = {
        title: title.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
        type,
        calculationType,
        bestOfNCount: calculationType === "BEST_OF_N" ? Number(bestOfNCount) || 1 : undefined,
        totalMarks: totalMarks !== "" ? Number(totalMarks) : undefined,
        passMarks: passMarks !== "" ? Number(passMarks) : undefined,
        academicClassId: academicClassId !== "none" ? academicClassId : undefined,
        isPublished,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        items: selectedExamItems.map((item, idx) => ({
          ...item,
          position: idx,
        })),
      }

      const created = await createMutation.mutateAsync(payload)
      toast.success(`Exam Group "${title.trim()}" created successfully!`)
      router.push(`/exam-groups/${created.id}`)
    } catch (err: any) {
      const msg = err.message || "Failed to create exam group"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Top Header / Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => router.push("/exam-groups")}
            className="rounded-xl border border-outline-variant/60 bg-white text-on-surface hover:bg-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-outline">
              <span className="material-symbols-outlined text-sm text-primary">layers</span>
              <Link href="/exam-groups" className="hover:text-primary transition-colors">Exam Groups</Link>
              <span>/</span>
              <span className="font-semibold text-on-surface">New Exam Group</span>
            </div>
            <h1 className="font-headline-md text-2xl font-extrabold text-on-surface">
              Create New Exam Group
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
        {/* Section 1: Basic Information */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined text-xl text-primary">layers</span>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Basic Exam Group Details
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Target Academic Class Select */}
            <div className="space-y-2">
              <Label htmlFor="academic-class-select" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Target Academic Class
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  school
                </span>
                <Select
                  disabled={isSubmitting || isClassesLoading}
                  value={academicClassId}
                  onValueChange={(val) => setAcademicClassId(val ?? "none")}
                >
                  <SelectTrigger id="academic-class-select" className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-10 font-body-md text-on-surface transition-all cursor-pointer focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto justify-between">
                    <SelectValue placeholder={isClassesLoading ? "Loading classes..." : "Select Class (Optional)..."} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                    <SelectItem value="none">None / Global Group</SelectItem>
                    {academicClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Exam Group Title */}
            <div className="space-y-2">
              <Label htmlFor="group-title" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Group Title <span className="text-error">*</span>
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  title
                </span>
                <Input
                  id="group-title"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="e.g. HSC 2026 Model Test Series - 01"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 font-body-md text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  required
                />
              </div>
            </div>

            {/* Group Code */}
            <div className="space-y-2">
              <Label htmlFor="group-code" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Group Code (Optional)
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  tag
                </span>
                <Input
                  id="group-code"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="e.g. MT-2026-01"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 font-body-md font-mono text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                />
              </div>
            </div>

            {/* Exam Group Type */}
            <div className="space-y-2">
              <Label htmlFor="group-type-select" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Group Type <span className="text-error">*</span>
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  category
                </span>
                <Select
                  disabled={isSubmitting}
                  value={type}
                  onValueChange={(val: any) => setType(val)}
                >
                  <SelectTrigger id="group-type-select" className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-10 font-body-md text-on-surface transition-all cursor-pointer focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto justify-between">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                    {groupTypes.map((gt) => (
                      <SelectItem key={gt.value} value={gt.value}>
                        {gt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="group-description" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Description & Instructions
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  description
                </span>
                <Textarea
                  id="group-description"
                  disabled={isSubmitting}
                  placeholder="Enter details, syllabus overview, or guidelines for this exam group..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 font-body-md text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Calculation & Configuration Strategy */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined text-xl text-primary">calculate</span>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Evaluation & Calculation Strategy
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Calculation Mode Select */}
            <div className="space-y-2">
              <Label htmlFor="calc-mode-select" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Calculation Mode <span className="text-error">*</span>
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  functions
                </span>
                <Select
                  disabled={isSubmitting}
                  value={calculationType}
                  onValueChange={(val: any) => setCalculationType(val)}
                >
                  <SelectTrigger id="calc-mode-select" className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-10 font-body-md text-on-surface transition-all cursor-pointer focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto justify-between">
                    <SelectValue placeholder="Select calculation mode..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                    {calculationModes.map((cm) => (
                      <SelectItem key={cm.value} value={cm.value}>
                        {cm.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Best Of N Count (Conditional) */}
            {calculationType === "BEST_OF_N" && (
              <div className="space-y-2">
                <Label htmlFor="best-n-count" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Best N Count (e.g. Best 2 out of N)
                </Label>
                <div className="group relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                    military_tech
                  </span>
                  <Input
                    id="best-n-count"
                    type="number"
                    min={1}
                    max={20}
                    disabled={isSubmitting}
                    value={bestOfNCount}
                    onChange={(e) => setBestOfNCount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 font-body-md text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>
              </div>
            )}

            {/* Total Marks */}
            <div className="space-y-2">
              <Label htmlFor="total-marks" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Group Total Marks (Optional Benchmark)
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  grade
                </span>
                <Input
                  id="total-marks"
                  type="number"
                  placeholder="e.g. 300"
                  disabled={isSubmitting}
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 font-body-md text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                />
              </div>
            </div>

            {/* Pass Marks */}
            <div className="space-y-2">
              <Label htmlFor="pass-marks" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Group Pass Marks (Optional Threshold)
              </Label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                  verified
                </span>
                <Input
                  id="pass-marks"
                  type="number"
                  placeholder="e.g. 100"
                  disabled={isSubmitting}
                  value={passMarks}
                  onChange={(e) => setPassMarks(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 font-body-md text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                />
              </div>
            </div>

            {/* Series Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start-date-picker" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Series Start Date & Time
              </Label>
              <DateTimePicker
                id="start-date-picker"
                value={startDate}
                onChange={setStartDate}
                disabled={isSubmitting}
                placeholder="Select Start Date..."
                icon="event"
              />
            </div>

            {/* Series End Date */}
            <div className="space-y-2">
              <Label htmlFor="end-date-picker" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Series End Date & Time
              </Label>
              <DateTimePicker
                id="end-date-picker"
                value={endDate}
                onChange={setEndDate}
                disabled={isSubmitting}
                placeholder="Select End Date..."
                icon="event_busy"
              />
            </div>

            {/* Publish Immediately Switch */}
            <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-white p-4 md:col-span-2">
              <div>
                <Label htmlFor="publish-switch" className="block text-sm font-semibold text-on-surface cursor-pointer">
                  Publish Immediately
                </Label>
                <p className="text-xs text-on-surface-variant">
                  Make this group and its calculated leaderboard visible to students
                </p>
              </div>
              <Switch
                id="publish-switch"
                checked={isPublished}
                onCheckedChange={setIsPublished}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Included Standalone Exams */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-primary">format_list_bulleted</span>
              <h2 className="font-headline-md text-lg font-bold text-on-surface">
                Include Standalone Exams
              </h2>
            </div>
            <span className="text-xs font-semibold text-outline">
              {selectedExamItems.length} exam{selectedExamItems.length === 1 ? "" : "s"} added
            </span>
          </div>

          <p className="text-xs text-on-surface-variant mb-4">
            Select standalone exams to bundle inside this group evaluation.
          </p>

          <div className="mb-4">
            <div className="group relative max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                add_circle
              </span>
              <Select onValueChange={handleAddExamItem}>
                <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-10 font-body-md text-on-surface transition-all cursor-pointer focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto justify-between">
                  <SelectValue placeholder="+ Select Exam to Add..." />
                </SelectTrigger>
                <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                  {availableExams.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.title} ({ex.total} Marks)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedExamItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant p-6 text-center text-xs text-outline">
              No exams added yet. Use the dropdown above to add exams to this group.
            </div>
          ) : (
            <div className="space-y-3">
              {selectedExamItems.map((item, idx) => {
                const exam = availableExams.find((e) => e.id === item.examId)
                return (
                  <div
                    key={item.examId}
                    className="flex flex-col gap-3 rounded-xl border border-outline-variant/60 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">
                          {exam?.title || item.examId}
                        </h4>
                        <p className="text-xs text-outline">
                          Total Marks: {exam?.total ?? 100} | Duration: {exam?.duration ?? 60} mins
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Weightage Input */}
                      <div className="flex items-center gap-1.5">
                        <Label className="text-xs text-outline font-medium">Weight:</Label>
                        <Input
                          type="number"
                          value={item.weightage}
                          onChange={(e) =>
                            handleUpdateExamItem(item.examId, "weightage", Number(e.target.value))
                          }
                          className="h-8 w-20 rounded-md border border-outline-variant bg-white text-xs px-2 py-1"
                        />
                        <span className="text-xs text-outline">%</span>
                      </div>

                      {/* Required Checkbox */}
                      <label className="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isRequired}
                          onChange={(e) =>
                            handleUpdateExamItem(item.examId, "isRequired", e.target.checked)
                          }
                          className="rounded border-outline-variant text-primary focus:ring-primary"
                        />
                        <span>Required</span>
                      </label>

                      {/* Remove Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => handleRemoveExamItem(item.examId)}
                        className="h-8 w-8 text-outline hover:text-error hover:bg-error-container/20 rounded-lg cursor-pointer p-0"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => router.push("/exam-groups")}
            className="rounded-lg border border-outline px-8 py-3 font-bold text-primary transition-all active:scale-95 hover:bg-surface-container-low cursor-pointer h-auto normal-case tracking-normal disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center space-x-2 rounded-lg bg-primary-container px-10 py-3 font-bold text-on-primary-container shadow-md transition-all active:scale-95 hover:bg-primary hover:text-white disabled:opacity-50 cursor-pointer h-auto normal-case tracking-normal"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">save</span>
            )}
            <span>{isSubmitting ? "Saving..." : "Save Exam Group"}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

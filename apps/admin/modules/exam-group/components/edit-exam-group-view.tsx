"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Skeleton } from "@workspace/ui/components/skeleton"
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
import { useAcademicClassesForSelection } from "../../academic-class/services/use-academic-class"
import { useExamGroupById, useUpdateExamGroup } from "../services/use-exam-group"

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

interface EditExamGroupViewProps {
  id: string
}

export function EditExamGroupView({ id }: EditExamGroupViewProps) {
  const router = useRouter()
  const { data: groupData, isLoading, isError } = useExamGroupById(id)
  const updateMutation = useUpdateExamGroup()

  const { data: classesData, isLoading: isClassesLoading } = useAcademicClassesForSelection()
  const academicClasses = classesData ?? []

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

  useEffect(() => {
    if (groupData) {
      setTitle(groupData.title || "")
      setCode(groupData.code || "")
      setDescription(groupData.description || "")
      setType((groupData.type as any) || "MODEL_TEST")
      setCalculationType((groupData.calculationType as any) || "SUM")
      setBestOfNCount(groupData.bestOfNCount ?? 2)
      setTotalMarks(groupData.totalMarks ?? "")
      setPassMarks(groupData.passMarks ?? "")
      setAcademicClassId(groupData.academicClassId || "none")
      setIsPublished(Boolean(groupData.isPublished))
      setStartDate(groupData.startDate ? new Date(groupData.startDate) : undefined)
      setEndDate(groupData.endDate ? new Date(groupData.endDate) : undefined)
    }
  }, [groupData])

  const isSubmitting = updateMutation.isPending

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
      await updateMutation.mutateAsync({
        id,
        title: title.trim(),
        code: code.trim() || null,
        description: description.trim() || null,
        type,
        calculationType,
        bestOfNCount: calculationType === "BEST_OF_N" ? Number(bestOfNCount) || 1 : null,
        totalMarks: totalMarks !== "" ? Number(totalMarks) : null,
        passMarks: passMarks !== "" ? Number(passMarks) : null,
        academicClassId: academicClassId !== "none" ? academicClassId : null,
        isPublished,
        startDate: startDate || null,
        endDate: endDate || null,
      })

      toast.success("Exam Group metadata updated successfully!")
      router.push(`/exam-groups/${id}`)
    } catch (err: any) {
      const msg = err.message || "Failed to update exam group"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-4 py-8">
        <Skeleton className="h-10 w-48 bg-surface-container-high rounded-xl" />
        <Skeleton className="h-64 w-full bg-surface-container-high rounded-2xl" />
      </div>
    )
  }

  if (isError || !groupData) {
    return (
      <div className="w-full max-w-5xl mx-auto rounded-xl border border-error/20 bg-error-container/10 p-8 text-center">
        <p className="font-semibold text-error text-base">Exam Group not found.</p>
        <div className="mt-4">
          <Link href="/exam-groups">
            <Button variant="outline">Back to Exam Groups</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Top Header / Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => router.push(`/exam-groups/${id}`)}
            className="rounded-xl border border-outline-variant/60 bg-white text-on-surface hover:bg-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-outline">
              <span className="material-symbols-outlined text-sm text-primary">layers</span>
              <Link href="/exam-groups" className="hover:text-primary transition-colors">Exam Groups</Link>
              <span>/</span>
              <Link href={`/exam-groups/${id}`} className="hover:text-primary transition-colors">{groupData.title}</Link>
              <span>/</span>
              <span className="font-semibold text-on-surface">Edit</span>
            </div>
            <h1 className="font-headline-md text-2xl font-extrabold text-on-surface">
              Edit Exam Group
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
                    <SelectValue placeholder={isClassesLoading ? "Loading classes..." : "Select Class..."} />
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

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => router.push(`/exam-groups/${id}`)}
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
            <span>{isSubmitting ? "Updating..." : "Update Exam Group"}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

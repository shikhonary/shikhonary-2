"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useRearrangeById,
  useUpdateRearrange,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-rearrange"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { ChevronRightIcon, Plus, Trash2, ArrowUp, ArrowDown, ClipboardList, Loader2 } from "lucide-react"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"
import { REARRANGE_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"

const editRearrangeFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().optional(),
  options: z
    .array(z.object({ value: z.string().min(1, "Option text cannot be empty") }))
    .min(1, "At least one sentence option is required"),
  answerKey: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  referenceText: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
})

type EditRearrangeFormData = z.infer<typeof editRearrangeFormSchema>

const ROW_LABELS = ["(a)", "(b)", "(c)", "(d)", "(e)", "(f)", "(g)", "(h)", "(i)", "(j)", "(k)", "(l)"]

export function EditRearrangeView({ id }: { id: string }) {
  const router = useRouter()
  const { data: questionData, isLoading, isError } = useRearrangeById(id)
  const updateMutation = useUpdateRearrange()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [bulkText, setBulkText] = useState("")
  const [showBulkPaste, setShowBulkPaste] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditRearrangeFormData>({
    resolver: zodResolver(editRearrangeFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      options: [],
      answerKey: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
      source: DEFAULT_SOURCE,
      session: new Date().getFullYear().toString(),
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "options",
  })

  useEffect(() => {
    if (questionData) {
      const classId = questionData.subject?.classSubjects?.[0]?.classId || ""
      reset({
        classId,
        subjectId: questionData.subjectId,
        chapterId: questionData.academicChapterId || "",
        options: Array.isArray(questionData.options)
          ? questionData.options.map((opt) => ({ value: opt }))
          : [],
        answerKey: questionData.answerKey || "",
        difficulty: (questionData.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
        referenceText: Array.isArray(questionData.reference) ? questionData.reference.join(", ") : "",
        source: questionData.source || DEFAULT_SOURCE,
        session: questionData.session || "",
      })
    }
  }, [questionData, reset])

  const selectedClassId = watch("classId")
  const selectedSubjectId = watch("subjectId")

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim().replace(/^[a-z0-9ivx]+\s*[\.\)\-]\s*/i, ""))
      .filter((l) => l.length > 0)

    if (lines.length > 0) {
      lines.forEach((line) => append({ value: line }))
      setBulkText("")
      setShowBulkPaste(false)
      toast.success(`Added ${lines.length} options.`)
    }
  }

  const onSubmit = async (data: EditRearrangeFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const optionsArray = data.options
        .map((o) => o.value.trim())
        .filter((o) => o.length > 0)

      if (optionsArray.length === 0) {
        toast.error("Please provide at least one sentence option.")
        return
      }

      await updateMutation.mutateAsync({
        id,
        subjectId: data.subjectId,
        academicChapterId: data.chapterId || null,
        options: optionsArray,
        answerKey: data.answerKey?.trim() || null,
        difficulty: data.difficulty,
        reference: referenceArray,
        source: data.source?.trim() || null,
        session: data.session?.trim() || null,
      })

      toast.success("Rearrange question updated successfully.")
      setTimeout(() => {
        router.push("/rearranges")
      }, 800)
    } catch (err: any) {
      const msg = err.message || "Failed to update question"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-on-surface-variant font-medium">Loading question details...</p>
      </div>
    )
  }

  if (isError || !questionData) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-destructive/20 space-y-3">
        <p className="text-base font-semibold text-destructive">Question Not Found</p>
        <p className="text-sm text-on-surface-variant">The requested question could not be found or was deleted.</p>
        <Button asChild size="sm">
          <Link href="/rearranges">Return to List</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header & Breadcrumb */}
      <div>
        <nav className="mb-2 flex items-center space-x-2 text-xs text-on-surface-variant">
          <Link href="/rearranges" className="hover:text-primary transition-colors cursor-pointer">
            Rearranges
          </Link>
          <ChevronRightIcon className="size-3.5" />
          <span className="font-semibold text-on-surface">Edit Question</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Edit Rearrange Question</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Update the disordered sentences, correct sequence answer key, or classification.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Academic Hierarchy */}
        <Card className="border-outline-variant/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Academic Hierarchy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Class */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-on-surface">Academic Class *</Label>
                <Controller
                  name="classId"
                  control={control}
                  render={({ field }) => (
                    <Select disabled={isSubmitting} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-white border-outline-variant text-sm h-10 cursor-pointer">
                        <SelectValue placeholder="Select Class..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {academicClasses.map((ac) => (
                          <SelectItem key={ac.id} value={ac.id}>
                            {ac.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.classId && <p className="text-xs text-destructive">{errors.classId.message}</p>}
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-on-surface">Subject *</Label>
                <Controller
                  name="subjectId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isSubmitting || !selectedClassId}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full bg-white border-outline-variant text-sm h-10 cursor-pointer disabled:opacity-50">
                        <SelectValue placeholder={selectedClassId ? "Select Subject..." : "Select Class first"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {subjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subjectId && <p className="text-xs text-destructive">{errors.subjectId.message}</p>}
              </div>

              {/* Chapter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-on-surface">Chapter (Optional)</Label>
                <Controller
                  name="chapterId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isSubmitting || !selectedSubjectId}
                      value={field.value || "none"}
                      onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                    >
                      <SelectTrigger className="w-full bg-white border-outline-variant text-sm h-10 cursor-pointer disabled:opacity-50">
                        <SelectValue placeholder={selectedSubjectId ? "Select Chapter..." : "Select Subject first"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="none">No Chapter / Global</SelectItem>
                        {chapters.map((ch) => (
                          <SelectItem key={ch.id} value={ch.id}>
                            {ch.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Options / Sentences Card */}
        <Card className="border-outline-variant/60 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Sentences to Rearrange *</CardTitle>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Rearrange or edit sentences in the order they will appear to students.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBulkPaste(!showBulkPaste)}
                className="h-8 gap-1.5 text-xs cursor-pointer"
              >
                <ClipboardList className="size-3.5" />
                <span>Paste Lines</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ value: "" })}
                className="h-8 gap-1.5 text-xs cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add Sentence</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Bulk Paste Drawer / Helper */}
            {showBulkPaste && (
              <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Quick Multi-line Paste</span>
                  <span className="text-[11px] text-muted-foreground">Paste multiple sentences, one per line</span>
                </div>
                <Textarea
                  rows={4}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`(a) Once upon a time there lived a wise king.\n(b) The king was known for his wisdom.\n(c) People came from afar to ask his advice.`}
                  className="bg-white text-xs border-outline-variant"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBulkText("")
                      setShowBulkPaste(false)
                    }}
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleBulkAdd}
                    className="h-7 text-xs"
                  >
                    Add Lines to Options
                  </Button>
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="space-y-2.5">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2 group">
                  <span className="font-bold font-mono text-xs text-primary pt-2.5 w-7 text-center shrink-0 select-none">
                    {ROW_LABELS[index] || `(${index + 1})`}
                  </span>
                  <div className="flex-1">
                    <Input
                      disabled={isSubmitting}
                      placeholder={`Sentence ${index + 1}...`}
                      {...register(`options.${index}.value` as const)}
                      className="bg-white border-outline-variant text-sm h-10"
                    />
                    {errors.options?.[index]?.value && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.options[index]?.value?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 pt-1">
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => move(index, index - 1)}
                        title="Move Up"
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                    )}
                    {index < fields.length - 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => move(index, index + 1)}
                        title="Move Down"
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={() => remove(index)}
                      title="Remove Sentence"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {errors.options?.root && (
              <p className="text-xs text-destructive">{errors.options.root.message}</p>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ value: "" })}
              className="w-full border-dashed border-outline-variant py-2.5 h-auto text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-primary"
            >
              <Plus className="size-3.5" />
              <span>Add Another Sentence</span>
            </Button>
          </CardContent>
        </Card>

        {/* Model Answer Key Card */}
        <Card className="border-outline-variant/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Model Answer / Sequence Key (Optional)</CardTitle>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Enter the correct order sequence for teacher grading reference.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              disabled={isSubmitting}
              placeholder="e.g. b + d + a + c + e or (iii) -> (i) -> (iv) -> (ii)"
              {...register("answerKey")}
              className="bg-white border-outline-variant font-mono text-sm h-10"
            />
          </CardContent>
        </Card>

        {/* Question Metadata & Tags */}
        <Card className="border-outline-variant/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Metadata & Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Difficulty */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-on-surface">Difficulty</Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select disabled={isSubmitting} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-white border-outline-variant text-sm h-10 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Source */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-on-surface">Source</Label>
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <Select disabled={isSubmitting} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-white border-outline-variant text-sm h-10 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {REARRANGE_SOURCE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Session / Year */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-on-surface">Session / Year</Label>
                <Input
                  disabled={isSubmitting}
                  placeholder="2026"
                  {...register("session")}
                  className="bg-white border-outline-variant text-sm h-10"
                />
              </div>

              {/* References (Comma Separated) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-on-surface">Reference Tags (Comma-separated)</Label>
                <Input
                  disabled={isSubmitting}
                  placeholder="Dhaka Board 2024, Model Test 1"
                  {...register("referenceText")}
                  className="bg-white border-outline-variant text-sm h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" asChild className="h-10 cursor-pointer">
            <Link href="/rearranges">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-10 px-6 cursor-pointer">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}

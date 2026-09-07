"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { usePbqById, useUpdatePbq } from "../services/use-pbq"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { HelpCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"

const editPbqFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  context: z.string().min(1, "Passage context is required"),
  questionA: z.string().min(1, "Question A (ক) text is required"),
  questionB: z.string().min(1, "Question B (খ) text is required"),
  questionC: z.string().min(1, "Question C (গ) text is required"),
  questionD: z.string().min(1, "Question D (ঘ) text is required"),
  questionE: z.string().min(1, "Question E (ঙ) text is required"),
  referenceText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  isActive: z.boolean(),
  marksA: z.string(),
  marksB: z.string(),
  marksC: z.string(),
  marksD: z.string(),
  marksE: z.string(),
})

type EditPbqFormData = z.infer<typeof editPbqFormSchema>

export function EditPbqView() {
  const router = useRouter()
  const params = useParams()
  const pbqId = params.id as string

  const { data: pbqData, isLoading: isPbqLoading, isError } = usePbqById(pbqId)
  const updateMutation = useUpdatePbq()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditPbqFormData>({
    resolver: zodResolver(editPbqFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      context: "",
      questionA: "",
      questionB: "",
      questionC: "",
      questionD: "",
      questionE: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      isActive: true,
      marksA: "2",
      marksB: "2",
      marksC: "2",
      marksD: "2",
      marksE: "2",
    },
  })

  // Load existing data
  useEffect(() => {
    if (pbqData) {
      reset({
        classId: (pbqData as any).subject?.classSubjects?.[0]?.classId || "",
        subjectId: pbqData.subjectId,
        context: pbqData.context || "",
        questionA: pbqData.questionA,
        questionB: pbqData.questionB,
        questionC: pbqData.questionC,
        questionD: pbqData.questionD,
        questionE: pbqData.questionE,
        referenceText: pbqData.reference?.join(", ") || "",
        difficulty: pbqData.difficulty as any,
        isActive: pbqData.isActive,
        marksA: String((pbqData.marks as any)?.a ?? "2"),
        marksB: String((pbqData.marks as any)?.b ?? "2"),
        marksC: String((pbqData.marks as any)?.c ?? "2"),
        marksD: String((pbqData.marks as any)?.d ?? "2"),
        marksE: String((pbqData.marks as any)?.e ?? "2"),
      })
    }
  }, [pbqData, reset])

  const isSubmitting = updateMutation.isPending || isFormSubmitting || isPbqLoading

  const onSubmit = async (data: EditPbqFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const marksObj = {
        a: Number(data.marksA) || 2,
        b: Number(data.marksB) || 2,
        c: Number(data.marksC) || 2,
        d: Number(data.marksD) || 2,
        e: Number(data.marksE) || 2,
      }

      await updateMutation.mutateAsync({
        id: pbqId,
        subjectId: data.subjectId,
        context: data.context.trim(),
        questionA: data.questionA.trim(),
        questionB: data.questionB.trim(),
        questionC: data.questionC.trim(),
        questionD: data.questionD.trim(),
        questionE: data.questionE.trim(),
        difficulty: data.difficulty,
        reference: referenceArray,
        isActive: data.isActive,
        marks: marksObj,
      })

      toast.success("Passage-Based Question updated successfully.")
      setTimeout(() => {
        router.push("/pbqs")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to update Passage-Based Question"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isPbqLoading) {
    return (
      <div className="py-24 text-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
        <p className="mt-2 text-sm text-outline">Loading question details...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-24 text-center text-error">
        <span className="material-symbols-outlined text-4xl">error</span>
        <p className="mt-2 text-sm font-medium">Failed to load Passage-Based Question.</p>
        <Link href="/pbqs" className="text-primary hover:underline text-xs mt-3 block">Back to PBQs</Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/pbqs"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              PBQs
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Edit PBQ</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Edit Passage-Based Question
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Modify the existing passage stimulus, sub-questions ক through ঙ, mark configurations, or metadata.
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

      {/* Form Card */}
      <Card className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-outline-variant bg-white p-0 shadow-xs ring-0">
        <CardHeader className="border-b border-outline-variant/40 bg-surface-container-lowest p-4 sm:p-8 flex flex-row items-center gap-3 sm:gap-4">
          <div className="flex size-10 sm:size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <CardTitle className="font-headline-md text-base sm:text-[20px] font-extrabold text-on-surface normal-case tracking-normal">
              Question Specifications
            </CardTitle>
            <p className="text-[11px] sm:text-xs font-body-md text-on-surface-variant mt-0.5">
              Update class, passage context, sub-question stems, mark distribution, and reference settings
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Read-only Class & Subject Info */}
            <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 flex flex-col sm:flex-row gap-6 text-xs sm:text-sm text-on-surface-variant font-medium">
              <div className="flex-1">
                <span className="text-outline uppercase text-[10px] tracking-wider block font-bold mb-1">Academic Class</span>
                <span className="font-semibold text-on-surface text-sm">{(pbqData as any)?.academicClass?.nameEn || (pbqData as any)?.subject?.classSubjects?.[0]?.academicClass?.nameEn || "N/A"}</span>
              </div>
              <div className="flex-1">
                <span className="text-outline uppercase text-[10px] tracking-wider block font-bold mb-1">Subject</span>
                <span className="font-semibold text-on-surface text-sm">{(pbqData as any)?.subject?.nameEn || "N/A"}</span>
              </div>
            </div>

            {/* Stimulus Passage Text */}
            <div className="space-y-2 border-t border-outline-variant pt-6">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                উদ্দীপক / অনুচ্ছেদ (Passage Context) *
              </Label>
              <Textarea
                disabled={isSubmitting}
                rows={5}
                placeholder="Enter the reading passage context..."
                {...register("context")}
                className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-on-surface transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden text-sm"
              />
              {errors.context && (
                <p className="text-xs text-error">{errors.context.message}</p>
              )}
            </div>

            {/* 5 Sub-Questions Stems: A, B, C, D, E */}
            <div className="space-y-6 border-t border-outline-variant pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                Question Stems & Marks Configuration (5 Questions)
              </h3>

              <div className="space-y-4">
                {/* Question A */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  <div className="md:col-span-3 space-y-1.5">
                    <Label className="font-bold text-xs text-on-surface">ক. Question Stem (A) *</Label>
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. প্রথম প্রশ্ন..."
                      {...register("questionA")}
                      className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 h-auto"
                    />
                    {errors.questionA && <p className="text-xs text-error">{errors.questionA.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs text-on-surface-variant">Marks (A)</Label>
                    <Input
                      type="number"
                      disabled={isSubmitting}
                      {...register("marksA")}
                      className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 text-sm h-auto"
                    />
                  </div>
                </div>

                {/* Question B */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  <div className="md:col-span-3 space-y-1.5">
                    <Label className="font-bold text-xs text-on-surface">খ. Question Stem (B) *</Label>
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. দ্বিতীয় প্রশ্ন..."
                      {...register("questionB")}
                      className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 h-auto"
                    />
                    {errors.questionB && <p className="text-xs text-error">{errors.questionB.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs text-on-surface-variant">Marks (B)</Label>
                    <Input
                      type="number"
                      disabled={isSubmitting}
                      {...register("marksB")}
                      className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 text-sm h-auto"
                    />
                  </div>
                </div>

                {/* Question C */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  <div className="md:col-span-3 space-y-1.5">
                    <Label className="font-bold text-xs text-on-surface">গ. Question Stem (C) *</Label>
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. তৃতীয় প্রশ্ন..."
                      {...register("questionC")}
                      className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 h-auto"
                    />
                    {errors.questionC && <p className="text-xs text-error">{errors.questionC.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs text-on-surface-variant">Marks (C)</Label>
                    <Input
                      type="number"
                      disabled={isSubmitting}
                      {...register("marksC")}
                      className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 text-sm h-auto"
                    />
                  </div>
                </div>

                {/* Question D */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  <div className="md:col-span-3 space-y-1.5">
                    <Label className="font-bold text-xs text-on-surface">ঘ. Question Stem (D) *</Label>
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. চতুর্থ প্রশ্ন..."
                      {...register("questionD")}
                      className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 h-auto"
                    />
                    {errors.questionD && <p className="text-xs text-error">{errors.questionD.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs text-on-surface-variant">Marks (D)</Label>
                    <Input
                      type="number"
                      disabled={isSubmitting}
                      {...register("marksD")}
                      className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 text-sm h-auto"
                    />
                  </div>
                </div>

                {/* Question E */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  <div className="md:col-span-3 space-y-1.5">
                    <Label className="font-bold text-xs text-on-surface">ঙ. Question Stem (E) *</Label>
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. পঞ্চম প্রশ্ন..."
                      {...register("questionE")}
                      className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 h-auto"
                    />
                    {errors.questionE && <p className="text-xs text-error">{errors.questionE.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs text-on-surface-variant">Marks (E)</Label>
                    <Input
                      type="number"
                      disabled={isSubmitting}
                      {...register("marksE")}
                      className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 text-sm h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Reference & Metadata Settings */}
            <div className="space-y-6 border-t border-outline-variant pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                Enrichment & Context Settings
              </h3>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Difficulty */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Difficulty *
                  </Label>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <Select
                        disabled={isSubmitting}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:ring-2 focus:ring-primary/20 h-auto justify-between focus-visible:outline-hidden">
                          <SelectValue placeholder="Select Difficulty..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                          {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.difficulty && (
                    <p className="text-xs text-error">{errors.difficulty.message}</p>
                  )}
                </div>

                {/* References */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Reference Tags (Comma-separated)
                  </Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. NCTB Textbook Chapter 3, bangla-ref-01"
                    {...register("referenceText")}
                    className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>

                {/* Is Active State */}
                <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-4 md:col-span-2 mt-4">
                  <div>
                    <p className="font-label-sm text-sm font-bold text-on-surface">
                      Active Question State
                    </p>
                    <p className="font-body-md text-xs text-on-surface-variant">
                      Make this passage-based question live immediately in test modules and student practice assessments.
                    </p>
                  </div>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant/40 pt-6 sm:pt-8 mt-6">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">history</span>
                <span className="text-[12px]">Last updated {pbqData?.updatedAt ? new Date(pbqData.updatedAt).toLocaleDateString() : ""}</span>
              </div>
              <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => router.push("/pbqs")}
                  className="w-full sm:w-auto rounded-lg border border-outline px-6 sm:px-8 py-2.5 sm:py-3 font-bold !text-primary transition-all active:scale-95 hover:bg-surface-container-low hover:!text-primary cursor-pointer h-auto normal-case tracking-normal disabled:opacity-50 text-sm"
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
                  <span>{isSubmitting ? "Updating..." : "Update Passage-Based Question"}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

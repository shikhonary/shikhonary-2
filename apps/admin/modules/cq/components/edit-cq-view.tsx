"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useCqById, useUpdateCq, useSubjectsForSelection, useChaptersForSelection, useAcademicClassesForSelection } from "../services/use-cq"
import { useQuestionTypesList } from "@/modules/question-type/services/use-question-type"
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

const editCqFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().min(1, "Please select a chapter"),
  context: z.string().optional(),
  questionA: z.string().min(1, "Question A text is required"),
  questionB: z.string().min(1, "Question B text is required"),
  questionC: z.string().min(1, "Question C text is required"),
  questionD: z.string().optional(),
  answerA: z.string().optional(),
  answerB: z.string().optional(),
  answerC: z.string().optional(),
  answerD: z.string().optional(),
  explanation: z.string().optional(),
  referenceText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  year: z.string().optional(),
  source: z.string().optional(),
  questionTypeId: z.string().optional(),
  isActive: z.boolean(),
  marksA: z.string(),
  marksB: z.string(),
  marksC: z.string(),
  marksD: z.string(),
})

type EditCqFormData = z.infer<typeof editCqFormSchema>

export function EditCqView() {
  const router = useRouter()
  const params = useParams()
  const cqId = params.id as string

  const { data: cqData, isLoading: isCqLoading, isError } = useCqById(cqId)
  const updateMutation = useUpdateCq()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: questionTypesData } = useQuestionTypesList({ limit: 100 })
  const questionTypes = questionTypesData?.questionTypes ?? []

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditCqFormData>({
    resolver: zodResolver(editCqFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      context: "",
      questionA: "",
      questionB: "",
      questionC: "",
      questionD: "",
      answerA: "",
      answerB: "",
      answerC: "",
      answerD: "",
      explanation: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      year: "",
      source: "",
      questionTypeId: "",
      isActive: true,
      marksA: "1",
      marksB: "2",
      marksC: "3",
      marksD: "4",
    },
  })

  // Load existing data
  useEffect(() => {
    if (cqData) {
      reset({
        classId: cqData.classId,
        subjectId: cqData.subjectId,
        chapterId: cqData.chapterId,
        context: cqData.context || "",
        questionA: cqData.questionA,
        questionB: cqData.questionB,
        questionC: cqData.questionC,
        questionD: cqData.questionD || "",
        answerA: cqData.answer?.answerA || "",
        answerB: cqData.answer?.answerB || "",
        answerC: cqData.answer?.answerC || "",
        answerD: cqData.answer?.answerD || "",
        explanation: cqData.answer?.explanation || "",
        referenceText: cqData.reference?.join(", ") || "",
        difficulty: cqData.difficulty as any,
        year: cqData.year !== null ? String(cqData.year) : "",
        source: cqData.source || "",
        questionTypeId: cqData.questionTypeId || "",
        isActive: cqData.isActive,
        marksA: String((cqData.marks as any)?.a ?? "1"),
        marksB: String((cqData.marks as any)?.b ?? "2"),
        marksC: String((cqData.marks as any)?.c ?? "3"),
        marksD: String((cqData.marks as any)?.d ?? "4"),
      })
    }
  }, [cqData, reset])

  const selectedClassId = watch("classId")
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const selectedSubjectId = watch("subjectId")
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const isSubmitting = updateMutation.isPending || isFormSubmitting || isCqLoading

  const onSubmit = async (data: EditCqFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const parsedYear = data.year && !isNaN(Number(data.year)) ? Number(data.year) : null

      const marksObj = {
        a: Number(data.marksA) || 1,
        b: Number(data.marksB) || 2,
        c: Number(data.marksC) || 3,
        d: data.questionD ? (Number(data.marksD) || 4) : 0,
      }

      await updateMutation.mutateAsync({
        id: cqId,
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        context: data.context?.trim() || null,
        questionA: data.questionA.trim(),
        questionB: data.questionB.trim(),
        questionC: data.questionC.trim(),
        questionD: data.questionD?.trim() || null,
        difficulty: data.difficulty,
        year: parsedYear,
        source: data.source?.trim() || null,
        reference: referenceArray,
        questionTypeId: data.questionTypeId || null,
        isActive: data.isActive,
        marks: marksObj,
        answer: {
          answerA: data.answerA?.trim() || null,
          answerB: data.answerB?.trim() || null,
          answerC: data.answerC?.trim() || null,
          answerD: data.answerD?.trim() || null,
          explanation: data.explanation?.trim() || null,
        },
      })

      toast.success("Creative Question updated successfully.")
      setTimeout(() => {
        router.push("/cqs")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to update Creative Question"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isCqLoading) {
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
        <p className="mt-2 text-sm font-medium">Failed to load Creative Question.</p>
        <Link href="/cqs" className="text-primary hover:underline text-xs mt-3 block">Back to CQs</Link>
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
              href="/cqs"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              CQs
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Edit CQ</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Edit Creative Question
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Modify the existing creative question structure, sub-questions, answer schemes, or marks.
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
              Update classes, context, sub-question stems, answer sheets, and reference settings
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Read-only Class, Subject & Chapter Info */}
            <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 flex flex-col sm:flex-row gap-6 text-xs sm:text-sm text-on-surface-variant font-medium">
              <div className="flex-1">
                <span className="text-outline uppercase text-[10px] tracking-wider block font-bold mb-1">Academic Class</span>
                <span className="font-semibold text-on-surface text-sm">{(cqData as any)?.academicClass?.nameEn || "N/A"}</span>
              </div>
              <div className="flex-1">
                <span className="text-outline uppercase text-[10px] tracking-wider block font-bold mb-1">Subject</span>
                <span className="font-semibold text-on-surface text-sm">{(cqData as any)?.subject?.nameEn || "N/A"}</span>
              </div>
              <div className="flex-1">
                <span className="text-outline uppercase text-[10px] tracking-wider block font-bold mb-1">Chapter</span>
                <span className="font-semibold text-on-surface text-sm">{(cqData as any)?.chapter?.nameEn || "N/A"}</span>
              </div>
            </div>

            {/* Stimulus Passage Text */}
            <div className="space-y-2 border-t border-outline-variant pt-6">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Stimulus / Passage Context
              </Label>
              <Textarea
                disabled={isSubmitting}
                rows={4}
                placeholder="Enter the creative question stimulus text or context passage..."
                {...register("context")}
                className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-on-surface transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden text-sm"
              />
            </div>

            {/* Sub-Questions A, B, C, D Stems */}
            <div className="space-y-6 border-t border-outline-variant pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                Question Stems & Marks Configuration
              </h3>

              <div className="space-y-4">
                {/* Question A */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  <div className="md:col-span-3 space-y-1.5">
                    <Label className="font-bold text-xs text-on-surface">ক. Knowledge-based Question Stem (A) *</Label>
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. বল কাকে বলে? / What is Force?"
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
                    <Label className="font-bold text-xs text-on-surface">খ. Comprehension Question Stem (B) *</Label>
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. ওহমের সূত্রটি ব্যাখ্যা কর। / Explain Ohm's Law."
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
                    <Label className="font-bold text-xs text-on-surface">গ. Application Question Stem (C) *</Label>
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. উদ্দীপকের তথ্যের আলোকে ত্বরণ নির্ণয় কর। / Calculate acceleration from the stimulus."
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
                    <Label className="font-bold text-xs text-on-surface">ঘ. Higher Ability Question Stem (D) (Optional)</Label>
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. উদ্দীপকের শক্তির নিত্যতার সূত্রটি বজায় থাকে কিনা যুক্তিসহ আলোচনা কর।"
                      {...register("questionD")}
                      className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 h-auto"
                    />
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
              </div>
            </div>

            {/* Answer Solutions */}
            <div className="space-y-6 border-t border-outline-variant pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                Solutions / Ideal Answers (Optional)
              </h3>

              <div className="space-y-4">
                {/* Answer A */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-xs text-on-surface">উত্তর ক (Solution A)</Label>
                  <Textarea
                    disabled={isSubmitting}
                    rows={2}
                    placeholder="Enter model answer or marking scheme for Part A..."
                    {...register("answerA")}
                    className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>

                {/* Answer B */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-xs text-on-surface">উত্তর খ (Solution B)</Label>
                  <Textarea
                    disabled={isSubmitting}
                    rows={2}
                    placeholder="Enter model answer or marking scheme for Part B..."
                    {...register("answerB")}
                    className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>

                {/* Answer C */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-xs text-on-surface">উত্তর গ (Solution C)</Label>
                  <Textarea
                    disabled={isSubmitting}
                    rows={3}
                    placeholder="Enter model answer or marking scheme for Part C..."
                    {...register("answerC")}
                    className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>

                {/* Answer D */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-xs text-on-surface">উত্তর ঘ (Solution D)</Label>
                  <Textarea
                    disabled={isSubmitting}
                    rows={3}
                    placeholder="Enter model answer or marking scheme for Part D..."
                    {...register("answerD")}
                    className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>

                {/* Overall Explanation */}
                <div className="space-y-1.5 border-t border-outline-variant/30 pt-4">
                  <Label className="font-bold text-xs text-on-surface">উত্তর বিশ্লেষণ (Answer Explanation / Assessment Notes)</Label>
                  <Textarea
                    disabled={isSubmitting}
                    rows={3}
                    placeholder="Detailed explanation, formula steps, or scoring directives for assessors..."
                    {...register("explanation")}
                    className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
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

                {/* Question Type Template */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Question Type Template (Optional)
                  </Label>
                  <Controller
                    name="questionTypeId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        disabled={isSubmitting}
                        value={field.value || "none"}
                        onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                      >
                        <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:ring-2 focus:ring-primary/20 h-auto justify-between focus-visible:outline-hidden">
                          <SelectValue placeholder="Select Type Template..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64">
                          <SelectItem value="none">None</SelectItem>
                          {questionTypes.map((t: any) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.nameEn} ({t.label} - {t.mark} marks)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Source */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Source / Board (Optional)
                  </Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. Dhaka Board, Rajshahi Board"
                    {...register("source")}
                    className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Exam Year (Optional)
                  </Label>
                  <Input
                    type="number"
                    disabled={isSubmitting}
                    placeholder="e.g. 2024"
                    {...register("year")}
                    className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>

                {/* References */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Reference Tags (Comma-separated)
                  </Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. NCTB Textbook Chapter 2, physics-ref-09"
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
                      Make this creative question live immediately in test modules and student practice assessments.
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
                <span className="text-[12px]">Last updated {cqData?.updatedAt ? new Date(cqData.updatedAt).toLocaleDateString() : ""}</span>
              </div>
              <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => router.push("/cqs")}
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
                  <span>{isSubmitting ? "Updating..." : "Update Creative Question"}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

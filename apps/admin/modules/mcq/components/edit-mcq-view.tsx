"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useMcqById, useUpdateMcq } from "../services/use-mcq"
import { useQuestionTypesList } from "@/modules/question-type/services/use-question-type"
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
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"

const updateMcqFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().min(1, "Please select a chapter"),
  question: z.string().min(1, "Question text is required"),
  answer: z.string().min(1, "Correct answer is required"),
  options: z.array(z.object({ value: z.string().min(1, "Option text cannot be empty") })).min(2, "At least 2 options are required"),
  statements: z.array(z.object({ value: z.string() })).optional(),
  type: z.string().min(1, "Question type is required"),
  isMath: z.boolean(),
  referenceText: z.string().optional(),
  explanation: z.string().optional(),
  questionUrl: z.string().optional(),
  contextId: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  year: z.string().optional(),
  source: z.string().optional(),
  questionTypeId: z.string().optional(),
  isActive: z.boolean(),
})

type UpdateMcqFormData = z.infer<typeof updateMcqFormSchema>

interface EditMcqViewProps {
  id: string
}

export function EditMcqView({ id }: EditMcqViewProps) {
  const router = useRouter()
  const { data: mcq, isLoading, isError } = useMcqById(id)
  const updateMutation = useUpdateMcq()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: questionTypesData } = useQuestionTypesList({ limit: 100 })
  const questionTypes = questionTypesData?.items ?? []

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<UpdateMcqFormData>({
    resolver: zodResolver(updateMcqFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      question: "",
      answer: "",
      options: [
        { value: "" },
        { value: "" },
        { value: "" },
        { value: "" },
      ],
      statements: [],
      type: "SINGLE",
      isMath: false,
      referenceText: "",
      explanation: "",
      questionUrl: "",
      contextId: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      year: "",
      source: "",
      questionTypeId: "",
      isActive: true,
    },
  })

  useEffect(() => {
    if (mcq) {
      reset({
        classId: (mcq as any).classId || "",
        subjectId: mcq.subjectId,
        chapterId: mcq.chapterId,
        question: mcq.question,
        answer: mcq.answer,
        options: mcq.options.map((opt) => ({ value: opt })),
        statements: (mcq.statements || []).map((stmt) => ({ value: stmt })),
        type: mcq.type,
        isMath: mcq.isMath,
        referenceText: (mcq.reference || []).join(", "),
        explanation: mcq.explanation || "",
        questionUrl: mcq.questionUrl || "",
        contextId: mcq.contextId || "",
        difficulty: mcq.difficulty as any || QUESTION_DIFFICULTY.MEDIUM,
        year: mcq.year ? String(mcq.year) : "",
        source: mcq.source || "",
        questionTypeId: mcq.questionTypeId || "",
        isActive: mcq.isActive,
      })
    }
  }, [mcq, reset])

  const { fields: optionFields, append: appendOption, remove: removeOption } =
    useFieldArray({
      control,
      name: "options",
    })

  const { fields: statementFields, append: appendStatement, remove: removeStatement } =
    useFieldArray({
      control,
      name: "statements",
    })

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: UpdateMcqFormData) => {
    setErrorMessage(null)

    try {
      const optionsArray = data.options.map((o) => o.value.trim())
      const statementsArray = (data.statements || [])
        .map((s) => s.value.trim())
        .filter((s) => s.length > 0)
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const parsedYear = data.year && !isNaN(Number(data.year)) ? Number(data.year) : null

      await updateMutation.mutateAsync({
        id,
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        question: data.question.trim(),
        answer: data.answer.trim(),
        options: optionsArray,
        statements: statementsArray,
        type: data.type,
        isMath: data.isMath,
        reference: referenceArray,
        explanation: data.explanation?.trim() || null,
        questionUrl: data.questionUrl?.trim() || null,
        contextId: data.contextId?.trim() || null,
        difficulty: data.difficulty,
        year: parsedYear,
        source: data.source?.trim() || null,
        questionTypeId: data.questionTypeId || null,
        isActive: data.isActive,
      })

      toast.success("MCQ question updated successfully.")
      setTimeout(() => {
        router.push("/mcqs")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to update MCQ"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  const currentOptions = watch("options")

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
      </div>
    )
  }

  if (isError || !mcq) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-error/30 bg-error-container/20 p-6 text-center text-error">
        <span className="material-symbols-outlined text-4xl">error</span>
        <h3 className="mt-2 font-headline-md text-lg font-bold">MCQ Not Found</h3>
        <p className="mt-1 font-body-md text-sm">
          The requested MCQ record could not be loaded.
        </p>
        <Button
          asChild
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm text-white h-auto"
        >
          <Link href="/mcqs">Return to MCQ List</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-4 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/mcqs"
              className="font-label-sm hover:text-primary transition-colors cursor-pointer"
            >
              MCQs
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="font-label-sm font-bold text-primary">Edit MCQ</span>
          </nav>
          <h2 className="mb-2 font-headline-md text-3xl font-extrabold text-primary">
            Edit MCQ Question
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed">
            Update question stem, options, correct answer, and parameters.
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
        <CardHeader className="border-b border-outline-variant bg-surface-container-lowest p-8">
          <CardTitle className="font-headline-md text-[20px] font-semibold text-on-surface normal-case tracking-normal">
            Edit MCQ Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Read-only Class, Subject & Chapter Info */}
            <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 flex flex-col sm:flex-row gap-6 text-xs sm:text-sm text-on-surface-variant font-medium">
              <div className="flex-1">
                <span className="text-outline uppercase text-[10px] tracking-wider block font-bold mb-1">Academic Class</span>
                <span className="font-semibold text-on-surface text-sm">{(mcq as any)?.academicClass?.nameEn || "N/A"}</span>
              </div>
              <div className="flex-1">
                <span className="text-outline uppercase text-[10px] tracking-wider block font-bold mb-1">Subject</span>
                <span className="font-semibold text-on-surface text-sm">{(mcq as any)?.subject?.nameEn || "N/A"}</span>
              </div>
              <div className="flex-1">
                <span className="text-outline uppercase text-[10px] tracking-wider block font-bold mb-1">Chapter</span>
                <span className="font-semibold text-on-surface text-sm">{(mcq as any)?.chapter?.nameEn || "N/A"}</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Question Text *
              </Label>
              <Textarea
                disabled={isSubmitting}
                rows={3}
                placeholder="Enter the MCQ question stem..."
                {...register("question")}
                className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-on-surface transition-all focus:ring-2 focus:ring-primary/20"
              />
              {errors.question && (
                <p className="text-xs text-error">{errors.question.message}</p>
              )}
            </div>

            {/* Statements (Optional for combined questions) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Statements (Optional for Roman Numeral MCQ)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendStatement({ value: "" })}
                  className="text-xs font-semibold text-primary h-auto py-1 px-3"
                >
                  + Add Statement
                </Button>
              </div>

              {statementFields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-2">
                  <span className="font-label-sm text-xs font-bold text-outline w-6">
                    i{idx + 1}.
                  </span>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder={`Statement ${idx + 1}...`}
                    {...register(`statements.${idx}.value`)}
                    className="flex-1 rounded-lg border border-outline-variant bg-white p-2.5 font-body-md text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeStatement(idx)}
                    className="text-error p-1 h-auto cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </Button>
                </div>
              ))}
            </div>

            {/* Options List */}
            <div className="space-y-4 border-t border-outline-variant pt-6">
              <div className="flex items-center justify-between">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Answer Options *
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendOption({ value: "" })}
                  className="text-xs font-semibold text-primary h-auto py-1 px-3"
                >
                  + Add Option Choice
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {optionFields.map((field, idx) => {
                  const optionLabel = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"][idx] || String(idx + 1)
                  return (
                    <div key={field.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className={`text-xs font-bold text-on-surface ${/[\u0980-\u09FF]/.test(optionLabel) ? "font-solaiman" : ""}`}>
                          Option {optionLabel}
                        </Label>
                        {optionFields.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="text-xs text-error hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <Input
                        type="text"
                        disabled={isSubmitting}
                        placeholder={`Option ${optionLabel} text...`}
                        {...register(`options.${idx}.value`)}
                        className="w-full rounded-lg border border-outline-variant bg-white p-2.5 font-body-md text-sm"
                      />
                      {errors.options?.[idx]?.value && (
                        <p className="text-xs text-error">
                          {errors.options[idx]?.value?.message}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Correct Answer Choice & Question Type */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-outline-variant pt-6">
              {/* Correct Answer */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Correct Answer *
                </Label>
                <Controller
                  name="answer"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isSubmitting}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:ring-2 focus:ring-primary/20 h-auto justify-between">
                        <SelectValue placeholder="Select correct option/answer..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64">
                        {currentOptions.map((opt, idx) => {
                          const val = opt.value.trim()
                          const label = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"][idx] || String(idx + 1)
                          return (
                            <SelectItem
                              key={idx}
                              value={val || `Option ${label}`}
                            >
                              Option {label}: {val || "(Empty)"}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.answer && (
                  <p className="text-xs text-error">{errors.answer.message}</p>
                )}
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Question Type *
                </Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isSubmitting}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:ring-2 focus:ring-primary/20 h-auto justify-between">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                        <SelectItem value="SINGLE">SINGLE (Standard Multiple Choice)</SelectItem>
                        <SelectItem value="MULTIPLE">MULTIPLE (Multiple Correct Options)</SelectItem>
                        <SelectItem value="COMBINED">COMBINED (Polynomial / Roman Statements)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-xs text-error">{errors.type.message}</p>
                )}
              </div>
            </div>

            {/* Flags: Math & Active */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-outline-variant pt-6">
              {/* Is Math / LaTeX */}
              <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
                <div>
                  <p className="font-label-sm text-sm font-bold text-on-surface">
                    Math / LaTeX Formula
                  </p>
                  <p className="font-body-md text-xs text-on-surface-variant">
                    Enable LaTeX rendering for math formulas in question/options.
                  </p>
                </div>
                <Controller
                  name="isMath"
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

              {/* Is Active */}
              <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
                <div>
                  <p className="font-label-sm text-sm font-bold text-on-surface">
                    Active Question State
                  </p>
                  <p className="font-body-md text-xs text-on-surface-variant">
                    Make this question available immediately in exams & practice.
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

            {/* Explanation & References */}
            <div className="space-y-6 border-t border-outline-variant pt-6">
              {/* Explanation */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Answer Explanation / Solution
                </Label>
                <Textarea
                  disabled={isSubmitting}
                  rows={3}
                  placeholder="Detailed explanation of the correct solution..."
                  {...register("explanation")}
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-on-surface"
                />
              </div>

              {/* Reference Text */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Reference Sources (Comma-separated)
                </Label>
                <Input
                  type="text"
                  disabled={isSubmitting}
                  placeholder="e.g. Dhaka Board 2023, NCTB Textbook Page 42"
                  {...register("referenceText")}
                  className="w-full rounded-lg border border-outline-variant bg-white p-2.5 font-body-md text-sm"
                />
              </div>
            </div>

            {/* Enrichment & Academic Settings */}
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
                          {questionTypes.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.nameEn} ({t.label} - {t.mark} marks)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.questionTypeId && (
                    <p className="text-xs text-error">{errors.questionTypeId.message}</p>
                  )}
                </div>

                {/* Source */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Source / Board (Optional)
                  </Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. Dhaka Board, Cadet College"
                    {...register("source")}
                    className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                  {errors.source && (
                    <p className="text-xs text-error">{errors.source.message}</p>
                  )}
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
                  {errors.year && (
                    <p className="text-xs text-error">{errors.year.message}</p>
                  )}
                </div>

                {/* Stimulus Context ID */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Stimulus / Passage Context ID (Optional)
                  </Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="Enter context/passage identifier..."
                    {...register("contextId")}
                    className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                  {errors.contextId && (
                    <p className="text-xs text-error">{errors.contextId.message}</p>
                  )}
                </div>

                {/* Question Image URL */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Question Image URL (Optional)
                  </Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="https://..."
                    {...register("questionUrl")}
                    className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-outline-variant pt-6 sm:pt-8 mt-6">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">history</span>
                <span className="text-[12px]">Last edited: Just now by Admin</span>
              </div>
              <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => router.push("/mcqs")}
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
                  <span>{isSubmitting ? "Updating..." : "Update MCQ Question"}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

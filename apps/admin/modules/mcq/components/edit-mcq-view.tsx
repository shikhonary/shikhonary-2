"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useMcqById, useUpdateMcq } from "../services/use-mcq"
import { useSubjectsForSelection } from "@/modules/subject/services/use-subject"
import { useChaptersForSelection } from "@/modules/chapter/services/use-chapter"
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

const updateMcqFormSchema = z.object({
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
  context: z.string().optional(),
  contextUrl: z.string().optional(),
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

  const { data: subjects = [] } = useSubjectsForSelection()

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
      context: "",
      contextUrl: "",
      isActive: true,
    },
  })

  const selectedSubjectId = watch("subjectId")
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  useEffect(() => {
    if (mcq) {
      reset({
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
        context: mcq.context || "",
        contextUrl: mcq.contextUrl || "",
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
        context: data.context?.trim() || null,
        contextUrl: data.contextUrl?.trim() || null,
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
            {/* Subject & Chapter Selection */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Subject */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Subject *
                </Label>
                <Controller
                  name="subjectId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isSubmitting}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:ring-2 focus:ring-primary/20 h-auto justify-between">
                        <SelectValue placeholder="Select Subject..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64">
                        {subjects.map((sub) => (
                          <SelectItem
                            key={sub.id}
                            value={sub.id}
                            label={sub.name}
                          >
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subjectId && (
                  <p className="text-xs text-error">{errors.subjectId.message}</p>
                )}
              </div>

              {/* Chapter */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Chapter *
                </Label>
                <Controller
                  name="chapterId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isSubmitting || !selectedSubjectId}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:ring-2 focus:ring-primary/20 h-auto justify-between">
                        <SelectValue placeholder="Select Chapter..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64">
                        {chapters.map((ch) => (
                          <SelectItem
                            key={ch.id}
                            value={ch.id}
                            label={ch.name}
                          >
                            {ch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.chapterId && (
                  <p className="text-xs text-error">{errors.chapterId.message}</p>
                )}
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
                  const optionLabel = String.fromCharCode(65 + idx)
                  return (
                    <div key={field.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-on-surface">
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
                          const label = String.fromCharCode(65 + idx)
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

            {/* Stimulus Context & Image URLs */}
            <div className="space-y-6 border-t border-outline-variant pt-6">
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Stimulus / Passage Context
                </Label>
                <Textarea
                  disabled={isSubmitting}
                  rows={2}
                  placeholder="Optional passage or context text for comprehensive questions..."
                  {...register("context")}
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-on-surface"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Question Image URL
                  </Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="https://..."
                    {...register("questionUrl")}
                    className="w-full rounded-lg border border-outline-variant bg-white p-2.5 font-body-md text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Context Image URL
                  </Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="https://..."
                    {...register("contextUrl")}
                    className="w-full rounded-lg border border-outline-variant bg-white p-2.5 font-body-md text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-outline-variant pt-8 sm:flex-row">
              <div className="flex items-center space-x-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">history</span>
                <span className="text-[12px]">Last edited: Just now by Admin</span>
              </div>
              <div className="flex w-full items-center space-x-4 sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => router.push("/mcqs")}
                  className="flex-1 rounded-lg border border-outline px-8 py-3 font-bold text-primary transition-all hover:bg-surface-container-low sm:flex-none cursor-pointer h-auto text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-primary-container px-10 py-3 font-bold text-on-primary-container shadow-md transition-all hover:bg-primary hover:text-white disabled:opacity-50 sm:flex-none cursor-pointer h-auto text-sm"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">save</span>
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

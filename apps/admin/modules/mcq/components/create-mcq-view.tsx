"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useCreateMcq } from "../services/use-mcq"
import { useSubjectsForSelection } from "@/modules/subject/services/use-subject"
import { useChaptersForSelection } from "@/modules/chapter/services/use-chapter"
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

const createMcqFormSchema = z.object({
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

type CreateMcqFormData = z.infer<typeof createMcqFormSchema>

export function CreateMcqView() {
  const router = useRouter()
  const createMutation = useCreateMcq()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: subjects = [] } = useSubjectsForSelection()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateMcqFormData>({
    resolver: zodResolver(createMcqFormSchema),
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

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const onSubmit = async (data: CreateMcqFormData) => {
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

      await createMutation.mutateAsync({
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

      toast.success("MCQ question created successfully.")
      setTimeout(() => {
        router.push("/mcqs")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to create MCQ"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  const currentOptions = watch("options")

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/mcqs"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              MCQs
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Create New</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            New MCQ Question
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Add a new multiple-choice question to the question bank under a subject and chapter.
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
              Configure subject, chapter, question stem, options, correct answer, and explanation details
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Subject & Chapter Selection */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 h-auto justify-between focus-visible:outline-hidden">
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
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 h-auto justify-between focus-visible:outline-hidden">
                        <SelectValue
                          placeholder={
                            selectedSubjectId
                              ? "Select Chapter..."
                              : "Select a Subject first"
                          }
                        />
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
                className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-on-surface transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden"
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
                  className="text-xs font-semibold !text-primary h-auto py-1 px-3 border-outline hover:bg-surface-container-low hover:!text-primary"
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
                    className="flex-1 rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
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
                  className="text-xs font-semibold !text-primary h-auto py-1 px-3 border-outline hover:bg-surface-container-low hover:!text-primary"
                >
                  + Add Option Choice
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {optionFields.map((field, idx) => {
                  const optionLabel = String.fromCharCode(65 + idx) // A, B, C, D...
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
                        className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
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
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 border-t border-outline-variant pt-6">
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
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 h-auto justify-between focus-visible:outline-hidden">
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
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 h-auto justify-between focus-visible:outline-hidden">
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
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 border-t border-outline-variant pt-6">
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
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-on-surface transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden"
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
                  className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
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
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-on-surface transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Question Image URL
                  </Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="https://..."
                    {...register("questionUrl")}
                    className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
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
                    className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant/40 pt-6 sm:pt-8 mt-6">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">history</span>
                <span className="text-[12px]">New Record</span>
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
                  <span>{isSubmitting ? "Saving..." : "Save MCQ Question"}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

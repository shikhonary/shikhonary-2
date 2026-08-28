"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useCreateShortAnswer,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-short-answer"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Switch } from "@workspace/ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import { ChevronRightIcon } from "lucide-react"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"

const createShortAnswerFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().min(1, "Please select a chapter"),
  question: z.string().min(1, "Question text is required"),
  answer: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  referenceText: z.string().optional(),
  year: z.string().optional(),
  source: z.string().optional(),
  isActive: z.boolean(),
})

type CreateShortAnswerFormData = z.infer<typeof createShortAnswerFormSchema>

export function CreateShortAnswerView() {
  const router = useRouter()
  const createMutation = useCreateShortAnswer()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateShortAnswerFormData>({
    resolver: zodResolver(createShortAnswerFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      question: "",
      answer: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
      year: "",
      source: "",
      isActive: true,
    },
  })

  // Watch selectors for cascading lists
  const selectedClassId = watch("classId")
  const selectedSubjectId = watch("subjectId")

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const onSubmit = async (data: CreateShortAnswerFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const parsedYear = data.year && !isNaN(Number(data.year)) ? Number(data.year) : null

      await createMutation.mutateAsync({
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        question: data.question.trim(),
        answer: data.answer?.trim() || null,
        difficulty: data.difficulty,
        reference: referenceArray,
        year: parsedYear,
        source: data.source?.trim() || null,
        isActive: data.isActive,
        attachments: [],
      })

      toast.success("Short Answer question created successfully.")
      setTimeout(() => {
        router.push("/short-answers")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to create Short Answer"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Breadcrumbs & Title Header */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-4 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/short-answers"
              className="font-label-sm hover:text-primary transition-colors cursor-pointer text-xs"
            >
              Short Answers
            </Link>
            <ChevronRightIcon className="size-3 text-on-surface-variant/70" />
            <span className="font-label-sm font-bold text-primary text-xs">Create New</span>
          </nav>
          <h2 className="mb-2 font-headline-md text-3xl font-extrabold text-primary">
            Create Short Answer
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed text-sm">
            Add a new direct short answer question along with its solution keys and syllabus descriptors.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700 text-sm">
          <span className="material-symbols-outlined text-red-600">error</span>
          <span className="font-body-md font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Main Form Card */}
      <Card className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-outline-variant bg-white p-0 shadow-xs ring-0">
        <CardHeader className="border-b border-outline-variant bg-surface-container-lowest p-8">
          <CardTitle className="font-headline-md text-[20px] font-semibold text-on-surface normal-case tracking-normal">
            Short Answer Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Cascading selectors dropdown grid */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Academic Class */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Academic Class *
                </Label>
                <Controller
                  name="classId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isSubmitting}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("subjectId", "")
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 h-10 justify-between focus-visible:outline-hidden cursor-pointer text-sm">
                        <SelectValue placeholder="Select Class..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
                        {academicClasses.map((cls) => (
                          <SelectItem
                            key={cls.id}
                            value={cls.id}
                            className="text-neutral-900"
                          >
                            {cls.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.classId && (
                  <p className="text-xs text-error">{errors.classId.message}</p>
                )}
              </div>

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
                      disabled={isSubmitting || !selectedClassId}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 h-10 justify-between focus-visible:outline-hidden disabled:opacity-50 cursor-pointer text-sm">
                        <SelectValue placeholder={selectedClassId ? "Select Subject..." : "Select Class first"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
                        {subjects.map((sub) => (
                          <SelectItem
                            key={sub.id}
                            value={sub.id}
                            className="text-neutral-900"
                          >
                            {sub.nameEn}
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
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 h-10 justify-between focus-visible:outline-hidden disabled:opacity-50 cursor-pointer text-sm">
                        <SelectValue
                          placeholder={
                            selectedSubjectId
                              ? "Select Chapter..."
                              : "Select a Subject first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
                        {chapters.map((ch) => (
                          <SelectItem
                            key={ch.id}
                            value={ch.id}
                            className="text-neutral-900"
                          >
                            {ch.nameEn}
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
            <div className="space-y-2 border-t border-outline-variant/30 pt-6">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Question Stem *
              </Label>
              <Textarea
                disabled={isSubmitting}
                rows={4}
                placeholder="Enter the short answer question stem... (Supports LaTeX)"
                {...register("question")}
                className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm text-on-surface transition-all focus:ring-2 focus:ring-primary/20"
              />
              {errors.question && (
                <p className="text-xs text-error">{errors.question.message}</p>
              )}
            </div>

            {/* Answer Text */}
            <div className="space-y-2">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Model Answer / Grading Guide (Optional)
              </Label>
              <Textarea
                disabled={isSubmitting}
                rows={5}
                placeholder="Enter the correct answer or grading key... (Supports LaTeX)"
                {...register("answer")}
                className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm text-on-surface transition-all focus:ring-2 focus:ring-primary/20"
              />
              {errors.answer && (
                <p className="text-xs text-error">{errors.answer.message}</p>
              )}
            </div>

            {/* Difficulty, Source, Year & References Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-outline-variant/30 pt-6">
              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Difficulty Level
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
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface h-10 justify-between focus-visible:outline-hidden cursor-pointer text-sm">
                        <SelectValue placeholder="Select Difficulty..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
                        {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="text-neutral-900"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Textbook References */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  References (Comma-separated)
                </Label>
                <Input
                  disabled={isSubmitting}
                  type="text"
                  placeholder="e.g. NCERT Ch3, Panjeree 2024"
                  {...register("referenceText")}
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm text-on-surface h-10"
                />
              </div>

              {/* Exam Source */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Exam Source / Board
                </Label>
                <Input
                  disabled={isSubmitting}
                  type="text"
                  placeholder="e.g. Dhaka Board, Cadet College Exam"
                  {...register("source")}
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm text-on-surface h-10"
                />
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Exam Year
                </Label>
                <Input
                  disabled={isSubmitting}
                  type="text"
                  placeholder="e.g. 2024"
                  {...register("year")}
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm text-on-surface h-10"
                />
                {errors.year && (
                  <p className="text-xs text-error">{errors.year.message}</p>
                )}
              </div>
            </div>

            {/* Active Visibility Toggler */}
            <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-low/30 p-5">
              <div>
                <Label className="block font-headline text-sm font-bold text-on-surface">
                  Publish to Question Bank
                </Label>
                <span className="font-body text-xs text-on-surface-variant leading-relaxed block mt-0.5">
                  If active, this question will immediately be searchable and usable in tests.
                </span>
              </div>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  />
                )}
              />
            </div>

            {/* Actions Form Footer */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-end border-t border-outline-variant pt-6">
              <Button
                asChild
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-lg border border-outline px-6 py-2.5 text-sm font-bold text-primary bg-white hover:bg-surface-container-low cursor-pointer h-auto justify-center"
              >
                <Link href="/short-answers">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary/95 disabled:opacity-50 cursor-pointer h-auto"
              >
                {isSubmitting && (
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                )}
                <span>{isSubmitting ? "Saving..." : "Create Question"}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

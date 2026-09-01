"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useCreateCs, useSubjectsForSelection, useChaptersForSelection, useAcademicClassesForSelection } from "../services/use-cs"
import { useQuestionTypesList } from "@/modules/question-type/services/use-question-type"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { HelpCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"

const createCsFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().min(1, "Please select a chapter"),
  questionA: z.string().min(1, "Question A text is required"),
  questionB: z.string().min(1, "Question B text is required"),
  referenceText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  questionTypeId: z.string().optional(),
  isActive: z.boolean(),
})

type CreateCsFormData = z.infer<typeof createCsFormSchema>

export function CreateCsView() {
  const router = useRouter()
  const createMutation = useCreateCs()
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
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateCsFormData>({
    resolver: zodResolver(createCsFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      questionA: "",
      questionB: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      questionTypeId: "",
      isActive: true,
    },
  })

  const selectedClassId = watch("classId")
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const selectedSubjectId = watch("subjectId")
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const onSubmit = async (data: CreateCsFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      await createMutation.mutateAsync({
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        questionA: data.questionA.trim(),
        questionB: data.questionB.trim(),
        difficulty: data.difficulty,
        reference: referenceArray,
        questionTypeId: data.questionTypeId || null,
        isActive: data.isActive,
      })

      toast.success("Creative Scenario Question created successfully.")
      setTimeout(() => {
        router.push("/cs")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to create Creative Scenario Question"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-12">
      {/* Header Section */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/cs"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              CS
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Create New</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            New Creative Scenario Question
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Add a new multi-part Creative Scenario (CS) question to the bank, defining sub-questions A & B, difficulty level, and reference tags.
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
              Configure academic properties, write sub-questions A & B, references, and difficulty level
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Academic Class, Subject & Chapter Selection */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Class */}
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
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 h-auto justify-between focus-visible:outline-hidden">
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
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 h-auto justify-between focus-visible:outline-hidden disabled:opacity-50">
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
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 h-auto justify-between focus-visible:outline-hidden disabled:opacity-50">
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

            {/* Sub-Questions A & B Stems */}
            <div className="space-y-6 border-t border-outline-variant pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                Sub-Questions Stems Configuration
              </h3>

              <div className="space-y-4">
                {/* Question A */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-xs text-on-surface">ক. Sub-question A Stem (ক) *</Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. বল কাকে বলে? / What is Force?"
                    {...register("questionA")}
                    className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 h-auto"
                  />
                  {errors.questionA && <p className="text-xs text-error">{errors.questionA.message}</p>}
                </div>

                {/* Question B */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-xs text-on-surface">খ. Sub-question B Stem (খ) *</Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. নিউটনের গতিবিদ্যার ২য় সূত্রটি ব্যাখ্যা কর।"
                    {...register("questionB")}
                    className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm transition-all focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 h-auto"
                  />
                  {errors.questionB && <p className="text-xs text-error">{errors.questionB.message}</p>}
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
                          <SelectItem value="none">Auto-resolve default CS</SelectItem>
                          {questionTypes.map((t: any) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.nameEn} ({t.label})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
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
                    placeholder="e.g. NCTB Textbook Chapter 2, Board 2024"
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
                      Make this creative scenario question live immediately in test modules and student practice assessments.
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
                <span className="text-[12px]">New Record</span>
              </div>
              <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => router.push("/cs")}
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
                  <span>{isSubmitting ? "Saving..." : "Save CS Question"}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

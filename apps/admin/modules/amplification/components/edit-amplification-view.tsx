"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useUpdateAmplification, useAmplificationById } from "../services/use-amplification"
import { useSubjectsForSelection, useChaptersForSelection, useAcademicClassesForSelection } from "../../paragraph/services/use-paragraph"
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

const editAmplificationFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().optional(),
  title: z.string().min(1, "Amplification thought/proverb is required"),
  referenceText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Popularity count must be a number",
  }),
})

type EditAmplificationFormData = z.infer<typeof editAmplificationFormSchema>

export function EditAmplificationView() {
  const router = useRouter()
  const params = useParams()
  const amplificationId = params.id as string

  const { data: amplificationData, isLoading: isAmplificationLoading, isError } = useAmplificationById(amplificationId)
  const updateMutation = useUpdateAmplification()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditAmplificationFormData>({
    resolver: zodResolver(editAmplificationFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      title: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
    },
  })

  // Load existing data
  useEffect(() => {
    if (amplificationData) {
      reset({
        classId: (amplificationData as any).subject?.classSubjects?.[0]?.classId || "",
        subjectId: amplificationData.subjectId,
        chapterId: amplificationData.chapterId || "",
        title: amplificationData.title,
        referenceText: amplificationData.reference?.join(", ") || "",
        difficulty: amplificationData.difficulty as any,
        popularityCount: String(amplificationData.popularityCount),
      })
    }
  }, [amplificationData, reset])

  const selectedClassId = watch("classId")
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const selectedSubjectId = watch("subjectId")
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: EditAmplificationFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      await updateMutation.mutateAsync({
        id: amplificationId,
        subjectId: data.subjectId,
        chapterId: data.chapterId || null,
        title: data.title.trim(),
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
        reference: referenceArray,
      })

      toast.success("Amplification updated successfully.")
      setTimeout(() => {
        router.push("/amplifications")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to update Amplification"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isAmplificationLoading) {
    return (
      <div className="py-16 text-center text-on-surface-variant">
        <span className="animate-spin text-primary block font-bold mb-2">Loading...</span>
        <span className="font-body-md text-sm font-medium">Loading Amplification data...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-16 text-center text-error border border-error/20 bg-error-container/10 rounded-2xl">
        <p className="font-bold">Error Loading Amplification</p>
        <p className="text-xs text-outline mt-1">Please verify the URL or try reloading.</p>
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
              href="/amplifications"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Amplifications
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Edit Amplification</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Edit Amplification
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Modify the amplification thought, class/subject assignments, references, and configuration parameters.
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
              Edit Amplification Specifications
            </CardTitle>
            <p className="text-[11px] sm:text-xs font-body-md text-on-surface-variant mt-0.5">
              Change academic parameters, adjust the thought quotation, and update tags.
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
                            label={cls.nameEn}
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
                            label={sub.nameEn}
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
                  Chapter (Optional)
                </Label>
                <Controller
                  name="chapterId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isSubmitting || !selectedSubjectId}
                      value={field.value || "none"}
                      onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 h-auto justify-between focus-visible:outline-hidden disabled:opacity-50">
                        <SelectValue placeholder={selectedSubjectId ? "Select Chapter..." : "Select Subject first"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
                        <SelectItem value="none" className="text-neutral-900">None / Optional</SelectItem>
                        {chapters.map((ch) => (
                          <SelectItem
                            key={ch.id}
                            value={ch.id}
                            label={ch.nameEn}
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

            {/* Amplification Proverb Text Content */}
            <div className="space-y-2">
              <Label htmlFor="title" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Amplification Thought / Proverb *
              </Label>
              <Textarea
                id="title"
                disabled={isSubmitting}
                placeholder="Enter quotation or proverb thought..."
                {...register("title")}
                rows={4}
                className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm text-on-surface outline-hidden focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
              {errors.title && (
                <p className="text-xs text-error">{errors.title.message}</p>
              )}
            </div>

            {/* Question Configuration (Difficulty & Popularity) */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Difficulty Level *
                </Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isSubmitting}
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-primary/20 h-auto justify-between focus-visible:outline-hidden">
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

              {/* Popularity Count */}
              <div className="space-y-2">
                <Label htmlFor="popularityCount" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Popularity Count
                </Label>
                <Input
                  id="popularityCount"
                  type="number"
                  disabled={isSubmitting}
                  placeholder="0"
                  {...register("popularityCount")}
                  className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm text-on-surface outline-hidden focus:ring-2 focus:ring-primary/20 disabled:opacity-50 h-auto focus-visible:ring-primary/20 focus-visible:outline-hidden"
                />
                {errors.popularityCount && (
                  <p className="text-xs text-error">{errors.popularityCount.message}</p>
                )}
              </div>
            </div>

            {/* References (Tags) */}
            <div className="space-y-2">
              <Label htmlFor="referenceText" className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                References / Tags
              </Label>
              <Input
                id="referenceText"
                type="text"
                disabled={isSubmitting}
                placeholder="Comma-separated references..."
                {...register("referenceText")}
                className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 font-body-md text-sm text-on-surface outline-hidden focus:ring-2 focus:ring-primary/20 disabled:opacity-50 h-auto focus-visible:ring-primary/20 focus-visible:outline-hidden"
              />
              <p className="text-[11px] text-outline font-medium">
                Tip: Press comma (,) between values to tag multiple references.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 border-t border-outline-variant/30 pt-6">
              <Button
                asChild
                variant="outline"
                disabled={isSubmitting}
                className="rounded-lg border border-outline-variant px-5 py-2.5 text-xs font-semibold hover:bg-surface-container-high h-10 normal-case tracking-normal cursor-pointer"
              >
                <Link href="/amplifications">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-white hover:bg-primary-container hover:text-on-primary-container transition-all h-10 normal-case tracking-normal cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Update Amplification"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

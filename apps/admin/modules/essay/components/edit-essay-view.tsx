"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useEssayById, useUpdateEssay, useSubjectsForSelection, useAcademicClassesForSelection } from "../services/use-essay"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { ScrollText, ArrowLeft, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"

const editEssayFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  title: z.string().min(1, "Essay topic / title prompt is required"),
  referenceText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Popularity count must be a number",
  }),
})

type EditEssayFormData = z.infer<typeof editEssayFormSchema>

export function EditEssayView() {
  const router = useRouter()
  const params = useParams()
  const essayId = params.id as string

  const { data: essayData, isLoading: isEssayLoading, isError } = useEssayById(essayId)
  const updateMutation = useUpdateEssay()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditEssayFormData>({
    resolver: zodResolver(editEssayFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      title: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
    },
  })

  // Load existing data
  useEffect(() => {
    if (essayData) {
      reset({
        classId: (essayData as any).subject?.classSubjects?.[0]?.classId || "",
        subjectId: essayData.subjectId,
        title: essayData.title,
        referenceText: essayData.reference?.join(", ") || "",
        difficulty: essayData.difficulty as any,
        popularityCount: String(essayData.popularityCount),
      })
    }
  }, [essayData, reset])

  const selectedClassId = watch("classId")
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: EditEssayFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      await updateMutation.mutateAsync({
        id: essayId,
        subjectId: data.subjectId,
        title: data.title.trim(),
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
        reference: referenceArray,
      })

      toast.success("Essay updated successfully.")
      setTimeout(() => {
        router.push("/essays")
      }, 500)
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update Essay")
      toast.error(err.message || "Failed to update Essay")
    }
  }

  if (isEssayLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 pb-12">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-container-high" />
        <div className="h-96 w-full animate-pulse rounded-2xl bg-surface-container-low" />
      </div>
    )
  }

  if (isError || !essayData) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center">
        <div className="rounded-2xl border border-dashed border-error/40 bg-error/5 p-12">
          <h2 className="font-headline-md text-xl font-bold text-error">
            Essay Not Found
          </h2>
          <p className="mt-1 font-body-md text-sm text-outline">
            The essay prompt you are trying to edit does not exist or has been removed.
          </p>
          <div className="mt-6">
            <Button asChild className="rounded-xl font-bold bg-primary text-white">
              <Link href="/essays">Back to Essays</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Top Breadcrumb / Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/essays"
            className="inline-flex items-center gap-1.5 font-label-md text-xs font-semibold text-outline hover:text-primary transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Essays</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ScrollText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-headline-md text-xl sm:text-2xl font-extrabold text-on-surface">
                Edit Essay
              </h1>
              <p className="font-body-md text-xs text-on-surface-variant">
                ID: <span className="font-mono text-[11px] text-outline">{essayId}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-sm font-semibold text-error">
          {errorMessage}
        </div>
      )}

      {/* Main Form Card */}
      <Card className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
        <CardHeader className="border-b border-outline-variant/30 pb-4">
          <CardTitle className="font-headline-sm text-base font-bold text-on-surface">
            Essay Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Academic Class & Subject Cascading Selectors */}
            <div className="space-y-4">
              <h3 className="font-headline-sm text-sm font-bold uppercase tracking-wider text-outline">
                Academic Association
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Academic Class */}
                <div className="space-y-2">
                  <Label htmlFor="classId" className="text-sm font-bold text-on-surface">
                    Academic Class <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="classId"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto">
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
                          {academicClasses.map((c) => (
                            <SelectItem key={c.id} value={c.id} className="text-neutral-900">
                              {c.nameEn} {c.nameBn ? `(${c.nameBn})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.classId && (
                    <p className="text-xs font-semibold text-red-500">{errors.classId.message}</p>
                  )}
                </div>

                {/* Academic Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subjectId" className="text-sm font-bold text-on-surface">
                    Academic Subject <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="subjectId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedClassId}
                      >
                        <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto disabled:opacity-50">
                          <SelectValue placeholder={selectedClassId ? "Select Subject" : "Choose class first"} />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
                          {subjects.map((s) => (
                            <SelectItem key={s.id} value={s.id} className="text-neutral-900">
                              {s.nameEn} {s.nameBn ? `(${s.nameBn})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.subjectId && (
                    <p className="text-xs font-semibold text-red-500">{errors.subjectId.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Essay Prompt / Topic Statement */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-bold text-on-surface">
                Essay Topic / Title Prompt <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="title"
                rows={5}
                placeholder="e.g. দৈনন্দিন জীবনে বিজ্ঞান অথবা তথ্যপ্রযুক্তি ও বাংলাদেশ বিষয়ে একটি নাতিদীর্ঘ প্রবন্ধ রচনা করো।"
                {...register("title")}
                className="w-full rounded-xl border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              {errors.title && (
                <p className="text-xs font-semibold text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Reference Tags & Metadata */}
            <div className="space-y-4">
              <h3 className="font-headline-sm text-sm font-bold uppercase tracking-wider text-outline">
                Metadata & Classification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Reference Citations */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="referenceText" className="text-sm font-bold text-on-surface">
                    Reference Tags / Exam Citations
                  </Label>
                  <Input
                    id="referenceText"
                    placeholder="e.g. Dhaka Board 2024, Rajshahi Board 2023, SSC 2022"
                    {...register("referenceText")}
                    className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 h-auto"
                  />
                  <p className="text-xs text-outline">
                    Separate multiple citations with commas.
                  </p>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm font-bold text-on-surface">
                    Difficulty Level
                  </Label>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto">
                          <SelectValue placeholder="Difficulty" />
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
                    <p className="text-xs font-semibold text-red-500">{errors.difficulty.message}</p>
                  )}
                </div>
              </div>

              {/* Popularity Count */}
              <div className="w-full sm:w-1/3 space-y-2">
                <Label htmlFor="popularityCount" className="text-sm font-bold text-on-surface">
                  Popularity / Views
                </Label>
                <Input
                  id="popularityCount"
                  type="number"
                  min="0"
                  {...register("popularityCount")}
                  className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 h-auto"
                />
                {errors.popularityCount && (
                  <p className="text-xs font-semibold text-red-500">{errors.popularityCount.message}</p>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-outline-variant/30 pt-6">
              <Button
                type="button"
                variant="outline"
                asChild
                className="rounded-xl border-outline-variant font-bold text-on-surface hover:bg-surface-container-high px-5 h-11 cursor-pointer"
              >
                <Link href="/essays">Cancel</Link>
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-6 h-11 gap-2 shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Update Essay</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

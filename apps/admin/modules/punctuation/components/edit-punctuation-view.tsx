"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  usePunctuationById,
  useUpdatePunctuation,
  useSubjectsForSelection,
  useAcademicClassesForSelection,
} from "../services/use-punctuation"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Quote, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"

const editPunctuationFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  content: z.string().min(1, "Question text/passage is required"),
  referenceText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Popularity count must be a number",
  }),
})

type EditPunctuationFormData = z.infer<typeof editPunctuationFormSchema>

export function EditPunctuationView({ id: propId }: { id?: string } = {}) {
  const router = useRouter()
  const params = useParams()
  const id = propId || (params?.id as string)
  const { data: item, isLoading, isError } = usePunctuationById(id)
  const updateMutation = useUpdatePunctuation()
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
  } = useForm<EditPunctuationFormData>({
    resolver: zodResolver(editPunctuationFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      content: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
    },
  })

  useEffect(() => {
    if (item && typeof item === "object") {
      const p = item as any
      const classId = p.subject?.classSubjects?.[0]?.classId || ""
      reset({
        classId,
        subjectId: p.subjectId || "",
        content: p.content || "",
        referenceText: Array.isArray(p.reference) ? p.reference.join(", ") : "",
        difficulty: (p.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
        popularityCount: String(p.popularityCount || 0),
      })
    }
  }, [item, reset])

  const selectedClassId = watch("classId")
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const contentValue = watch("content")

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: EditPunctuationFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      await updateMutation.mutateAsync({
        id,
        subjectId: data.subjectId,
        content: data.content.trim(),
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
        reference: referenceArray,
      })

      toast.success("Punctuation question updated successfully.")
      setTimeout(() => {
        router.push("/punctuation")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to update Punctuation question"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="font-body-md text-sm font-medium text-on-surface-variant">
            Loading Punctuation question data...
          </p>
        </div>
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="py-24 text-center">
        <div className="flex flex-col items-center justify-center gap-3 text-error">
          <Quote className="h-10 w-10" />
          <h3 className="font-headline-md text-xl font-bold text-on-surface">Question Not Found</h3>
          <p className="font-body-md text-sm text-outline">
            The requested punctuation question does not exist or has been removed.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/punctuation">Back to List</Link>
          </Button>
        </div>
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
              href="/punctuation"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Punctuation & Capitalization
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Edit Question</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary flex items-center gap-2">
            <Quote className="h-7 w-7" />
            Edit Punctuation Question
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Update passage content, academic level, and board references.
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
            <Quote className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <CardTitle className="font-headline-md text-base sm:text-[20px] font-extrabold text-on-surface normal-case tracking-normal">
              Edit Question Specifications
            </CardTitle>
            <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
              Make changes and save updates to this question record.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Academic Class & Subject Selects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Class Select */}
              <div className="space-y-2">
                <Label htmlFor="classId" className="font-label-lg text-sm font-bold text-on-surface">
                  Academic Class <span className="text-error">*</span>
                </Label>
                <Controller
                  name="classId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("subjectId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
                        {academicClasses.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id} className="text-neutral-900">
                            {cls.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.classId && (
                  <p className="font-body-sm text-xs text-error">{errors.classId.message}</p>
                )}
              </div>

              {/* Subject Select */}
              <div className="space-y-2">
                <Label htmlFor="subjectId" className="font-label-lg text-sm font-bold text-on-surface">
                  Subject <span className="text-error">*</span>
                </Label>
                <Controller
                  name="subjectId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                      }}
                      disabled={!selectedClassId}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between disabled:opacity-50">
                        <SelectValue placeholder={!selectedClassId ? "Select Class First" : "Select Subject"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
                        {subjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id} className="text-neutral-900">
                            {sub.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subjectId && (
                  <p className="font-body-sm text-xs text-error">{errors.subjectId.message}</p>
                )}
              </div>
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <Label htmlFor="content-textarea-edit" className="font-label-lg text-sm font-bold text-on-surface">
                Question Text / Passage <span className="text-error">*</span>
              </Label>
              <Textarea
                id="content-textarea-edit"
                rows={6}
                placeholder="e.g. Use capitals and punctuation marks where necessary in the following text:&#10;my dear brother I received your letter yesterday you have asked me to write about..."
                className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 leading-relaxed"
                {...register("content")}
              />
              {errors.content && (
                <p className="font-body-sm text-xs text-error">{errors.content.message}</p>
              )}

              {/* Live Preview Box */}
              {contentValue.trim() && (
                <div className="mt-3 rounded-lg border border-outline-variant/40 bg-surface-container-low p-3.5 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-outline">
                    Live Preview:
                  </p>
                  <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">
                    {contentValue}
                  </p>
                </div>
              )}
            </div>

            {/* Difficulty & Popularity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficulty" className="font-label-lg text-sm font-bold text-on-surface">
                  Difficulty Level
                </Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
                        <SelectValue placeholder="Select Difficulty" />
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
              </div>

              {/* Popularity Count */}
              <div className="space-y-2">
                <Label htmlFor="popularityCount" className="font-label-lg text-sm font-bold text-on-surface">
                  Popularity Count
                </Label>
                <Input
                  id="popularityCount"
                  type="number"
                  placeholder="0"
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
                  {...register("popularityCount")}
                />
              </div>
            </div>

            {/* Reference Tags */}
            <div className="space-y-2">
              <Label htmlFor="referenceText" className="font-label-lg text-sm font-bold text-on-surface">
                References / Board Info <span className="text-xs font-normal text-outline">(Comma-separated)</span>
              </Label>
              <Input
                id="referenceText"
                placeholder="e.g. Dhaka Board 2024, Rajshahi Board 2023"
                className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
                {...register("referenceText")}
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-outline-variant/40 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                asChild
                className="rounded-xl border-outline-variant px-6 py-2.5 text-sm font-bold cursor-pointer"
              >
                <Link href="/punctuation">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary text-white hover:bg-primary/90 px-6 py-2.5 text-sm font-bold shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

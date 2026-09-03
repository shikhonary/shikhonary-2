"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useCreateLetter, useSubjectsForSelection, useAcademicClassesForSelection } from "../services/use-letter"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Mail, ArrowLeft, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"

const createLetterFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  title: z.string().min(1, "Letter title/topic is required"),
  referenceText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Popularity count must be a number",
  }),
})

type CreateLetterFormData = z.infer<typeof createLetterFormSchema>

export function CreateLetterView() {
  const router = useRouter()
  const createMutation = useCreateLetter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateLetterFormData>({
    resolver: zodResolver(createLetterFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      title: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
    },
  })

  const selectedClassId = watch("classId")
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const onSubmit = async (data: CreateLetterFormData) => {
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
        title: data.title.trim(),
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
        reference: referenceArray,
      })

      toast.success("Letter created successfully.")
      setTimeout(() => {
        router.push("/letters")
      }, 500)
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create Letter")
      toast.error(err.message || "Failed to create Letter")
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-on-surface-variant hover:text-on-surface gap-1.5"
        >
          <Link href="/letters">
            <ArrowLeft className="size-4" />
            <span>Back to Letters</span>
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm overflow-hidden">
        <CardHeader className="bg-surface-container-low/50 border-b border-outline-variant/30 p-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Mail className="size-5" />
            </div>
            <div>
              <CardTitle className="font-headline-md text-xl font-bold text-on-surface">
                Create New Letter
              </CardTitle>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Add a new letter or application prompt with reference citations and difficulty level.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Academic Classification */}
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
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val)
                          setValue("subjectId", "")
                        }}
                      >
                        <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto">
                          <SelectValue placeholder="Select Academic Class" />
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
                        <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto disabled:opacity-50 disabled:cursor-not-allowed">
                          <SelectValue placeholder={selectedClassId ? "Select Subject" : "Select Class First"} />
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

            {/* Letter Title/Prompt */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-bold text-on-surface">
                Letter Topic / Prompt / Title <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="title"
                rows={4}
                placeholder="e.g., Write an application to the Headmaster of your school requesting a testimonial, or Write a letter to your friend describing a study tour."
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
                  Initial Popularity / Views
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

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
              <Button
                asChild
                type="button"
                variant="outline"
                className="rounded-xl border-outline-variant font-bold text-on-surface hover:bg-surface-container-high px-5 h-11"
              >
                <Link href="/letters">Cancel</Link>
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-6 h-11 gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Creating Letter...</span>
                  </>
                ) : (
                  <span>Create Letter</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

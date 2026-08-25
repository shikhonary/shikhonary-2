"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { HelpCircle, Loader2, Save, Award, Hash, Tag } from "lucide-react"

import { useUpdateQuestionType, useQuestionTypeById } from "../services/use-question-type"

const editQuestionTypeFormSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameBn: z.string().min(1, "Bangla name is required"),
  label: z.string().min(1, "Label is required"),
  mark: z.coerce.number().min(0, "Mark must be at least 0"),
  position: z.coerce.number().int().min(0, "Position must be at least 0"),
  descriptionEn: z.string().optional().or(z.literal("")),
  descriptionBn: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
})

type EditQuestionTypeFormData = z.infer<typeof editQuestionTypeFormSchema>

interface EditQuestionTypeViewProps {
  questionTypeId: string
}

export function EditQuestionTypeView({ questionTypeId }: EditQuestionTypeViewProps) {
  const { data: questionType, isLoading: isQuestionLoading, isError } = useQuestionTypeById(questionTypeId)

  if (isQuestionLoading) {
    return (
      <div className="flex items-center justify-center p-24 text-on-surface-variant">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 font-body-md text-base">Loading question type details...</span>
      </div>
    )
  }

  if (isError || !questionType) {
    return (
      <div className="p-8 text-center text-error max-w-md mx-auto">
        <p className="font-body-md font-medium">Failed to load question type details.</p>
        <Link href="/question-types">
          <Button className="mt-4">Back to List</Button>
        </Link>
      </div>
    )
  }

  return (
    <EditQuestionTypeForm
      questionType={questionType}
      questionTypeId={questionTypeId}
    />
  )
}

interface EditQuestionTypeFormProps {
  questionType: any
  questionTypeId: string
}

function EditQuestionTypeForm({ questionType, questionTypeId }: EditQuestionTypeFormProps) {
  const router = useRouter()
  const updateMutation = useUpdateQuestionType()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditQuestionTypeFormData>({
    resolver: zodResolver(editQuestionTypeFormSchema),
    defaultValues: {
      nameEn: questionType.nameEn,
      nameBn: questionType.nameBn,
      label: questionType.label,
      mark: questionType.mark,
      position: questionType.position,
      descriptionEn: questionType.descriptionEn ?? "",
      descriptionBn: questionType.descriptionBn ?? "",
      isActive: questionType.isActive,
    },
  })

  // Synchronize values if questionType changes (e.g. on refetch)
  useEffect(() => {
    if (questionType) {
      reset({
        nameEn: questionType.nameEn,
        nameBn: questionType.nameBn,
        label: questionType.label,
        mark: questionType.mark,
        position: questionType.position,
        descriptionEn: questionType.descriptionEn ?? "",
        descriptionBn: questionType.descriptionBn ?? "",
        isActive: questionType.isActive,
      })
    }
  }, [questionType, reset])

  const isActive = watch("isActive")
  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: EditQuestionTypeFormData) => {
    setErrorMessage(null)

    try {
      await updateMutation.mutateAsync({
        id: questionTypeId,
        ...data,
        descriptionEn: data.descriptionEn?.trim() || null,
        descriptionBn: data.descriptionBn?.trim() || null,
      })

      toast.success("Question type updated successfully.")
      setTimeout(() => {
        router.push("/question-types")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to update question type"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-6 sm:mb-10 flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/question-types"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Question Types
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Edit Template</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Edit Question Type
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Modify question type properties, localizations, and active templating rules.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-error/30 bg-error-container/20 p-4 text-error">
          <span className="material-symbols-outlined text-lg">error</span>
          <span className="font-body-md text-xs sm:text-sm font-medium">{errorMessage}</span>
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
              Question Type Specifications
            </CardTitle>
            <p className="text-[11px] sm:text-xs font-body-md text-on-surface-variant mt-0.5">
              Enter question format titles, identifier label, default mark, and visibility status.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            <div className="space-y-6">
              {/* English & Bangla Names */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Name EN */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Question Type Name (English) *
                  </Label>
                  <div className="group relative">
                    <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. MCQ Single Choice"
                      {...register("nameEn")}
                      className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                    />
                  </div>
                  {errors.nameEn && (
                    <p className="text-xs text-error">{errors.nameEn.message}</p>
                  )}
                </div>

                {/* Name BN */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Question Type Name (Bangla) *
                  </Label>
                  <div className="group relative">
                    <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="যেমন: এমসিকিউ একক উত্তর"
                      {...register("nameBn")}
                      className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                    />
                  </div>
                  {errors.nameBn && (
                    <p className="text-xs text-error">{errors.nameBn.message}</p>
                  )}
                </div>
              </div>

              {/* Label, Mark & Position */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Label */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    System Unique Label *
                  </Label>
                  <div className="group relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. mcq"
                      {...register("label")}
                      className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                    />
                  </div>
                  {errors.label && (
                    <p className="text-xs text-error">{errors.label.message}</p>
                  )}
                </div>

                {/* Mark */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Default Mark *
                  </Label>
                  <div className="group relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                    <Input
                      type="number"
                      step="any"
                      disabled={isSubmitting}
                      placeholder="e.g. 1"
                      {...register("mark")}
                      className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                    />
                  </div>
                  {errors.mark && (
                    <p className="text-xs text-error">{errors.mark.message}</p>
                  )}
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Sort Position Sequence
                  </Label>
                  <div className="group relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                    <Input
                      type="number"
                      disabled={isSubmitting}
                      placeholder="e.g. 0"
                      {...register("position")}
                      className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                    />
                  </div>
                  {errors.position && (
                    <p className="text-xs text-error">{errors.position.message}</p>
                  )}
                </div>
              </div>

              {/* Descriptions EN & BN */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Description EN */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Description (English)
                  </Label>
                  <Textarea
                    disabled={isSubmitting}
                    placeholder="Provide a brief explanation of how this format behaves..."
                    {...register("descriptionEn")}
                    className="min-h-[100px] w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden resize-none"
                  />
                </div>

                {/* Description BN */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Description (Bangla)
                  </Label>
                  <Textarea
                    disabled={isSubmitting}
                    placeholder="এই প্রশ্ন ফরম্যাটটির কাজ ও বিবরণ সংক্ষেপে লিখুন..."
                    {...register("descriptionBn")}
                    className="min-h-[100px] w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Is Active Toggle */}
              <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-4 bg-surface-container-low">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  disabled={isSubmitting}
                  onChange={(e) => setValue("isActive", e.target.checked)}
                  className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                />
                <div className="grid gap-0.5 leading-none">
                  <label
                    htmlFor="isActive"
                    className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5 select-none"
                  >
                    Enable/Activate Question Type Template
                  </label>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Allows academic subject mapping, exams, and question papers to use this question type format.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant/40">
              <Link href="/question-types">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  className="rounded-lg border border-outline px-6 py-2.5 font-bold text-primary hover:bg-surface-container-low transition-all cursor-pointer h-auto text-sm disabled:opacity-50"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-primary-container px-8 py-2.5 font-bold text-on-primary-container shadow-md hover:bg-primary hover:text-white transition-all cursor-pointer h-auto text-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

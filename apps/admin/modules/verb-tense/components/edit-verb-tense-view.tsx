"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useVerbTenseById,
  useUpdateVerbTense,
  useSubjectsForSelection,
  useAcademicClassesForSelection,
  useChaptersForSelection,
} from "../services/use-verb-tense"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Feather, ArrowLeft, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"
import { VERB_TENSE_SOURCE_OPTIONS } from "../constants"

const editVerbTenseFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().optional(),
  verb: z.string().min(1, "Verb is required"),
  presentForm: z.string().optional(),
  pastForm: z.string().optional(),
  futureForm: z.string().optional(),
  content: z.string().optional(),
  referenceText: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Popularity count must be a number",
  }),
})

type EditVerbTenseFormData = z.infer<typeof editVerbTenseFormSchema>

interface EditVerbTenseViewProps {
  id: string
}

export function EditVerbTenseView({ id }: EditVerbTenseViewProps) {
  const router = useRouter()
  const { data: item, isLoading: isItemLoading, isError } = useVerbTenseById(id)
  const updateMutation = useUpdateVerbTense()
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
  } = useForm<EditVerbTenseFormData>({
    resolver: zodResolver(editVerbTenseFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      verb: "",
      presentForm: "",
      pastForm: "",
      futureForm: "",
      content: "",
      referenceText: "",
      source: "গাইড বুক",
      session: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
    },
  })

  useEffect(() => {
    if (item) {
      const subject = item.subject as any
      const classId = subject?.classSubjects?.[0]?.classId || ""
      const referenceStr = Array.isArray(item.reference) ? item.reference.join(", ") : ""

      reset({
        classId,
        subjectId: item.subjectId || "",
        chapterId: item.academicChapterId || "",
        verb: item.verb || "",
        presentForm: item.presentForm || "",
        pastForm: item.pastForm || "",
        futureForm: item.futureForm || "",
        content: item.content || "",
        referenceText: referenceStr,
        source: item.source || "গাইড বুক",
        session: item.session || "",
        difficulty: (item.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
        popularityCount: String(item.popularityCount ?? 0),
      })
    }
  }, [item, reset])

  const selectedClassId = watch("classId")
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )

  const selectedSubjectId = watch("subjectId")
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: EditVerbTenseFormData) => {
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
        academicChapterId: data.chapterId || null,
        verb: data.verb.trim(),
        presentForm: data.presentForm ? data.presentForm.trim() : null,
        pastForm: data.pastForm ? data.pastForm.trim() : null,
        futureForm: data.futureForm ? data.futureForm.trim() : null,
        content: data.content ? data.content.trim() : null,
        reference: referenceArray,
        source: data.source ? data.source.trim() : null,
        session: data.session ? data.session.trim() : null,
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
      })

      toast.success("Verb Tense updated successfully.")
      setTimeout(() => {
        router.push("/verb-tense")
      }, 500)
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update Verb Tense")
      toast.error(err.message || "Failed to update Verb Tense")
    }
  }

  if (isItemLoading) {
    return (
      <div className="py-16 text-center text-on-surface-variant">
        <Loader2 className="size-6 animate-spin mx-auto text-primary" />
        <p className="mt-2 text-sm">Loading Verb Tense data...</p>
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="py-16 text-center text-error">
        <p className="text-lg font-bold">Verb Tense Not Found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/verb-tense">Back to List</Link>
        </Button>
      </div>
    )
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
          <Link href="/verb-tense">
            <ArrowLeft className="size-4" />
            <span>Back to Verb Tense List</span>
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm overflow-hidden">
        <CardHeader className="bg-surface-container-low/50 border-b border-outline-variant/30 p-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Feather className="size-5" />
            </div>
            <div>
              <CardTitle className="font-headline-md text-xl font-bold text-on-surface">
                Edit Verb Tense Entry
              </CardTitle>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Update base verb, present/past/future forms, example usage sentences, or reference citations.
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                          setValue("chapterId", "")
                        }}
                      >
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
                        onValueChange={(val) => {
                          field.onChange(val)
                          setValue("chapterId", "")
                        }}
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

                {/* Academic Chapter */}
                <div className="space-y-2">
                  <Label htmlFor="chapterId" className="text-sm font-bold text-on-surface">
                    Academic Chapter (Optional)
                  </Label>
                  <Controller
                    name="chapterId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedSubjectId}
                      >
                        <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto disabled:opacity-50 disabled:cursor-not-allowed">
                          <SelectValue placeholder={selectedSubjectId ? "Select Chapter" : "Select Subject First"} />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
                          {chapters.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id} className="text-neutral-900">
                              {ch.nameEn} {ch.nameBn ? `(${ch.nameBn})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Base Verb */}
            <div className="space-y-2">
              <Label htmlFor="verb" className="text-sm font-bold text-on-surface">
                Base Verb / Root Word (মূল ক্রিয়া) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="verb"
                placeholder="e.g. go, do, write, করা, যাওয়া"
                {...register("verb")}
                className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-solaiman text-base outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 h-auto"
              />
              {errors.verb && (
                <p className="text-xs font-semibold text-red-500">{errors.verb.message}</p>
              )}
            </div>

            {/* Conjugation Forms */}
            <div className="space-y-4">
              <h3 className="font-headline-sm text-sm font-bold uppercase tracking-wider text-outline">
                Tense Conjugation Forms
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Present Form */}
                <div className="space-y-2">
                  <Label htmlFor="presentForm" className="text-sm font-bold text-on-surface">
                    Present Form (বর্তমান রূপ)
                  </Label>
                  <Input
                    id="presentForm"
                    placeholder="e.g. go / goes, করি"
                    {...register("presentForm")}
                    className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-solaiman text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 h-auto"
                  />
                </div>

                {/* Past Form */}
                <div className="space-y-2">
                  <Label htmlFor="pastForm" className="text-sm font-bold text-on-surface">
                    Past Form (অতীত রূপ)
                  </Label>
                  <Input
                    id="pastForm"
                    placeholder="e.g. went, করলাম"
                    {...register("pastForm")}
                    className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-solaiman text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 h-auto"
                  />
                </div>

                {/* Future Form */}
                <div className="space-y-2">
                  <Label htmlFor="futureForm" className="text-sm font-bold text-on-surface">
                    Future Form (ভবিষ্যৎ রূপ)
                  </Label>
                  <Input
                    id="futureForm"
                    placeholder="e.g. will go, করব"
                    {...register("futureForm")}
                    className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-solaiman text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Example Sentence / Notes */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-bold text-on-surface">
                Example Sentence / Usage Notes (উদাহরণ / মন্তব্য)
              </Label>
              <Textarea
                id="content"
                rows={3}
                placeholder="e.g. He goes to school every day."
                {...register("content")}
                className="w-full rounded-xl border border-outline-variant bg-white p-3.5 font-solaiman text-sm leading-relaxed outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
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
                    placeholder="e.g. Dhaka Board 2024, SSC 2023"
                    {...register("referenceText")}
                    className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 h-auto"
                  />
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
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Source */}
                <div className="space-y-2">
                  <Label htmlFor="source" className="text-sm font-bold text-on-surface">
                    Source (উৎস)
                  </Label>
                  <Controller
                    name="source"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || "গাইড বুক"} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto">
                          <SelectValue placeholder="Select Source" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg">
                          {VERB_TENSE_SOURCE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-neutral-900">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Session */}
                <div className="space-y-2">
                  <Label htmlFor="session" className="text-sm font-bold text-on-surface">
                    Session / Year
                  </Label>
                  <Input
                    id="session"
                    placeholder="e.g. 2026"
                    {...register("session")}
                    className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 h-auto"
                  />
                </div>

                {/* Popularity Count */}
                <div className="space-y-2">
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
                </div>
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
                <Link href="/verb-tense">Cancel</Link>
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-6 h-11 gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Updating Verb Tense...</span>
                  </>
                ) : (
                  <span>Update Verb Tense</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

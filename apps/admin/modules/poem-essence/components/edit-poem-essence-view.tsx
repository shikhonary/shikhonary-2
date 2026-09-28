"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  usePoemEssenceById,
  useUpdatePoemEssence,
  useSubjectsForSelection,
  useAcademicClassesForSelection,
} from "../services/use-poem-essence"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"

const editPoemEssenceFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  title: z.string().min(1, "Title is required"),
  poemStanza: z.string().optional(),
  mainTheme: z.string().optional(),
  referenceText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Popularity count must be a number",
  }),
})

type EditPoemEssenceFormData = z.infer<typeof editPoemEssenceFormSchema>

interface EditPoemEssenceViewProps {
  id: string
}

export function EditPoemEssenceView({ id }: EditPoemEssenceViewProps) {
  const router = useRouter()
  const { data: poemEssence, isLoading, isError } = usePoemEssenceById(id)
  const updateMutation = useUpdatePoemEssence()
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
  } = useForm<EditPoemEssenceFormData>({
    resolver: zodResolver(editPoemEssenceFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      title: "",
      poemStanza: "",
      mainTheme: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
    },
  })

  useEffect(() => {
    if (poemEssence) {
      const classId = poemEssence.subject?.classSubjects?.[0]?.classId || ""
      reset({
        classId,
        subjectId: poemEssence.subjectId || "",
        title: poemEssence.title || "",
        poemStanza: poemEssence.poemStanza || "",
        mainTheme: poemEssence.mainTheme || "",
        referenceText: Array.isArray(poemEssence.reference) ? poemEssence.reference.join(", ") : "",
        difficulty: (poemEssence.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
        popularityCount: String(poemEssence.popularityCount ?? 0),
      })
    }
  }, [poemEssence, reset])

  const selectedClassId = watch("classId")
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: EditPoemEssenceFormData) => {
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
        title: data.title.trim(),
        poemStanza: data.poemStanza ? data.poemStanza.trim() : null,
        mainTheme: data.mainTheme ? data.mainTheme.trim() : null,
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
        reference: referenceArray,
      })

      toast.success("Poem Essence updated successfully.")
      setTimeout(() => {
        router.push("/poem-essences")
      }, 500)
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update Poem Essence")
      toast.error(err.message || "Failed to update Poem Essence")
    }
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center text-on-surface-variant">
        <Loader2 className="size-8 animate-spin mx-auto text-primary mb-2" />
        <p className="font-body-md text-sm font-medium">Loading Poem Essence data...</p>
      </div>
    )
  }

  if (isError || !poemEssence) {
    return (
      <div className="py-20 text-center text-error">
        <p className="font-headline-md text-lg font-bold">Failed to load Poem Essence.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/poem-essences">Back to List</Link>
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
          <Link href="/poem-essences">
            <ArrowLeft className="size-4" />
            <span>Back to Poem Essences</span>
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm overflow-hidden">
        <CardHeader className="bg-surface-container-low/50 border-b border-outline-variant/30 p-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="size-5" />
            </div>
            <div>
              <CardTitle className="font-headline-md text-xl font-bold text-on-surface">
                Edit Poem Essence (কবিতার মূলভাব)
              </CardTitle>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Update poem verses, main theme, and subject association.
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
            {/* Academic Association */}
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
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto">
                          <SelectValue placeholder="Select Subject" />
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
                </div>
              </div>
            </div>

            {/* Title / Heading */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-bold text-on-surface">
                Poem Title / Topic Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                className="w-full rounded-xl border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 h-auto"
              />
              {errors.title && (
                <p className="text-xs font-semibold text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Poem Stanza (কবিতার চরণসমূহ) */}
            <div className="space-y-2">
              <Label htmlFor="poemStanza" className="text-sm font-bold text-on-surface">
                Poem Verses / Stanza (কবিতার চরণসমূহ)
              </Label>
              <Textarea
                id="poemStanza"
                rows={6}
                {...register("poemStanza")}
                className="w-full rounded-xl border border-outline-variant bg-white p-3.5 font-solaiman text-base leading-relaxed outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* Main Theme (মূলভাব) */}
            <div className="space-y-2">
              <Label htmlFor="mainTheme" className="text-sm font-bold text-on-surface">
                Main Theme / Essence (কবিতার মূলভাব)
              </Label>
              <Textarea
                id="mainTheme"
                rows={6}
                {...register("mainTheme")}
                className="w-full rounded-xl border border-outline-variant bg-white p-3.5 font-solaiman text-base leading-relaxed outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10"
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
                <Link href="/poem-essences">Cancel</Link>
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-6 h-11 gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Poem Essence</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

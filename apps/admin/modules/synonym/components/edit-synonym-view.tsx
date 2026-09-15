"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useSynonymById,
  useUpdateSynonym,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-synonym"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { ChevronRightIcon, Loader2 } from "lucide-react"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

const editSynonymFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().min(1, "Please select a chapter"),
  word: z.string().min(1, "Word text is required"),
  synonymWord: z.string().optional(),
  synonymsText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  referenceText: z.string().optional(),
})

type EditSynonymFormData = z.infer<typeof editSynonymFormSchema>

interface EditSynonymViewProps {
  id: string
}

export function EditSynonymView({ id }: EditSynonymViewProps) {
  const router = useRouter()
  const { data: item, isLoading, isError } = useSynonymById(id)
  const updateMutation = useUpdateSynonym()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditSynonymFormData>({
    resolver: zodResolver(editSynonymFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      word: "",
      synonymWord: "",
      synonymsText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
    },
  })

  const selectedClassId = watch("classId")
  const selectedSubjectId = watch("subjectId")

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  useEffect(() => {
    if (item) {
      const subject = item.subject as any
      const classIdFromSubject = subject?.classSubjects?.[0]?.classId || ""

      reset({
        classId: classIdFromSubject,
        subjectId: item.subjectId,
        chapterId: item.academicChapterId || "",
        word: item.word,
        synonymWord: item.synonymWord || "",
        synonymsText: Array.isArray(item.synonyms) ? item.synonyms.join(", ") : "",
        difficulty: (item.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
        referenceText: Array.isArray(item.reference) ? item.reference.join(", ") : "",
      })
    }
  }, [item, reset])

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: EditSynonymFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const synonymsArray = data.synonymsText
        ? data.synonymsText
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : []

      const primarySynonym = data.synonymWord?.trim() || null

      await updateMutation.mutateAsync({
        id,
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        academicChapterId: data.chapterId,
        word: data.word.trim(),
        synonymWord: primarySynonym,
        synonyms: synonymsArray.length > 0 ? synonymsArray : (primarySynonym ? [primarySynonym] : []),
        difficulty: data.difficulty,
        reference: referenceArray,
      })

      toast.success("Synonym entry updated successfully.")
      setTimeout(() => {
        router.push("/synonyms")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to update synonym entry"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center text-outline flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading synonym entry details...</span>
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="py-20 text-center text-error border border-error/30 rounded-xl bg-error-container/20">
        <p className="font-bold text-base">Error loading synonym entry</p>
        <p className="text-xs mt-1">The requested entry with ID &quot;{id}&quot; was not found.</p>
        <Link href="/synonyms" className="mt-4 inline-block">
          <Button variant="outline" className="text-xs">Back to List</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-4 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/synonyms"
              className="font-label-sm hover:text-primary transition-colors cursor-pointer text-xs"
            >
              Synonym
            </Link>
            <ChevronRightIcon className="size-3 text-on-surface-variant/70" />
            <span className="font-label-sm font-bold text-primary text-xs">Edit Entry</span>
          </nav>
          <h2 className="mb-2 font-headline-md text-3xl font-extrabold text-primary">
            Edit Synonym Entry
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed text-sm">
            Modify the word details, primary synonym, synonyms list, context, difficulty, or reference.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-lg bg-error/10 border border-error/20 p-4 text-xs font-semibold text-error">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Academic Context */}
        <Card className="border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs rounded-xl">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-base font-bold text-on-surface">
              Academic Context
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Class */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Class *</Label>
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
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {academicClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.classId && (
                <p className="text-[11px] font-medium text-error">{errors.classId.message}</p>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Subject *</Label>
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
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder={!selectedClassId ? "Select Class First" : "Select Subject"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {subjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subjectId && (
                <p className="text-[11px] font-medium text-error">{errors.subjectId.message}</p>
              )}
            </div>

            {/* Chapter */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Chapter *</Label>
              <Controller
                name="chapterId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedSubjectId}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder={!selectedSubjectId ? "Select Subject First" : "Select Chapter"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {chapters.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id}>
                          {ch.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.chapterId && (
                <p className="text-[11px] font-medium text-error">{errors.chapterId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Word Content */}
        <Card className="border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs rounded-xl">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-base font-bold text-on-surface">
              Word Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Word Input */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-on-surface">Word (মূল শব্দ) *</Label>
                <Input
                  {...register("word")}
                  placeholder="Enter main word..."
                  className="bg-white font-solaiman text-base font-semibold"
                />
                {errors.word && (
                  <p className="text-[11px] font-medium text-error">{errors.word.message}</p>
                )}
              </div>

              {/* Primary Synonym Input */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-on-surface">Primary Synonym (প্রধান সমার্থক শব্দ)</Label>
                <Input
                  {...register("synonymWord")}
                  placeholder="Enter primary synonym..."
                  className="bg-white font-solaiman text-base font-semibold"
                />
              </div>
            </div>

            {/* Synonyms Array Input */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Synonyms List (অন্যান্য সমার্থক শব্দসমূহ - Comma-separated)</Label>
              <Input
                {...register("synonymsText")}
                placeholder="e.g. সাগর, জলধি, সিন্ধু, পাথার"
                className="bg-white font-solaiman text-base font-semibold"
              />
              <p className="text-[11px] text-outline">Separate multiple synonyms with commas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-on-surface">Difficulty</Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="EASY">EASY</SelectItem>
                        <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                        <SelectItem value="HARD">HARD</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Reference */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-on-surface">Board Reference (Comma-separated)</Label>
                <Input
                  {...register("referenceText")}
                  placeholder="e.g. ঢাকা বোর্ড ২০২৪, রাজশাহী বোর্ড ২০২৩"
                  className="bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/synonyms">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="rounded-lg border-outline-variant px-6 py-2.5 text-xs font-bold"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-white hover:bg-primary/90"
          >
            {isSubmitting ? "Saving..." : "Update Synonym Entry"}
          </Button>
        </div>
      </form>
    </div>
  )
}

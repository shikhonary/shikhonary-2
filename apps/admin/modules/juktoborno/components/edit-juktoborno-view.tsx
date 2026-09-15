"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useJuktobornoById,
  useUpdateJuktoborno,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-juktoborno"
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

const editJuktobornoFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().min(1, "Please select a chapter"),
  juktoborno: z.string().min(1, "Juktoborno text is required"),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  referenceText: z.string().optional(),
})

type EditJuktobornoFormData = z.infer<typeof editJuktobornoFormSchema>

interface EditJuktobornoViewProps {
  id: string
}

export function EditJuktobornoView({ id }: EditJuktobornoViewProps) {
  const router = useRouter()
  const { data: item, isLoading, isError } = useJuktobornoById(id)
  const updateMutation = useUpdateJuktoborno()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditJuktobornoFormData>({
    resolver: zodResolver(editJuktobornoFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      juktoborno: "",
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
      const chapter = item.academicChapter as any
      const classIdFromSubject = subject?.classSubjects?.[0]?.classId || ""

      reset({
        classId: classIdFromSubject,
        subjectId: item.subjectId,
        chapterId: item.academicChapterId || "",
        juktoborno: item.juktoborno,
        difficulty: (item.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
        referenceText: Array.isArray(item.reference) ? item.reference.join(", ") : "",
      })
    }
  }, [item, reset])

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: EditJuktobornoFormData) => {
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
        chapterId: data.chapterId,
        academicChapterId: data.chapterId,
        juktoborno: data.juktoborno.trim(),
        difficulty: data.difficulty,
        reference: referenceArray,
      })

      toast.success("Juktoborno entry updated successfully.")
      setTimeout(() => {
        router.push("/juktoborno")
      }, 500)
    } catch (err: any) {
      const msg = err?.message || "Failed to update juktoborno entry."
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-error">Entry Not Found</h2>
        <p className="text-sm text-on-surface-variant mt-2">
          The requested Juktoborno item could not be found or loaded.
        </p>
        <Button asChild className="mt-4">
          <Link href="/juktoborno">Back to Juktoborno List</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/juktoborno" className="hover:text-primary transition-colors">
          Juktoborno
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="font-semibold text-on-surface">Edit Juktoborno</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">
          Edit Juktoborno Entry
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Modify details for &quot;{item.juktoborno}&quot;.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl border border-error/30 bg-error-container/20 text-error text-sm font-medium">
          {errorMessage}
        </div>
      )}

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Juktoborno Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Class, Subject, Chapter Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Class Selection */}
              <div className="space-y-2">
                <Label htmlFor="classId" className="font-semibold">
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
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger id="classId" className="w-full">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
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
                  <p className="text-xs text-error">{errors.classId.message}</p>
                )}
              </div>

              {/* Subject Selection */}
              <div className="space-y-2">
                <Label htmlFor="subjectId" className="font-semibold">
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
                        setValue("chapterId", "")
                      }}
                      disabled={!selectedClassId}
                    >
                      <SelectTrigger id="subjectId" className="w-full">
                        <SelectValue
                          placeholder={
                            !selectedClassId ? "Select Class First" : "Select Subject"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
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
                  <p className="text-xs text-error">{errors.subjectId.message}</p>
                )}
              </div>

              {/* Chapter Selection */}
              <div className="space-y-2">
                <Label htmlFor="chapterId" className="font-semibold">
                  Chapter <span className="text-error">*</span>
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
                      <SelectTrigger id="chapterId" className="w-full">
                        <SelectValue
                          placeholder={
                            !selectedSubjectId ? "Select Subject First" : "Select Chapter"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
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
                  <p className="text-xs text-error">{errors.chapterId.message}</p>
                )}
              </div>
            </div>

            {/* Juktoborno Text */}
            <div className="space-y-2">
              <Label htmlFor="juktoborno" className="font-semibold">
                Juktoborno (যুক্তবর্ণ) <span className="text-error">*</span>
              </Label>
              <Input
                id="juktoborno"
                placeholder="e.g. ক্ষ, জ্ঞ, ঙ্ক"
                {...register("juktoborno")}
                className="w-full"
              />
              {errors.juktoborno && (
                <p className="text-xs text-error">{errors.juktoborno.message}</p>
              )}
            </div>

            {/* Difficulty & Board References Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficulty" className="font-semibold">
                  Difficulty Level
                </Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="difficulty" className="w-full">
                        <SelectValue placeholder="Select Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={QUESTION_DIFFICULTY.EASY}>EASY</SelectItem>
                        <SelectItem value={QUESTION_DIFFICULTY.MEDIUM}>MEDIUM</SelectItem>
                        <SelectItem value={QUESTION_DIFFICULTY.HARD}>HARD</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Board References */}
              <div className="space-y-2">
                <Label htmlFor="referenceText" className="font-semibold">
                  Board References (Comma separated)
                </Label>
                <Input
                  id="referenceText"
                  placeholder="e.g. ঢাকা বোর্ড ২০২৪, রাজশাহী বোর্ড ২০২৩"
                  {...register("referenceText")}
                  className="w-full"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
              <Button asChild variant="outline">
                <Link href="/juktoborno">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Juktoborno"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

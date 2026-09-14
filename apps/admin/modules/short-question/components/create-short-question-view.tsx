"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useCreateShortQuestion,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-short-question"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import { ChevronRightIcon } from "lucide-react"
import { QUESTION_DIFFICULTY } from "@workspace/utils"

const createShortQuestionFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().min(1, "Please select a chapter"),
  question: z.string().min(1, "Question text is required"),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  referenceText: z.string().optional(),
})

type CreateShortQuestionFormData = z.infer<typeof createShortQuestionFormSchema>

export function CreateShortQuestionView() {
  const router = useRouter()
  const createMutation = useCreateShortQuestion()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateShortQuestionFormData>({
    resolver: zodResolver(createShortQuestionFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      question: "",
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

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const onSubmit = async (data: CreateShortQuestionFormData) => {
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
        question: data.question.trim(),
        difficulty: data.difficulty,
        reference: referenceArray,
      })

      toast.success("Short Question created successfully.")
      setTimeout(() => {
        router.push("/short-questions")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to create Short Question"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-4 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/short-questions"
              className="font-label-sm hover:text-primary transition-colors cursor-pointer text-xs"
            >
              Short Questions
            </Link>
            <ChevronRightIcon className="size-3 text-on-surface-variant/70" />
            <span className="font-label-sm font-bold text-primary text-xs">Create New</span>
          </nav>
          <h2 className="mb-2 font-headline-md text-3xl font-extrabold text-primary">
            Create Short Question
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed text-sm">
            Add a new short question (সংক্ষিপ্ত প্রশ্ন) to the question bank.
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

        {/* Question Details */}
        <Card className="border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs rounded-xl">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-base font-bold text-on-surface">
              Question Content
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            {/* Question Text */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Question Text *</Label>
              <Textarea
                {...register("question")}
                placeholder="Enter short question text..."
                className="min-h-[120px] bg-white font-mono text-sm"
              />
              {errors.question && (
                <p className="text-[11px] font-medium text-error">{errors.question.message}</p>
              )}
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
          <Link href="/short-questions">
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
            {isSubmitting ? "Creating..." : "Save Short Question"}
          </Button>
        </div>
      </form>
    </div>
  )
}

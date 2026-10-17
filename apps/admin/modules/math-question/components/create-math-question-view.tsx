"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useCreateMathQuestion,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-math-question"
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
import { ChevronRightIcon } from "lucide-react"
import { QUESTION_DIFFICULTY } from "@workspace/utils"
import { MATH_QUESTION_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"

const createMathQuestionFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().min(1, "Please select a chapter"),
  question: z.string().min(1, "Question text is required"),
  answer: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  referenceText: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
})

type CreateMathQuestionFormData = z.infer<typeof createMathQuestionFormSchema>

export function CreateMathQuestionView() {
  const router = useRouter()
  const createMutation = useCreateMathQuestion()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateMathQuestionFormData>({
    resolver: zodResolver(createMathQuestionFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      question: "",
      answer: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
      source: DEFAULT_SOURCE,
      session: new Date().getFullYear().toString(),
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

  const onSubmit = async (data: CreateMathQuestionFormData) => {
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
        answer: data.answer?.trim() || null,
        difficulty: data.difficulty,
        reference: referenceArray,
        source: data.source?.trim() || null,
        session: data.session?.trim() || null,
      })

      toast.success("Math Question created successfully!")
      router.push("/math-questions")
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create Math Question")
      toast.error(err.message || "Failed to create Math Question")
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-outline">
        <Link href="/math-questions" className="hover:text-primary transition-colors">
          Math Questions
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="font-semibold text-on-surface">Create New Question</span>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
          Add Math Question
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Enter question details, optional answer or step-by-step solution, academic taxonomy, and board references.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-500/20 bg-red-50 p-4 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <Card className="rounded-2xl border border-outline-variant/30 bg-white shadow-sm overflow-hidden">
        <CardHeader className="border-b border-outline-variant/20 bg-surface-container-low/50 px-6 py-4">
          <CardTitle className="text-base font-bold text-on-surface">
            Question Details
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Academic Classification Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Class */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-outline uppercase tracking-wider">
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
                      <SelectTrigger className="w-full rounded-xl">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicClasses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nameEn} {c.nameBn ? `(${c.nameBn})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.classId && (
                  <p className="text-xs text-red-500">{errors.classId.message}</p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-outline uppercase tracking-wider">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="subjectId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      disabled={!selectedClassId}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nameEn} {s.nameBn ? `(${s.nameBn})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subjectId && (
                  <p className="text-xs text-red-500">{errors.subjectId.message}</p>
                )}
              </div>

              {/* Chapter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-outline uppercase tracking-wider">
                  Chapter <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="chapterId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      disabled={!selectedSubjectId}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl">
                        <SelectValue placeholder="Select Chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((ch) => (
                          <SelectItem key={ch.id} value={ch.id}>
                            {ch.nameEn} {ch.nameBn ? `(${ch.nameBn})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.chapterId && (
                  <p className="text-xs text-red-500">{errors.chapterId.message}</p>
                )}
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-outline uppercase tracking-wider">
                Question <span className="text-red-500">*</span>
              </Label>
              <Textarea
                {...register("question")}
                rows={3}
                placeholder="e.g. একটি ক্রিকেট খেলায় তামিম ও সাকিবের মোট রান ১০৮। সাকিবের চেয়ে তামিম ১২ রান বেশি করেছে। কার রান কত?"
                className="w-full rounded-xl border border-outline-variant/40 bg-white p-3 text-sm focus:border-primary"
              />
              {errors.question && (
                <p className="text-xs text-red-500">{errors.question.message}</p>
              )}
            </div>

            {/* Answer / Solution Text */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-outline uppercase tracking-wider">
                Answer / Solution (Optional)
              </Label>
              <Textarea
                {...register("answer")}
                rows={3}
                placeholder="e.g. তামিমের রান ৬০ এবং সাকিবের রান ৪৮।"
                className="w-full rounded-xl border border-outline-variant/40 bg-white p-3 text-sm focus:border-primary"
              />
            </div>

            {/* Difficulty, Source, Session Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Difficulty */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-outline uppercase tracking-wider">
                  Difficulty Level
                </Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full rounded-xl">
                        <SelectValue placeholder="Select Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EASY">Easy</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HARD">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Source */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-outline uppercase tracking-wider">
                  Question Source
                </Label>
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || DEFAULT_SOURCE} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full rounded-xl">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        {MATH_QUESTION_SOURCE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Session / Year */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-outline uppercase tracking-wider">
                  Session / Year
                </Label>
                <Input
                  {...register("session")}
                  placeholder="2026"
                  className="rounded-xl border-outline-variant/40"
                />
              </div>
            </div>

            {/* Board References */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-outline uppercase tracking-wider">
                Board / School References (Comma separated)
              </Label>
              <Input
                {...register("referenceText")}
                placeholder="e.g. ঢাকা বোর্ড ২০২৪, রাজউক উত্তরা মডেল কলেজ ২০২৩"
                className="rounded-xl border-outline-variant/40"
              />
              <p className="text-[11px] text-outline">
                Separate multiple references with commas.
              </p>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
              <Button
                type="button"
                variant="outline"
                asChild
                className="rounded-xl"
              >
                <Link href="/math-questions">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold px-6"
              >
                {isSubmitting ? "Saving..." : "Create Question"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

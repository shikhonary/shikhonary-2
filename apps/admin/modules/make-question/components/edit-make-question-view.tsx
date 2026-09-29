"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useMakeQuestionById,
  useUpdateMakeQuestion,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
  useEssencesForSelection,
} from "../services/use-make-question"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { ChevronRightIcon, Sparkles } from "lucide-react"
import { QUESTION_DIFFICULTY } from "@workspace/utils"
import { MAKE_QUESTION_SOURCE_OPTIONS } from "../constants"

const editMakeQuestionFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().optional(),
  essenceId: z.string().optional(),
  statement: z.string().optional(),
  answer: z.string().optional(),
  clue: z.string().optional(),
  context: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  referenceText: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
})

type EditMakeQuestionFormData = z.infer<typeof editMakeQuestionFormSchema>

interface EditMakeQuestionViewProps {
  id: string
}

export function EditMakeQuestionView({ id }: EditMakeQuestionViewProps) {
  const router = useRouter()
  const { data: item, isLoading, isError } = useMakeQuestionById(id)
  const updateMutation = useUpdateMakeQuestion()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditMakeQuestionFormData>({
    resolver: zodResolver(editMakeQuestionFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      essenceId: "",
      statement: "",
      answer: "",
      clue: "",
      context: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
      source: "",
      session: "",
    },
  })

  useEffect(() => {
    if (item) {
      const subjectClass = item.subject?.classSubjects?.[0]?.classId || ""
      reset({
        classId: subjectClass,
        subjectId: item.subjectId,
        chapterId: item.academicChapterId || "",
        essenceId: item.essenceId || "",
        statement: item.statement || "",
        answer: item.answer || "",
        clue: item.clue || "",
        context: item.context || "",
        difficulty: (item.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
        referenceText: item.reference?.join(", ") || "",
        source: item.source || "",
        session: item.session || "",
      })
    }
  }, [item, reset])

  const selectedClassId = watch("classId")
  const selectedSubjectId = watch("subjectId")

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )
  const { data: essences = [] } = useEssencesForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: EditMakeQuestionFormData) => {
    setErrorMessage(null)

    if (!data.statement?.trim() && !data.context?.trim()) {
      const msg = "Please enter either a Statement or Context for the question."
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

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
        chapterId: data.chapterId || null,
        academicChapterId: data.chapterId || null,
        essenceId: data.essenceId || null,
        statement: data.statement?.trim() || null,
        answer: data.answer?.trim() || null,
        clue: data.clue?.trim() || null,
        context: data.context?.trim() || null,
        difficulty: data.difficulty,
        reference: referenceArray,
        source: data.source?.trim() || null,
        session: data.session?.trim() || null,
      })

      toast.success("Make Question entry updated successfully.")
      setTimeout(() => {
        router.push("/make-questions")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to update Question Making entry"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-rose-50 border border-rose-200 rounded-xl p-8 text-center text-rose-700">
        Question making entry not found or failed to load.
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-4 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/make-questions"
              className="font-label-sm hover:text-primary transition-colors cursor-pointer text-xs"
            >
              Make Questions
            </Link>
            <ChevronRightIcon className="size-3 text-on-surface-variant/70" />
            <span className="font-label-sm font-bold text-primary text-xs">Edit Entry</span>
          </nav>
          <h2 className="mb-2 font-headline-md text-3xl font-extrabold text-primary">
            Edit Question Making Entry
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed text-sm">
            Modify question making details, options, and linked essence association.
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
                      setValue("essenceId", "")
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
                      setValue("essenceId", "")
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
              <Label className="text-xs font-bold text-on-surface">Chapter (Optional)</Label>
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
            </div>
          </CardContent>
        </Card>

        {/* Essence Association */}
        <Card className="border border-indigo-200/60 bg-indigo-50/20 p-6 shadow-xs rounded-xl">
          <CardHeader className="p-0 pb-4 flex flex-row items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <CardTitle className="text-base font-bold text-indigo-950">
              Essence Module Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            <Label className="text-xs font-bold text-on-surface">Link Parent Essence (Optional)</Label>
            <Controller
              name="essenceId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedSubjectId}
                >
                  <SelectTrigger className="w-full bg-white border-indigo-200">
                    <SelectValue placeholder={!selectedSubjectId ? "Select Subject First" : "Select Parent Essence (Optional)"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="">No Essence (Standalone Question)</SelectItem>
                    {essences.map((ess) => (
                      <SelectItem key={ess.id} value={ess.id}>
                        {ess.title || "Untitled Essence"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs rounded-xl">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-base font-bold text-on-surface">
              Question & Statement Content
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            {/* Statement */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Statement (মূল বাক্য / বক্তব্য) *</Label>
              <Textarea
                {...register("statement")}
                rows={3}
                className="bg-white font-solaiman text-sm font-semibold"
              />
            </div>

            {/* Target Answer / Question */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Target Question / Answer</Label>
              <Textarea
                {...register("answer")}
                rows={2}
                className="bg-white font-solaiman text-sm"
              />
            </div>

            {/* Clue & Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-on-surface">Clue Word</Label>
                <Input
                  {...register("clue")}
                  className="bg-white font-solaiman text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-on-surface">Context Passage</Label>
                <Input
                  {...register("context")}
                  className="bg-white font-solaiman text-sm"
                />
              </div>
            </div>

            {/* Difficulty & Meta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
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
                <Label className="text-xs font-bold text-on-surface">Board Reference</Label>
                <Input
                  {...register("referenceText")}
                  className="bg-white text-xs"
                />
              </div>

              {/* Source & Session */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-on-surface">Source (উৎস) & Session</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Controller
                    name="source"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || "গাইড বুক"} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full bg-white text-xs h-9">
                          <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md">
                          {MAKE_QUESTION_SOURCE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-neutral-900 text-xs">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Input
                    {...register("session")}
                    className="bg-white text-xs h-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/make-questions">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="rounded-lg border-outline-variant px-6 py-2.5 text-xs font-bold cursor-pointer"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer"
          >
            {isSubmitting ? "Updating..." : "Update Question Entry"}
          </Button>
        </div>
      </form>
    </div>
  )
}

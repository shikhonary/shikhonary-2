"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useCreateCq } from "../services/use-cq"
import { useSubjectsForSelection } from "@/modules/subject/services/use-subject"
import { useChaptersForSelection } from "@/modules/chapter/services/use-chapter"
import { useAcademicClassesForSelection } from "@/modules/academic-class/services/use-academic-class"
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
import { ArrowLeft, Loader2 } from "lucide-react"

const createCqFormSchema = z.object({
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().min(1, "Please select a chapter"),
  context: z.string().optional(),
  referenceText: z.string().optional(),
  questionA: z.string().min(1, "Question A is required"),
  questionB: z.string().min(1, "Question B is required"),
  questionC: z.string().min(1, "Question C is required"),
  questionD: z.string().optional(),
  answer: z.object({
    answerA: z.string().optional(),
    answerB: z.string().optional(),
    answerC: z.string().optional(),
    answerD: z.string().optional(),
    explanation: z.string().optional(),
  }).optional(),
  attachments: z.array(z.object({
    url: z.string().url("Must be a valid URL"),
    type: z.string(),
    caption: z.string().optional(),
    position: z.number().int(),
  })),
})

type CreateCqFormData = z.infer<typeof createCqFormSchema>

export function CreateCqView() {
  const router = useRouter()
  const createMutation = useCreateCq()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Local state for the placeholder Class filter field
  const [selectedClassId, setSelectedClassId] = useState<string>("All")
  const { data: classes = [] } = useAcademicClassesForSelection()

  // Fetch subjects, optionally filtering by selected Class
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId && selectedClassId !== "All"
      ? { academicClassId: selectedClassId }
      : undefined
  )

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateCqFormData>({
    resolver: zodResolver(createCqFormSchema),
    defaultValues: {
      subjectId: "",
      chapterId: "",
      context: "",
      referenceText: "",
      questionA: "",
      questionB: "",
      questionC: "",
      questionD: "",
      answer: {
        answerA: "",
        answerB: "",
        answerC: "",
        answerD: "",
        explanation: "",
      },
      attachments: [],
    },
  })

  const selectedSubjectId = watch("subjectId")
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const onSubmit = async (data: CreateCqFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const formattedAnswer = (
        data.answer?.answerA ||
        data.answer?.answerB ||
        data.answer?.answerC ||
        data.answer?.answerD ||
        data.answer?.explanation
      ) ? {
        answerA: data.answer?.answerA?.trim() || null,
        answerB: data.answer?.answerB?.trim() || null,
        answerC: data.answer?.answerC?.trim() || null,
        answerD: data.answer?.answerD?.trim() || null,
        explanation: data.answer?.explanation?.trim() || null,
      } : null

      await createMutation.mutateAsync({
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        context: data.context?.trim() || null,
        reference: referenceArray,
        questionA: data.questionA.trim(),
        questionB: data.questionB.trim(),
        questionC: data.questionC.trim(),
        questionD: data.questionD?.trim() || null,
        attachments: [],
        answer: formattedAnswer,
      })

      toast.success("Creative Question created successfully.")
      setTimeout(() => {
        router.push("/cqs")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to create CQ"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/cqs"
          className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Creative Questions
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
          Create Creative Question (CQ)
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mt-1">
          Add creative questions with stems, references, parts, and detailed answer explanation keys.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 font-solaiman">
        {errorMessage && (
          <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-sm font-semibold text-error">
            {errorMessage}
          </div>
        )}

        {/* Card 1: basic details and stem context */}
        <Card className="rounded-2xl border border-outline-variant bg-white p-4 sm:p-6 shadow-xs">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="font-headline-md text-lg font-bold text-primary">
              1. Stem & Basic Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Class Dropdown (Local State Filter) */}
              <div className="space-y-2">
                <Label htmlFor="classFilter" className="font-label-md text-sm font-bold text-on-surface">
                  Class (Filters Subjects)
                </Label>
                <Select
                  value={selectedClassId}
                  onValueChange={(val) => {
                    setSelectedClassId(val)
                    setValue("subjectId", "")
                    setValue("chapterId", "")
                  }}
                >
                  <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2 px-3 h-10 justify-between">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-60">
                    <SelectItem value="All">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="subjectId" className="font-label-md text-sm font-bold text-on-surface">
                  Subject *
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
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2 px-3 h-10 justify-between">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-60">
                        {subjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subjectId && (
                  <p className="text-xs font-bold text-error">{errors.subjectId.message}</p>
                )}
              </div>

              {/* Chapter Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="chapterId" className="font-label-md text-sm font-bold text-on-surface">
                  Chapter *
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
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2 px-3 h-10 justify-between">
                        <SelectValue placeholder="Select Chapter" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-60">
                        {chapters.map((chap) => (
                          <SelectItem key={chap.id} value={chap.id}>
                            {chap.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.chapterId && (
                  <p className="text-xs font-bold text-error">{errors.chapterId.message}</p>
                )}
              </div>
            </div>

            {/* Stem text field */}
            <div className="space-y-2">
              <Label htmlFor="context" className="font-label-md text-sm font-bold text-on-surface">
                Stem (Context)
              </Label>
              <Textarea
                id="context"
                placeholder="Enter stem / context description..."
                {...register("context")}
                className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm min-h-[120px] focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* Reference field */}
            <div className="space-y-2">
              <Label htmlFor="referenceText" className="font-label-md text-sm font-bold text-on-surface">
                References (Comma separated, e.g., 'Dhaka Board 2023, Rajshahi Board 2022')
              </Label>
              <Input
                id="referenceText"
                placeholder="References..."
                {...register("referenceText")}
                className="w-full rounded-lg border border-outline-variant bg-white px-4 h-10 text-sm focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Question Parts */}
        <Card className="rounded-2xl border border-outline-variant bg-white p-4 sm:p-6 shadow-xs">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="font-headline-md text-lg font-bold text-primary">
              2. Question Parts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              {/* Part A */}
              <div className="space-y-2">
                <Label htmlFor="questionA" className="font-label-md text-sm font-bold text-on-surface">
                  ক *
                </Label>
                <Input
                  id="questionA"
                  placeholder="Enter question ক..."
                  {...register("questionA")}
                  className="w-full rounded-lg border border-outline-variant bg-white px-4 h-10 text-sm focus:ring-2 focus:ring-primary/10"
                />
                {errors.questionA && (
                  <p className="text-xs font-bold text-error">{errors.questionA.message}</p>
                )}
              </div>

              {/* Part B */}
              <div className="space-y-2">
                <Label htmlFor="questionB" className="font-label-md text-sm font-bold text-on-surface">
                  খ *
                </Label>
                <Input
                  id="questionB"
                  placeholder="Enter question খ..."
                  {...register("questionB")}
                  className="w-full rounded-lg border border-outline-variant bg-white px-4 h-10 text-sm focus:ring-2 focus:ring-primary/10"
                />
                {errors.questionB && (
                  <p className="text-xs font-bold text-error">{errors.questionB.message}</p>
                )}
              </div>

              {/* Part C */}
              <div className="space-y-2">
                <Label htmlFor="questionC" className="font-label-md text-sm font-bold text-on-surface">
                  গ *
                </Label>
                <Input
                  id="questionC"
                  placeholder="Enter question গ..."
                  {...register("questionC")}
                  className="w-full rounded-lg border border-outline-variant bg-white px-4 h-10 text-sm focus:ring-2 focus:ring-primary/10"
                />
                {errors.questionC && (
                  <p className="text-xs font-bold text-error">{errors.questionC.message}</p>
                )}
              </div>

              {/* Part D */}
              <div className="space-y-2">
                <Label htmlFor="questionD" className="font-label-md text-sm font-bold text-on-surface">
                  ঘ
                </Label>
                <Input
                  id="questionD"
                  placeholder="Enter question ঘ..."
                  {...register("questionD")}
                  className="w-full rounded-lg border border-outline-variant bg-white px-4 h-10 text-sm focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Answers & Explanation */}
        <Card className="rounded-2xl border border-outline-variant bg-white p-4 sm:p-6 shadow-xs">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="font-headline-md text-lg font-bold text-primary">
              3. Answers & Explanation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label htmlFor="answer.answerA" className="font-label-md text-sm font-bold text-on-surface">
                  Answer A
                </Label>
                <Textarea
                  id="answer.answerA"
                  placeholder="Enter Answer A..."
                  {...register("answer.answerA")}
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm min-h-[60px] focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer.answerB" className="font-label-md text-sm font-bold text-on-surface">
                  Answer B
                </Label>
                <Textarea
                  id="answer.answerB"
                  placeholder="Enter Answer B..."
                  {...register("answer.answerB")}
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm min-h-[60px] focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer.answerC" className="font-label-md text-sm font-bold text-on-surface">
                  Answer C
                </Label>
                <Textarea
                  id="answer.answerC"
                  placeholder="Enter Answer C..."
                  {...register("answer.answerC")}
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm min-h-[60px] focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer.answerD" className="font-label-md text-sm font-bold text-on-surface">
                  Answer D
                </Label>
                <Textarea
                  id="answer.answerD"
                  placeholder="Enter Answer D..."
                  {...register("answer.answerD")}
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm min-h-[60px] focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer.explanation" className="font-label-md text-sm font-bold text-on-surface">
                  Detailed Explanation
                </Label>
                <Textarea
                  id="answer.explanation"
                  placeholder="Enter detailed explanation..."
                  {...register("answer.explanation")}
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm min-h-[100px] focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions footer */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-outline-variant/30">
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto rounded-lg border px-5 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10 normal-case tracking-normal"
          >
            <Link href="/cqs" className="w-full text-center">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/95 cursor-pointer h-10 normal-case tracking-normal"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              "Create CQ"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

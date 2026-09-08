"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useCreateRightFormOfVerb,
  useSubjectsForSelection,
  useChaptersForSelection,
  useAcademicClassesForSelection,
} from "../services/use-right-form-of-verb"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Sparkles } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"

const createRightFormOfVerbFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().optional(),
  content: z.string().min(1, "Question text/passage is required"),
  referenceText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Popularity count must be a number",
  }),
})

type CreateRightFormOfVerbFormData = z.infer<typeof createRightFormOfVerbFormSchema>

/**
 * Preview renderer for bracketed verb clues
 */
function ContentPreview({ text }: { text: string }) {
  if (!text.trim()) {
    return <span className="text-outline italic text-xs">Type in the editor above to preview formatted text...</span>
  }

  const parts = text.split(/(\([a-zA-Z\s\/]+\))/g)

  return (
    <div className="leading-relaxed text-sm text-on-surface">
      {parts.map((part, index) => {
        if (/^\([a-zA-Z\s\/]+\)$/.test(part)) {
          return (
            <span
              key={index}
              className="inline-block px-1.5 py-0.5 mx-0.5 rounded font-bold font-mono text-xs bg-amber-500/10 text-amber-900 border border-amber-500/20"
            >
              {part}
            </span>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </div>
  )
}

export function CreateRightFormOfVerbView() {
  const router = useRouter()
  const createMutation = useCreateRightFormOfVerb()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateRightFormOfVerbFormData>({
    resolver: zodResolver(createRightFormOfVerbFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      content: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
    },
  })

  const selectedClassId = watch("classId")
  const selectedSubjectId = watch("subjectId")
  const contentValue = watch("content")

  const { data: subjects = [] } = useSubjectsForSelection({
    academicClassId: selectedClassId,
  })

  const { data: chapters = [] } = useChaptersForSelection({
    subjectId: selectedSubjectId,
  })

  const onSubmit = async (data: CreateRightFormOfVerbFormData) => {
    try {
      setErrorMessage(null)
      const references = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean)
        : []

      await createMutation.mutateAsync({
        content: data.content,
        reference: references,
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
        subjectId: data.subjectId,
        chapterId: data.chapterId && data.chapterId !== "none" ? data.chapterId : undefined,
      })

      toast.success("Right Form of Verbs question created successfully")
      router.push("/right-form-of-verbs")
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create question. Please check the form and try again.")
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-headline-md text-2xl font-extrabold text-primary sm:text-3xl">
            Add Right Form of Verbs Question
          </h2>
          <p className="font-body-md text-xs text-on-surface-variant sm:text-sm">
            Fill in the passage content with bracketed base verbs (e.g. <code>(be)</code>, <code>(work)</code>).
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/right-form-of-verbs">Back to List</Link>
        </Button>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-error/20 bg-error/5 p-4 text-xs font-medium text-error">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Academic Hierarchy */}
        <Card className="rounded-xl border border-outline-variant/40 bg-surface-container-low shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-on-surface">Academic Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Class */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-outline">Class *</Label>
              <Controller
                control={control}
                name="classId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val)
                      setValue("subjectId", "")
                      setValue("chapterId", "")
                    }}
                  >
                    <SelectTrigger className="bg-surface-container-lowest text-xs">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicClasses.map((ac) => (
                        <SelectItem key={ac.id} value={ac.id}>
                          {ac.nameEn} {ac.nameBn ? `(${ac.nameBn})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.classId && <p className="text-[11px] text-error">{errors.classId.message}</p>}
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-outline">Subject *</Label>
              <Controller
                control={control}
                name="subjectId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val)
                      setValue("chapterId", "")
                    }}
                    disabled={!selectedClassId}
                  >
                    <SelectTrigger className="bg-surface-container-lowest text-xs">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.nameEn} {sub.nameBn ? `(${sub.nameBn})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subjectId && <p className="text-[11px] text-error">{errors.subjectId.message}</p>}
            </div>

            {/* Chapter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-outline">Chapter / Topic (Optional)</Label>
              <Controller
                control={control}
                name="chapterId"
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                    disabled={!selectedSubjectId}
                  >
                    <SelectTrigger className="bg-surface-container-lowest text-xs">
                      <SelectValue placeholder="None / All Chapters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None / All Chapters</SelectItem>
                      {chapters.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id}>
                          {ch.nameEn} {ch.nameBn ? `(${ch.nameBn})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Question Passage Editor */}
        <Card className="rounded-xl border border-outline-variant/40 bg-surface-container-low shadow-none">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-on-surface">Question Passage & Content</CardTitle>
            <span className="text-[11px] text-outline flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Use (bracketed verbs) for verb blanks
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-outline">Passage Content *</Label>
              <Textarea
                rows={6}
                placeholder="Fill in the blanks with the correct form of the verbs given in the brackets:&#10;An ideal student always (learn) his lessons properly. He never (waste) his valuable time..."
                {...register("content")}
                className="bg-surface-container-lowest font-mono text-xs leading-relaxed"
              />
              {errors.content && <p className="text-[11px] text-error">{errors.content.message}</p>}
            </div>

            {/* Live Formatted Preview */}
            <div className="rounded-lg border border-outline-variant/30 bg-surface-container-high/30 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                Live Preview
              </div>
              <ContentPreview text={contentValue} />
            </div>
          </CardContent>
        </Card>

        {/* Metadata & Tagging */}
        <Card className="rounded-xl border border-outline-variant/40 bg-surface-container-low shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-on-surface">Metadata & Classification</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* References */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold uppercase text-outline">
                Board / School References (comma separated)
              </Label>
              <Input
                placeholder="Dhaka Board 2024, Rajshahi Board 2023, Ideal School"
                {...register("referenceText")}
                className="bg-surface-container-lowest text-xs"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-outline">Difficulty</Label>
              <Controller
                control={control}
                name="difficulty"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-surface-container-lowest text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button asChild variant="outline" disabled={isFormSubmitting || createMutation.isPending}>
            <Link href="/right-form-of-verbs">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isFormSubmitting || createMutation.isPending}>
            {isFormSubmitting || createMutation.isPending ? "Saving Question..." : "Save Question"}
          </Button>
        </div>
      </form>
    </div>
  )
}

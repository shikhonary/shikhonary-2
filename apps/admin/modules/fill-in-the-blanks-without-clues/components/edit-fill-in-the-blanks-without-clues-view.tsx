"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useFillInTheBlanksWithoutCluesById,
  useUpdateFillInTheBlanksWithoutClues,
  useSubjectsForSelection,
  useChaptersForSelection,
  useAcademicClassesForSelection,
} from "../services/use-fill-in-the-blanks-without-clues"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { HelpCircle, Sparkles, Plus, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"
import {
  FILL_IN_THE_BLANKS_WITHOUT_CLUES_SOURCE_OPTIONS,
  DEFAULT_SOURCE,
} from "../constants"

const editFillInTheBlanksWithoutCluesFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().optional(),
  content: z.string().optional(),
  options: z.array(z.object({ value: z.string() })),
  referenceText: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Popularity count must be a number",
  }),
})

type EditFillInTheBlanksWithoutCluesFormData = z.infer<typeof editFillInTheBlanksWithoutCluesFormSchema>

function ContentPreview({ text }: { text: string }) {
  if (!text.trim()) {
    return <span className="text-outline italic text-xs">Type passage above to preview formatted question...</span>
  }

  const parts = text.split(/(\([a-z]\)\s*_{2,})/gi)

  return (
    <div className="space-y-3">
      {/* Text preview */}
      <div className="leading-relaxed text-sm text-on-surface">
        {parts.map((part, index) => {
          if (/^\([a-z]\)\s*_{2,}/i.test(part)) {
            return (
              <span
                key={index}
                className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded font-mono font-bold text-primary bg-primary/10 border border-primary/20"
              >
                {part}
              </span>
            )
          }
          return <span key={index}>{part}</span>
        })}
      </div>
    </div>
  )
}

export function EditFillInTheBlanksWithoutCluesView({ id: propId }: { id?: string } = {}) {
  const router = useRouter()
  const params = useParams()
  const id = propId || (params?.id as string)
  const { data: item, isLoading, isError } = useFillInTheBlanksWithoutCluesById(id)
  const updateMutation = useUpdateFillInTheBlanksWithoutClues()
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
  } = useForm<EditFillInTheBlanksWithoutCluesFormData>({
    resolver: zodResolver(editFillInTheBlanksWithoutCluesFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      content: "",
      options: [],
      referenceText: "",
      source: DEFAULT_SOURCE,
      session: new Date().getFullYear().toString(),
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
    },
  })

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: "options",
  })

  // Prepopulate form data when record loads
  useEffect(() => {
    if (item) {
      const classId = item.subject?.classSubjects?.[0]?.classId || ""
      const existingOptions = Array.isArray((item as any).options)
        ? (item as any).options.map((opt: string) => ({ value: opt }))
        : []

      reset({
        classId: classId,
        subjectId: item.subjectId || "",
        chapterId: item.academicChapterId || "",
        content: item.content || "",
        options: existingOptions,
        referenceText: Array.isArray(item.reference) ? item.reference.join(", ") : "",
        source: (item as any).source || DEFAULT_SOURCE,
        session: (item as any).session || new Date().getFullYear().toString(),
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
  const contentValue = watch("content") || ""

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const insertNextBlank = () => {
    const textarea = document.getElementById("content-textarea") as HTMLTextAreaElement | null
    if (!textarea) return

    const currentMatches = contentValue.match(/\(([a-z])\)\s*_{2,}/gi) || []
    const nextCharCode = 97 + currentMatches.length
    const nextLetter = String.fromCharCode(nextCharCode)
    const placeholder = `(${nextLetter}) _________ `

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = contentValue.substring(0, start) + placeholder + contentValue.substring(end)

    setValue("content", newContent, { shouldValidate: true })
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length)
    }, 50)
  }

  const onSubmit = async (data: EditFillInTheBlanksWithoutCluesFormData) => {
    setErrorMessage(null)

    const contentVal = data.content?.trim() || null
    const optionsList = (data.options || [])
      .map((opt) => opt.value.trim())
      .filter(Boolean)

    if (!contentVal && optionsList.length === 0) {
      const msg = "Please provide either passage content or at least one sentence option."
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
        content: contentVal,
        options: optionsList,
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
        reference: referenceArray,
        source: data.source ? data.source.trim() : null,
        session: data.session ? data.session.trim() : new Date().getFullYear().toString(),
      })

      toast.success("Fill in the Blanks without Clues question updated successfully.")
      setTimeout(() => {
        router.push("/fill-in-the-blanks-without-clues")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to update question"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 text-center">
        <span className="text-primary font-bold">Loading question details...</span>
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 text-center text-error">
        <p className="font-bold text-lg">Question not found or error loading record.</p>
        <Link href="/fill-in-the-blanks-without-clues" className="text-primary underline mt-2 inline-block">
          Return to list
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/fill-in-the-blanks-without-clues"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Fill in the Blanks without Clues
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Edit</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Edit Fill in the Blanks without Clues
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Modify question text, passage gaps, reference tags, and academic associations.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-error/30 bg-error-container/20 p-4 text-error">
          <span className="material-symbols-outlined">error</span>
          <span className="font-body-md text-sm font-medium">{errorMessage}</span>
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
              Edit Question Specifications
            </CardTitle>
            <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
              Update academic details and the passage with blank gaps.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Academic Class & Subject Selects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Class Select */}
              <div className="space-y-2">
                <Label htmlFor="classId" className="font-label-lg text-sm font-bold text-on-surface">
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
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
                        {academicClasses.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id} className="text-neutral-900">
                            {cls.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.classId && (
                  <p className="font-body-sm text-xs text-error">{errors.classId.message}</p>
                )}
              </div>

              {/* Subject Select */}
              <div className="space-y-2">
                <Label htmlFor="subjectId" className="font-label-lg text-sm font-bold text-on-surface">
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
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between disabled:opacity-50">
                        <SelectValue placeholder={!selectedClassId ? "Select Class First" : "Select Subject"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
                        {subjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id} className="text-neutral-900">
                            {sub.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subjectId && (
                  <p className="font-body-sm text-xs text-error">{errors.subjectId.message}</p>
                )}
              </div>
            </div>

            {/* Chapter Select (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="chapterId" className="font-label-lg text-sm font-bold text-on-surface">
                Chapter <span className="text-xs font-normal text-outline">(Optional)</span>
              </Label>
              <Controller
                name="chapterId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                    disabled={!selectedSubjectId}
                  >
                    <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between disabled:opacity-50">
                      <SelectValue placeholder={!selectedSubjectId ? "Select Subject First" : "Select Chapter (Optional)"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
                      <SelectItem value="none" className="text-neutral-900">No Chapter Assigned</SelectItem>
                      {chapters.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id} className="text-neutral-900">
                          {ch.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Passage Textarea + Sequential Blank Inserter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content-textarea" className="font-label-lg text-sm font-bold text-on-surface">
                  Passage Content <span className="text-xs text-outline font-normal">(For passage-based questions, or optional prompt)</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={insertNextBlank}
                  className="rounded-lg border-primary/30 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 flex items-center gap-1.5 h-7 px-2.5 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Insert Next Blank</span>
                </Button>
              </div>
              <p className="text-xs text-outline">
                Use markers like <code className="bg-surface-container-high px-1 rounded font-mono font-bold">(a) _________</code>, <code className="bg-surface-container-high px-1 rounded font-mono font-bold">(b) _________</code> for blanks in the passage.
              </p>
              <Textarea
                id="content-textarea"
                {...register("content")}
                rows={6}
                placeholder="A poor woodcutter lived in a village. He was very (a) _________ and worked (b) _________ in the (c) _________ every day. One day, his axe fell into a deep (d) _________."
                className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10"
              />
              {errors.content && (
                <p className="font-body-sm text-xs text-error">{errors.content.message}</p>
              )}
            </div>

            {/* Live Formatted Passage Preview */}
            {contentValue.trim().length > 0 && (
              <div className="space-y-2 rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-4">
                <p className="font-label-sm text-xs font-bold uppercase tracking-wider text-outline">
                  Formatted Preview
                </p>
                <ContentPreview text={contentValue} />
              </div>
            )}

            {/* Sentence Options Builder (For Options-Based Questions) */}
            <div className="space-y-3 pt-4 border-t border-outline-variant/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <Label className="font-label-lg text-sm font-bold text-on-surface">
                    Sentence Options <span className="text-xs text-outline font-normal">(For itemized / option-based blanks)</span>
                  </Label>
                  <p className="text-xs text-outline">
                    Add individual sentences with blanks, e.g. <code className="bg-surface-container-high px-1 rounded font-mono font-bold">(a) He is _________ honest man.</code>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextLetter = String.fromCharCode(97 + optionFields.length)
                    appendOption({ value: `(${nextLetter}) ` })
                  }}
                  className="rounded-lg text-xs font-bold border-primary/30 text-primary hover:bg-primary/5 cursor-pointer h-8 gap-1.5 w-fit"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Sentence Option</span>
                </Button>
              </div>

              {optionFields.length > 0 && (
                <div className="space-y-2.5">
                  {optionFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-outline w-7 text-center shrink-0 font-mono">
                        #{index + 1}
                      </span>
                      <Input
                        placeholder={`e.g. (${String.fromCharCode(97 + index)}) Sentence text with _________ blank`}
                        className="w-full rounded-lg border border-outline-variant bg-white p-2.5 font-body-sm text-sm outline-hidden focus:ring-2 focus:ring-primary/10 flex-1"
                        {...register(`options.${index}.value` as const)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="h-8 w-8 text-outline hover:text-error hover:bg-error/10 shrink-0"
                        title="Remove option"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Difficulty & Popularity Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficulty" className="font-label-lg text-sm font-bold text-on-surface">
                  Difficulty Level
                </Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
                        <SelectValue />
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

              {/* Popularity Count */}
              <div className="space-y-2">
                <Label htmlFor="popularityCount" className="font-label-lg text-sm font-bold text-on-surface">
                  Popularity Count
                </Label>
                <Input
                  id="popularityCount"
                  type="number"
                  {...register("popularityCount")}
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
                />
                {errors.popularityCount && (
                  <p className="font-body-sm text-xs text-error">{errors.popularityCount.message}</p>
                )}
              </div>
            </div>

            {/* Reference Tags Input */}
            <div className="space-y-2">
              <Label htmlFor="referenceText" className="font-label-lg text-sm font-bold text-on-surface">
                Reference Tags <span className="text-xs font-normal text-outline">(Comma-separated)</span>
              </Label>
              <Input
                id="referenceText"
                {...register("referenceText")}
                placeholder="e.g. Dhaka Board 2024, Rajshahi Board 2023, Test Paper 2022"
                className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
              />
              <p className="text-xs text-outline">
                Optional tags to categorize exam appearances or source books.
              </p>
            </div>

            {/* Source & Session */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source */}
              <div className="space-y-2">
                <Label htmlFor="source" className="font-label-lg text-sm font-bold text-on-surface">
                  Source (উৎস)
                </Label>
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
                        <SelectValue placeholder="উৎস নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                        {FILL_IN_THE_BLANKS_WITHOUT_CLUES_SOURCE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
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
                <Label htmlFor="session" className="font-label-lg text-sm font-bold text-on-surface">
                  Session (শিক্ষাবর্ষ)
                </Label>
                <Input
                  id="session"
                  {...register("session")}
                  placeholder="e.g. 2026"
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-outline-variant/40">
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-xl border-outline-variant text-sm font-bold cursor-pointer"
              >
                <Link href="/fill-in-the-blanks-without-clues">Cancel</Link>
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary/90 transition-all cursor-pointer h-auto"
              >
                {isSubmitting ? "Updating..." : "Update Question"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

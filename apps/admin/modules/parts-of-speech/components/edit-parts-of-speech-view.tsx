"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  usePartsOfSpeechById,
  useUpdatePartsOfSpeech,
  useSubjectsForSelection,
  useChaptersForSelection,
  useAcademicClassesForSelection,
} from "../services/use-parts-of-speech"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { HelpCircle, Sparkles } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"

const editPartsOfSpeechFormSchema = z.object({
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

type EditPartsOfSpeechFormData = z.infer<typeof editPartsOfSpeechFormSchema>

function ContentPreview({ text }: { text: string }) {
  if (!text.trim()) {
    return <span className="text-outline italic text-xs">Type in the editor above to preview formatted text...</span>
  }

  const parts = text.split(/(<u>.*?<\/u>)/gi)

  return (
    <div className="leading-relaxed text-sm text-on-surface">
      {parts.map((part, index) => {
        if (/^<u>(.*?)<\/u>$/i.test(part)) {
          const match = part.match(/^<u>(.*?)<\/u>$/i)
          return (
            <u
              key={index}
              className="font-bold text-primary underline decoration-primary decoration-2 underline-offset-3"
            >
              {match ? match[1] : part}
            </u>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </div>
  )
}

export function EditPartsOfSpeechView({ id: propId }: { id?: string } = {}) {
  const router = useRouter()
  const params = useParams()
  const id = propId || (params?.id as string)
  const { data: item, isLoading, isError } = usePartsOfSpeechById(id)
  const updateMutation = useUpdatePartsOfSpeech()
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
  } = useForm<EditPartsOfSpeechFormData>({
    resolver: zodResolver(editPartsOfSpeechFormSchema),
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

  useEffect(() => {
    if (item) {
      const classId = item.subject?.classSubjects?.[0]?.classId || ""
      reset({
        classId,
        subjectId: item.subjectId,
        chapterId: item.academicChapterId || "",
        content: item.content || "",
        referenceText: item.reference ? item.reference.join(", ") : "",
        difficulty: (item.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
        popularityCount: String(item.popularityCount || 0),
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
  const contentValue = watch("content")

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const insertUnderlineTag = () => {
    const textarea = document.getElementById("content-textarea-edit") as HTMLTextAreaElement | null
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = contentValue.substring(start, end) || "word"
    const replacement = `<u>${selectedText}</u>`
    const newContent = contentValue.substring(0, start) + replacement + contentValue.substring(end)

    setValue("content", newContent, { shouldValidate: true })
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + 3, start + 3 + selectedText.length)
    }, 50)
  }

  const onSubmit = async (data: EditPartsOfSpeechFormData) => {
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
        chapterId: data.chapterId || null,
        content: data.content.trim(),
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
        reference: referenceArray,
      })

      toast.success("Parts of Speech question updated successfully.")
      setTimeout(() => {
        router.push("/parts-of-speech")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to update question"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center text-on-surface-variant">
        <span className="animate-spin text-primary font-bold">Loading Question Details...</span>
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="py-20 text-center text-error">
        <p className="text-lg font-bold">Question not found or error loading.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/parts-of-speech">Back to List</Link>
        </Button>
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
              href="/parts-of-speech"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Parts of Speech
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Edit Question</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Edit Parts of Speech Question
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Update passage content, underlined words, difficulty level, and associations.
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
              Edit Specifications
            </CardTitle>
            <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
              Modify text content and underlined words below.
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
                      <SelectItem value="none" className="text-neutral-900">None (General Subject Question)</SelectItem>
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

            {/* Content Field with Underline helper */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content-textarea-edit" className="font-label-lg text-sm font-bold text-on-surface">
                  Question Text / Passage <span className="text-error">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={insertUnderlineTag}
                  className="h-7 text-xs px-2.5 rounded-md border-primary/30 text-primary hover:bg-primary/10 font-bold flex items-center gap-1 cursor-pointer"
                  title="Wrap selected text in <u> tags to underline it"
                >
                  <Sparkles className="size-3" />
                  <u>Underline Word</u>
                </Button>
              </div>

              <Textarea
                id="content-textarea-edit"
                rows={5}
                placeholder="e.g. Read the text and identify the parts of speech of the underlined words: Honesty is the <u>best</u> policy..."
                className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10"
                {...register("content")}
              />
              <p className="text-[11px] text-outline">
                Tip: Wrap words in <code className="bg-muted px-1 rounded">&lt;u&gt;word&lt;/u&gt;</code> to mark them as underlined for identification.
              </p>
              {errors.content && (
                <p className="font-body-sm text-xs text-error">{errors.content.message}</p>
              )}

              {/* Live Preview Box */}
              <div className="mt-3 rounded-lg border border-outline-variant/40 bg-surface-container-low p-3.5 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-outline">
                  Live Formatted Preview:
                </p>
                <ContentPreview text={contentValue} />
              </div>
            </div>

            {/* Difficulty & Popularity */}
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
                        <SelectValue placeholder="Select Difficulty" />
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
                  placeholder="0"
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
                  {...register("popularityCount")}
                />
              </div>
            </div>

            {/* Reference Tags */}
            <div className="space-y-2">
              <Label htmlFor="referenceText" className="font-label-lg text-sm font-bold text-on-surface">
                References / Board Info <span className="text-xs font-normal text-outline">(Comma-separated)</span>
              </Label>
              <Input
                id="referenceText"
                placeholder="e.g. Dhaka Board 2024, Rajshahi Board 2023"
                className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
                {...register("referenceText")}
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-outline-variant/40 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                asChild
                className="rounded-xl border-outline-variant px-6 py-2.5 text-sm font-bold cursor-pointer"
              >
                <Link href="/parts-of-speech">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary text-white hover:bg-primary/90 px-6 py-2.5 text-sm font-bold shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

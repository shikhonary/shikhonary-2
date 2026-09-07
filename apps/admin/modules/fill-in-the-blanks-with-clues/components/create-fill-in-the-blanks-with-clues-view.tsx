"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useCreateFillInTheBlanksWithClues,
  useSubjectsForSelection,
  useChaptersForSelection,
  useAcademicClassesForSelection,
} from "../services/use-fill-in-the-blanks-with-clues"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { HelpCircle, Sparkles, BoxSelect, Plus, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"

const createFillInTheBlanksWithCluesFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().optional(),
  content: z.string().min(1, "Question passage text is required"),
  cluesText: z.string().optional(),
  referenceText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Popularity count must be a number",
  }),
})

type CreateFillInTheBlanksWithCluesFormData = z.infer<typeof createFillInTheBlanksWithCluesFormSchema>

/**
 * Preview renderer for passage with highlighted blanks
 */
function ContentPreview({ text, clues }: { text: string; clues: string[] }) {
  if (!text.trim() && clues.length === 0) {
    return <span className="text-outline italic text-xs">Fill in clues and passage above to preview formatted question...</span>
  }

  const parts = text.split(/(\([a-z]\)\s*_{2,})/gi)

  return (
    <div className="space-y-3">
      {/* Box preview */}
      {clues.length > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1.5">
            Words in the Box:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {clues.map((c, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded bg-white text-xs font-semibold text-on-surface border border-outline-variant shadow-2xs">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Text preview */}
      {text.trim() && (
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
      )}
    </div>
  )
}

export function CreateFillInTheBlanksWithCluesView() {
  const router = useRouter()
  const createMutation = useCreateFillInTheBlanksWithClues()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [newClueInput, setNewClueInput] = useState("")
  const [cluesList, setCluesList] = useState<string[]>([])

  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateFillInTheBlanksWithCluesFormData>({
    resolver: zodResolver(createFillInTheBlanksWithCluesFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      content: "",
      cluesText: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
    },
  })

  const selectedClassId = watch("classId")
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const selectedSubjectId = watch("subjectId")
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )
  const contentValue = watch("content")

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const handleAddClue = () => {
    if (!newClueInput.trim()) return
    const split = newClueInput.split(",").map((s) => s.trim()).filter(Boolean)
    const updated = [...cluesList, ...split]
    setCluesList(updated)
    setValue("cluesText", updated.join(", "))
    setNewClueInput("")
  }

  const handleRemoveClue = (idx: number) => {
    const updated = cluesList.filter((_, i) => i !== idx)
    setCluesList(updated)
    setValue("cluesText", updated.join(", "))
  }

  const insertNextBlank = () => {
    const textarea = document.getElementById("content-textarea") as HTMLTextAreaElement | null
    if (!textarea) return

    // Calculate next sequential letter
    const currentMatches = contentValue.match(/\(([a-z])\)\s*_{2,}/gi) || []
    const nextCharCode = 97 + currentMatches.length // 97 = 'a'
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

  const onSubmit = async (data: CreateFillInTheBlanksWithCluesFormData) => {
    setErrorMessage(null)

    try {
      const cluesArray = cluesList.length > 0
        ? cluesList
        : data.cluesText
        ? data.cluesText.split(",").map((c) => c.trim()).filter(Boolean)
        : []

      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      await createMutation.mutateAsync({
        subjectId: data.subjectId,
        chapterId: data.chapterId || null,
        content: data.content.trim(),
        clues: cluesArray,
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
        reference: referenceArray,
      })

      toast.success("Fill in the Blanks with Clues question created successfully.")
      setTimeout(() => {
        router.push("/fill-in-the-blanks-with-clues")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to create question"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/fill-in-the-blanks-with-clues"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Fill in the Blanks with Clues
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Create New</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            New Fill in the Blanks with Clues
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Create a cloze test question with word clues from the box and sequential gap markers.
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
              Question Specifications
            </CardTitle>
            <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
              Fill in academic details, words for the clue box, and the passage with blank gaps.
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

            {/* Clues (Words from the Box) */}
            <div className="space-y-3 rounded-xl border border-primary/20 bg-primary-container/10 p-4">
              <div className="flex items-center justify-between">
                <Label className="font-label-lg text-sm font-bold text-on-surface flex items-center gap-2">
                  <BoxSelect className="size-4 text-primary" />
                  Words in the Box (Clues)
                </Label>
                <span className="text-xs text-outline">{cluesList.length} clue(s) added</span>
              </div>

              {/* Clues input with Add button */}
              <div className="flex gap-2">
                <Input
                  value={newClueInput}
                  onChange={(e) => setNewClueInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddClue()
                    }
                  }}
                  placeholder="Type a clue word (or comma-separated) and press Enter/Add"
                  className="bg-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddClue}
                  className="shrink-0 bg-white border-primary/30 text-primary font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-4" />
                  Add Clue
                </Button>
              </div>

              {/* Pill tags preview */}
              {cluesList.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {cluesList.map((clue, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-primary/30 text-xs font-semibold text-on-surface shadow-2xs"
                    >
                      {clue}
                      <button
                        type="button"
                        onClick={() => handleRemoveClue(idx)}
                        className="text-outline hover:text-error cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-outline italic">No clues added yet. Type words above to build the clue box.</p>
              )}
            </div>

            {/* Content Field with Blank helper */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content-textarea" className="font-label-lg text-sm font-bold text-on-surface">
                  Passage Content with Blanks <span className="text-error">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={insertNextBlank}
                  className="h-7 text-xs px-2.5 rounded-md border-primary/30 text-primary hover:bg-primary/10 font-bold flex items-center gap-1 cursor-pointer"
                  title="Insert next sequential blank marker"
                >
                  <Sparkles className="size-3" />
                  + Insert (a) _________
                </Button>
              </div>

              <Textarea
                id="content-textarea"
                rows={6}
                placeholder="e.g. Complete the following text with suitable words from the box:\n\nStudents should be (a) _________ to their teachers. They should (b) _________ hard and live (c) _________..."
                className="w-full rounded-lg border border-outline-variant bg-white p-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10"
                {...register("content")}
              />
              <p className="text-[11px] text-outline">
                Use indicators like <code className="bg-muted px-1 rounded">(a) _________</code>, <code className="bg-muted px-1 rounded">(b) _________</code> for gap positions.
              </p>
              {errors.content && (
                <p className="font-body-sm text-xs text-error">{errors.content.message}</p>
              )}

              {/* Live Preview Box */}
              <div className="mt-3 rounded-lg border border-outline-variant/40 bg-surface-container-low p-3.5 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-outline">
                  Live Formatted Preview:
                </p>
                <ContentPreview text={contentValue} clues={cluesList} />
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
                <Link href="/fill-in-the-blanks-with-clues">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary text-white hover:bg-primary/90 px-6 py-2.5 text-sm font-bold shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Question"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

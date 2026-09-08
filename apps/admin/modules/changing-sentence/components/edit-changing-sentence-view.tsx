"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useChangingSentenceById,
  useUpdateChangingSentence,
  useSubjectsForSelection,
  useAcademicClassesForSelection,
} from "../services/use-changing-sentence"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Sparkles, Plus, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"

const editChangingSentenceFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  content: z.string().min(1, "Question text/passage or instruction is required"),
  options: z.array(z.object({ value: z.string() })),
  referenceText: z.string().optional(),
  difficulty: z.enum([QUESTION_DIFFICULTY.EASY, QUESTION_DIFFICULTY.MEDIUM, QUESTION_DIFFICULTY.HARD]),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Popularity count must be a number",
  }),
})

type EditChangingSentenceFormData = z.infer<typeof editChangingSentenceFormSchema>

function DirectivePreview({ text }: { text: string }) {
  if (!text?.trim()) return null

  const parts = text.split(/(\([a-zA-Z\s\/-]+\))/g)

  return (
    <div className="leading-relaxed text-sm text-on-surface">
      {parts.map((part, index) => {
        if (/^\([a-zA-Z\s\/-]+\)$/.test(part)) {
          return (
            <span
              key={index}
              className="inline-block px-1.5 py-0.5 mx-0.5 rounded font-semibold font-mono text-xs bg-indigo-500/10 text-indigo-700 border border-indigo-500/20"
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

interface EditChangingSentenceViewProps {
  id: string
}

export function EditChangingSentenceView({ id }: EditChangingSentenceViewProps) {
  const router = useRouter()
  const { data: item, isLoading, isError } = useChangingSentenceById(id)
  const updateMutation = useUpdateChangingSentence()
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
  } = useForm<EditChangingSentenceFormData>({
    resolver: zodResolver(editChangingSentenceFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      content: "",
      options: [],
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  })

  useEffect(() => {
    if (item) {
      const itm = item as any
      reset({
        classId: itm.subject?.classId || "",
        subjectId: itm.subjectId || "",
        content: itm.content || "",
        options: (itm.options || []).map((val: string) => ({ value: val })),
        referenceText: (itm.reference || []).join(", "),
        difficulty: (itm.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
        popularityCount: String(itm.popularityCount || 0),
      })
    }
  }, [item, reset])

  const selectedClassId = watch("classId")
  const watchedContent = watch("content")
  const watchedOptions = watch("options")

  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )

  const onSubmit = async (data: EditChangingSentenceFormData) => {
    setErrorMessage(null)

    const referenceList = data.referenceText
      ? data.referenceText
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean)
      : []

    const optionsList = (data.options || [])
      .map((opt) => opt.value.trim())
      .filter(Boolean)

    const contentVal = data.content?.trim() || null

    if (!contentVal && optionsList.length === 0) {
      const err = "Please provide either a prompt/passage or at least one sentence option."
      setErrorMessage(err)
      toast.error(err)
      return
    }

    try {
      await updateMutation.mutateAsync({
        id,
        subjectId: data.subjectId,
        content: contentVal,
        options: optionsList,
        reference: referenceList,
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
      })

      toast.success("Changing sentence question updated successfully")
      router.push("/changing-sentences")
    } catch (err: any) {
      const message = err?.message || "Failed to update question. Please try again."
      setErrorMessage(message)
      toast.error(message)
    }
  }

  const isSubmitting = isFormSubmitting || updateMutation.isPending

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto py-12 text-center">
        <p className="text-sm text-outline animate-pulse">Loading question details...</p>
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="w-full max-w-md mx-auto py-12 text-center space-y-4">
        <p className="text-sm font-semibold text-destructive">Question not found or failed to load.</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/changing-sentences">Back to List</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-2xl font-bold text-primary">
            Edit Changing Sentence
          </h2>
          <p className="text-sm text-outline">
            Update prompt, discrete sentence directives, board references, or difficulty.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="w-fit cursor-pointer">
          <Link href="/changing-sentences">Back to List</Link>
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instruction / Main Content Card */}
            <Card className="rounded-2xl border-outline-variant/30 bg-surface-container-low shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-on-surface flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Question Prompt / Direction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="content" className="text-xs font-semibold text-on-surface">
                    Prompt / Instruction <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="e.g. Change the following sentences as directed in brackets:"
                    rows={3}
                    className="mt-1.5 bg-surface-container-lowest font-body-md"
                    {...register("content")}
                  />
                  {errors.content && (
                    <p className="text-xs text-destructive mt-1">{errors.content.message}</p>
                  )}
                </div>

                {/* Sentences / Options Builder */}
                <div className="pt-2 border-t border-outline-variant/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-semibold text-on-surface">
                        Sentences to Change (with bracketed directives)
                      </Label>
                      <p className="text-[11px] text-outline">
                        Add individual sentences with transformation directives like (Negative), (Complex), (Passive).
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ value: "" })}
                      className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Sentence
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-outline w-6 text-center shrink-0">
                          #{index + 1}
                        </span>
                        <Input
                          placeholder={`e.g. (${String.fromCharCode(97 + index)}) Sentence text... (Directive)`}
                          className="bg-surface-container-lowest font-body-sm text-xs flex-1"
                          {...register(`options.${index}.value` as const)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-8 w-8 text-outline hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {fields.length === 0 && (
                      <div className="rounded-xl border border-dashed border-outline-variant/40 p-4 text-center">
                        <p className="text-xs text-outline italic">
                          No discrete sentence options added. The question will rely on the main content prompt above.
                        </p>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => append({ value: "" })}
                          className="text-xs mt-1 text-primary cursor-pointer"
                        >
                          + Add sentence option
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Formatted Preview Card */}
            <Card className="rounded-2xl border-outline-variant/30 bg-surface-container-low shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-outline">
                  Live Formatted Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 space-y-3">
                  <div className="font-semibold text-sm text-on-surface">
                    <DirectivePreview text={watchedContent || ""} />
                  </div>
                  {watchedOptions && watchedOptions.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                      {watchedOptions.map((opt, i) => (
                        <div key={i} className="text-xs text-on-surface font-medium pl-2 border-l-2 border-primary/30">
                          <DirectivePreview text={opt.value || ""} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration & Meta (Right 1 col) */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-outline-variant/30 bg-surface-container-low shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-on-surface">
                  Academic Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Academic Class */}
                <div>
                  <Label className="text-xs font-semibold text-on-surface">
                    Academic Class <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="classId"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val)
                          setValue("subjectId", "")
                        }}
                      >
                        <SelectTrigger className="mt-1.5 bg-surface-container-lowest">
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
                  {errors.classId && (
                    <p className="text-xs text-destructive mt-1">{errors.classId.message}</p>
                  )}
                </div>

                {/* Academic Subject */}
                <div>
                  <Label className="text-xs font-semibold text-on-surface">
                    Subject <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="subjectId"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedClassId}
                      >
                        <SelectTrigger className="mt-1.5 bg-surface-container-lowest">
                          <SelectValue
                            placeholder={
                              !selectedClassId ? "Select a class first" : "Select Subject"
                            }
                          />
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
                  {errors.subjectId && (
                    <p className="text-xs text-destructive mt-1">{errors.subjectId.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-outline-variant/30 bg-surface-container-low shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-on-surface">
                  Metadata &amp; Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* References */}
                <div>
                  <Label htmlFor="referenceText" className="text-xs font-semibold text-on-surface">
                    Board References
                  </Label>
                  <Input
                    id="referenceText"
                    placeholder="e.g. Dhaka Board 2024, Rajshahi Board 2023"
                    className="mt-1.5 bg-surface-container-lowest text-xs"
                    {...register("referenceText")}
                  />
                  <p className="text-[11px] text-outline mt-1">Separate multiple boards with commas.</p>
                </div>

                {/* Difficulty */}
                <div>
                  <Label className="text-xs font-semibold text-on-surface">Difficulty</Label>
                  <Controller
                    control={control}
                    name="difficulty"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-1.5 bg-surface-container-lowest text-xs">
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

                {/* Popularity Count */}
                <div>
                  <Label htmlFor="popularityCount" className="text-xs font-semibold text-on-surface">
                    Popularity Count
                  </Label>
                  <Input
                    id="popularityCount"
                    type="number"
                    className="mt-1.5 bg-surface-container-lowest text-xs"
                    {...register("popularityCount")}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
          <Button asChild variant="outline" disabled={isSubmitting}>
            <Link href="/changing-sentences">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[140px] cursor-pointer">
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}

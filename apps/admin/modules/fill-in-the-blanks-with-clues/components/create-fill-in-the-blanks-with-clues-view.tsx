"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller, useFieldArray } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { ArrowLeft, BoxSelect, Plus, X, Trash2, AlertCircle, Loader2, Save } from "lucide-react"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"
import { FILL_IN_THE_BLANKS_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import { PageHeader } from "@/components/shared/page-header"

const createFillInTheBlanksWithCluesFormSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  chapterId: z.string().optional(),
  content: z.string().optional(),
  options: z.array(z.object({ value: z.string() })),
  cluesText: z.string().optional(),
  referenceText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "জনপ্রিয়তা সংখ্যা হতে হবে",
  }),
  source: z.string().optional(),
  session: z.string().optional(),
})

type CreateFillInTheBlanksWithCluesFormData = z.infer<typeof createFillInTheBlanksWithCluesFormSchema>

const difficultyLabels: Record<string, string> = {
  EASY: "সহজ (Easy)",
  MEDIUM: "মাঝারি (Medium)",
  HARD: "কঠিন (Hard)",
}

function ContentPreview({
  text,
  clues,
  options,
}: {
  text?: string
  clues: string[]
  options?: { value: string }[]
}) {
  const hasOptions = options && options.length > 0 && options.some((o) => o.value.trim().length > 0)
  if (!text?.trim() && clues.length === 0 && !hasOptions) return null

  const renderParts = (raw: string) => {
    const parts = raw.split(/(\([a-z]\)\s*_{2,})/gi)
    return parts.map((part, index) => {
      if (/^\([a-z]\)\s*_{2,}/i.test(part)) {
        return (
          <span
            key={index}
            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20"
          >
            {part}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  return (
    <div className="rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/30 dark:bg-indigo-950/10 p-4 space-y-3">
      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
        লাইভ প্রিভিউ:
      </span>
      {clues.length > 0 && (
        <div className="rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 bg-card p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1.5">
            ক্লু বক্স (Words in the Box):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {clues.map((c, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-lg bg-slate-50 dark:bg-white/[0.04] text-xs font-semibold text-foreground border border-slate-200/80 dark:border-white/[0.08]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {text?.trim() && (
        <div className="leading-relaxed text-sm text-foreground whitespace-pre-wrap">
          {renderParts(text)}
        </div>
      )}

      {hasOptions && (
        <div className="space-y-1.5 border-t border-slate-200/60 dark:border-white/[0.08] pt-2">
          {options
            ?.filter((o) => o.value.trim().length > 0)
            .map((opt, oIdx) => (
              <div key={oIdx} className="leading-relaxed text-sm text-foreground flex gap-2">
                <span className="font-bold text-indigo-600 dark:text-primary shrink-0">#{oIdx + 1}</span>
                <div className="flex-1">{renderParts(opt.value)}</div>
              </div>
            ))}
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
      options: [],
      cluesText: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
      source: DEFAULT_SOURCE,
      session: new Date().getFullYear().toString(),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  })

  const selectedClassId = watch("classId")
  const selectedSubjectId = watch("subjectId")
  const contentValue = watch("content") || ""
  const watchedOptions = watch("options")

  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

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

  const onSubmit = async (data: CreateFillInTheBlanksWithCluesFormData) => {
    setErrorMessage(null)

    const optionsList = (data.options || []).map((o) => o.value.trim()).filter(Boolean)
    const contentVal = data.content?.trim() || null

    if (!contentVal && optionsList.length === 0) {
      const msg = "অনুগ্রহ করে অনুচ্ছেদ অথবা কমপক্ষে একটি বাক্য প্রদান করুন।"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean)
        : []

      await createMutation.mutateAsync({
        subjectId: data.subjectId,
        chapterId: data.chapterId || null,
        content: contentVal,
        options: optionsList,
        clues: cluesList,
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
        reference: referenceArray,
        source: data.source?.trim() || DEFAULT_SOURCE,
        session: data.session?.trim() || new Date().getFullYear().toString(),
      })

      toast.success("শূন্যস্থান প্রশ্নটি সফলভাবে তৈরি করা হয়েছে।")
      setTimeout(() => {
        router.push("/fill-in-the-blanks-with-clues")
      }, 800)
    } catch (err: any) {
      const msg = err.message || "প্রশ্ন তৈরিতে সমস্যা হয়েছে"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <PageHeader
        title="নতুন শূন্যস্থান পূরণ (ক্লুসহ) তৈরি"
        description="শ্রেণি, বিষয় ও অধ্যায় নির্বাচন করে ক্লু-বক্স, অনুচ্ছেদ, বাক্য এবং রেফারেন্স যুক্ত করুন।"
        icon={BoxSelect}
        badge={{ label: "নতুন With Clues", variant: "indigo" }}
        breadcrumbs={[
          { label: "শূন্যস্থান (ক্লুসহ) তালিকা", href: "/fill-in-the-blanks-with-clues" },
          { label: "নতুন যোগ করুন" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Link href="/fill-in-the-blanks-with-clues" prefetch={true}>
            <ArrowLeft className="w-4 h-4" />
            <span>তালিকায় ফিরে যান</span>
          </Link>
        </Button>
      </PageHeader>

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-4 text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-7 flex flex-row items-center gap-3.5 sm:gap-4">
          <div className="flex size-11 sm:size-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary border border-indigo-100/80 dark:border-primary/20 shrink-0">
            <BoxSelect className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold font-headline text-foreground">
              প্রশ্নের বিবরণ ও ক্লু কনফিগারেশন
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              শ্রেণি, বিষয়, অধ্যায়, ক্লু শব্দসমূহ, অনুচ্ছেদ ও বাক্য পূরণ করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  শ্রেণি (Academic Class) <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="classId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isSubmitting}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("subjectId", "")
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm h-11 px-4 justify-between">
                        <SelectValue placeholder="শ্রেণি নির্বাচন করুন..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-64">
                        {academicClasses.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.nameBn || cls.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.classId && (
                  <p className="text-xs font-medium text-rose-500">{errors.classId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  বিষয় (Subject) <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="subjectId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isSubmitting || !selectedClassId}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm h-11 px-4 justify-between">
                        <SelectValue placeholder={selectedClassId ? "বিষয় নির্বাচন করুন..." : "প্রথমে শ্রেণি নির্বাচন করুন"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-64">
                        {subjects.map((subj) => (
                          <SelectItem key={subj.id} value={subj.id}>
                            {subj.nameBn || subj.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subjectId && (
                  <p className="text-xs font-medium text-rose-500">{errors.subjectId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  অধ্যায় (Chapter — ঐচ্ছিক)
                </Label>
                <Controller
                  name="chapterId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isSubmitting || !selectedSubjectId}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm h-11 px-4 justify-between">
                        <SelectValue placeholder={selectedSubjectId ? "অধ্যায় নির্বাচন করুন..." : "প্রথমে বিষয় নির্বাচন করুন"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-64">
                        {chapters.map((ch) => (
                          <SelectItem key={ch.id} value={ch.id}>
                            {ch.nameBn || ch.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Clues Box Builder */}
            <div className="space-y-3">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ক্লু বক্সের শব্দসমূহ (Words in the Box)
              </Label>
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
                  disabled={isSubmitting}
                  placeholder="শব্দ লিখুন বা কমা দিয়ে একাধিক শব্দ যোগ করুন (Enter চাপুন)..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4 text-sm"
                />
                <Button
                  type="button"
                  onClick={handleAddClue}
                  disabled={isSubmitting || !newClueInput.trim()}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-4 text-xs font-bold gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>যোগ করুন</span>
                </Button>
              </div>
              {cluesList.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {cluesList.map((clue, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/40 text-xs font-semibold"
                    >
                      <span>{clue}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveClue(idx)}
                        className="hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Passage Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                অনুচ্ছেদ / প্যাসেজ (Passage Content)
              </Label>
              <Textarea
                id="content"
                rows={4}
                disabled={isSubmitting}
                placeholder="উদাহরণ: Patriotism is a (a) ________ virtue..."
                {...register("content")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] p-4 text-sm text-foreground outline-hidden focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:opacity-50"
              />
            </div>

            {/* Sentence Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  বাক্য অপশনসমূহ (Sentence Options — ঐচ্ছিক)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ value: "" })}
                  disabled={isSubmitting}
                  className="h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>বাক্য যোগ করুন</span>
                </Button>
              </div>
              <div className="space-y-2.5">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      disabled={isSubmitting}
                      placeholder={`বাক্য ${index + 1}`}
                      {...register(`options.${index}.value`)}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={isSubmitting}
                      className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <ContentPreview text={contentValue} clues={cluesList} options={watchedOptions} />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  কঠিনতার স্তর
                </Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select disabled={isSubmitting} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {difficultyLabels[opt.value] || opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  উৎস (Source)
                </Label>
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <Select disabled={isSubmitting} value={field.value || DEFAULT_SOURCE} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {FILL_IN_THE_BLANKS_SOURCE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  সেশন / বছর
                </Label>
                <Input
                  id="session"
                  disabled={isSubmitting}
                  {...register("session")}
                  className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="popularityCount" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  জনপ্রিয়তা সংখ্যা
                </Label>
                <Input
                  id="popularityCount"
                  type="number"
                  disabled={isSubmitting}
                  {...register("popularityCount")}
                  className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4 text-sm"
                />
                {errors.popularityCount && (
                  <p className="text-xs font-medium text-rose-500">{errors.popularityCount.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceText" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                রেফারেন্স / বোর্ড ট্যাগ (References)
              </Label>
              <Input
                id="referenceText"
                type="text"
                disabled={isSubmitting}
                placeholder="কমা দিয়ে একাধিক রেফারেন্স লিখুন..."
                {...register("referenceText")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <Button
                asChild
                variant="outline"
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 dark:border-white/[0.08] px-5 h-11 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                <Link href="/fill-in-the-blanks-with-clues">বাতিল</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 h-11 text-xs sm:text-sm font-bold text-white shadow-sm shadow-indigo-200 dark:shadow-none transition-all cursor-pointer disabled:opacity-50 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>সংরক্ষণ করুন</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

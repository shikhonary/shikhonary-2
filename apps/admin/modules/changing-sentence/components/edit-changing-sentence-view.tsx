"use client"

import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"
import { PageHeader } from "@/components/shared/page-header"
import { ArrowLeft, Sparkles, Plus, Trash2, AlertCircle, Loader2, Save } from "lucide-react"

const editChangingSentenceFormSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  content: z.string().optional(),
  options: z.array(z.object({ value: z.string() })),
  referenceText: z.string().optional(),
  difficulty: z.enum([QUESTION_DIFFICULTY.EASY, QUESTION_DIFFICULTY.MEDIUM, QUESTION_DIFFICULTY.HARD]),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "জনপ্রিয়তা সংখ্যা হতে হবে",
  }),
})

type EditChangingSentenceFormData = z.infer<typeof editChangingSentenceFormSchema>

const difficultyLabels: Record<string, string> = {
  EASY: "সহজ (Easy)",
  MEDIUM: "মাঝারি (Medium)",
  HARD: "কঠিন (Hard)",
}

function DirectivePreview({ text }: { text: string }) {
  if (!text?.trim()) return null

  const parts = text.split(/(\([a-zA-Z\s\/-]+\))/g)

  return (
    <div className="leading-relaxed text-sm text-foreground">
      {parts.map((part, index) => {
        if (/^\([a-zA-Z\s\/-]+\)$/.test(part)) {
          return (
            <span
              key={index}
              className="inline-block px-1.5 py-0.5 mx-0.5 rounded font-semibold font-mono text-xs bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
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
  const searchParams = useSearchParams()
  const queryString = searchParams?.toString()
  const listHref = queryString ? `/changing-sentences?${queryString}` : "/changing-sentences"

  const { data: item, isLoading, isError } = useChangingSentenceById(id)
  const updateMutation = useUpdateChangingSentence()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const initialClassId = useMemo(() => {
    if (!item) return ""
    const itm = item as any
    return (
      itm.subject?.classSubjects?.[0]?.classId ||
      itm.subject?.classId ||
      itm.classId ||
      ""
    )
  }, [item])

  const formValues = useMemo<EditChangingSentenceFormData | undefined>(() => {
    if (!item) return undefined
    const itm = item as any
    return {
      classId: initialClassId,
      subjectId: itm.subjectId || "",
      content: itm.content || "",
      options: (itm.options || []).map((val: string) => ({ value: val })),
      referenceText: (itm.reference || []).join(", "),
      difficulty: (itm.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: String(itm.popularityCount || 0),
    }
  }, [item, initialClassId])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
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
    values: formValues,
    resetOptions: {
      keepDirtyValues: true,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  })

  const selectedClassId = watch("classId")
  const activeClassId = selectedClassId || initialClassId
  const watchedContent = watch("content")
  const watchedOptions = watch("options")

  const { data: subjects = [] } = useSubjectsForSelection(
    activeClassId ? { academicClassId: activeClassId } : undefined
  )

  const combinedClasses = useMemo(() => {
    const map = new Map<string, any>()
    const subjectClass = (item as any)?.subject?.classSubjects?.[0]?.academicClass
    if (subjectClass) {
      map.set(subjectClass.id, subjectClass)
    }
    for (const cls of academicClasses) {
      map.set(cls.id, cls)
    }
    return Array.from(map.values())
  }, [academicClasses, item])

  const combinedSubjects = useMemo(() => {
    const map = new Map<string, any>()
    if ((item as any)?.subject) {
      map.set((item as any).subject.id, (item as any).subject)
    }
    for (const sub of subjects) {
      map.set(sub.id, sub)
    }
    return Array.from(map.values())
  }, [subjects, item])

  const isSubmitting = updateMutation.isPending || isFormSubmitting

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
      const err = "অনুগ্রহ করে নির্দেশনা অথবা কমপক্ষে একটি বাক্য প্রদান করুন।"
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

      toast.success("বাক্য রূপান্তর প্রশ্নটি সফলভাবে আপডেট করা হয়েছে।")
      setTimeout(() => {
        router.push(listHref)
      }, 800)
    } catch (err: any) {
      const message = err?.message || "বাক্য রূপান্তর আপডেট করতে সমস্যা হয়েছে।"
      setErrorMessage(message)
      toast.error(message)
    }
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground space-y-3">
        <Loader2 className="w-7 h-7 animate-spin mx-auto text-indigo-600" />
        <p className="text-sm font-medium">বাক্য রূপান্তরের তথ্য লোড হচ্ছে...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-16 text-center text-rose-600 border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/10 rounded-2xl">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-bold">বাক্য রূপান্তর লোড করা যায়নি</p>
        <p className="text-xs text-muted-foreground mt-1">অনুগ্রহ করে URL যাচাই করুন অথবা পৃষ্ঠাটি রিলোড দিন।</p>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <PageHeader
        title="বাক্য রূপান্তর সম্পাদনা করুন"
        description="শ্রেণি-বিষয়, নির্দেশনা, বাক্যসমূহ, কঠিনতা এবং রেফারেন্স তথ্য হালনাগাদ করুন।"
        icon={Sparkles}
        badge={{ label: "Changing Sentence সম্পাদনা", variant: "indigo" }}
        breadcrumbs={[
          { label: "বাক্য রূপান্তর তালিকা", href: listHref },
          { label: "সম্পাদনা" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Link href={listHref} prefetch={true}>
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
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold font-headline text-foreground">
              প্রশ্নের বিবরণ ও বাক্য কনফিগারেশন
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              শ্রেণি, বিষয়, মূল নির্দেশনা, বাক্য তালিকা, কঠিনতা এবং রেফারেন্স হালনাগাদ করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  শ্রেণি (Academic Class) <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="classId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`class-select-${field.value || "empty"}-${combinedClasses.length}`}
                      disabled={isSubmitting}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("subjectId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                        <SelectValue placeholder="শ্রেণি নির্বাচন করুন..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64">
                        {combinedClasses.map((cls) => (
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
                      key={`subject-select-${field.value || "empty"}-${combinedSubjects.length}`}
                      disabled={isSubmitting || !activeClassId}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50">
                        <SelectValue placeholder={activeClassId ? "বিষয় নির্বাচন করুন..." : "প্রথমে শ্রেণি নির্বাচন করুন"} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64">
                        {combinedSubjects.map((subj) => (
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                নির্দেশনা / প্রশ্ন শিরোনাম (Instruction / Prompt)
              </Label>
              <Textarea
                id="content"
                rows={2}
                disabled={isSubmitting}
                placeholder="Change the following sentences as directed in brackets:"
                {...register("content")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] p-4 text-sm text-foreground outline-hidden focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:opacity-50"
              />
            </div>

            {/* Sentence Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  বাক্যসমূহ (Sentences with Directives)
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
                      className="flex-1 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4 text-sm text-foreground outline-hidden focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
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

              {(watchedContent || watchedOptions?.some((o) => o.value?.trim())) && (
                <div className="rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/30 dark:bg-indigo-950/10 p-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    লাইভ প্রিভিউ:
                  </span>
                  {watchedContent && <DirectivePreview text={watchedContent} />}
                  <div className="space-y-1 pl-3 border-l-2 border-indigo-400/50">
                    {watchedOptions?.map((opt, idx) =>
                      opt.value?.trim() ? <DirectivePreview key={idx} text={opt.value} /> : null
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  কঠিনতার স্তর (Difficulty)
                </Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`difficulty-select-${field.value || "empty"}`}
                      disabled={isSubmitting}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                        <SelectValue placeholder="কঠিনতার স্তর নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
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
                <Label htmlFor="popularityCount" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  জনপ্রিয়তা সংখ্যা (Popularity Count)
                </Label>
                <Input
                  id="popularityCount"
                  type="number"
                  disabled={isSubmitting}
                  placeholder="0"
                  {...register("popularityCount")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4 text-sm text-foreground outline-hidden focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:opacity-50"
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
                placeholder="কমা দিয়ে একাধিক রেফারেন্স লিখুন (যেমন: Dhaka Board 2024, Cumilla Board 2023)..."
                {...register("referenceText")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4 text-sm text-foreground outline-hidden focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:opacity-50"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <Button
                asChild
                variant="outline"
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 dark:border-white/[0.08] px-5 h-11 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                <Link href={listHref}>বাতিল</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 h-11 text-xs sm:text-sm font-bold text-white shadow-sm shadow-indigo-200 dark:shadow-none transition-all cursor-pointer disabled:opacity-50 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>আপডেট হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>আপডেট সংরক্ষণ করুন</span>
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

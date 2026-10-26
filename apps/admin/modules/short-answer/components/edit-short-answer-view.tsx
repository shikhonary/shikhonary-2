"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useShortAnswerById,
  useUpdateShortAnswer,
  useSubjectsForSelection,
  useChaptersForSelection,
  useAcademicClassesForSelection,
} from "../services/use-short-answer"
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
import { RenderMath } from "@workspace/ui/components/render-math"
import { PageHeader } from "@/components/shared/page-header"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"
import { SHORT_ANSWER_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import {
  ArrowLeft,
  Clock,
  Loader2,
  Save,
  AlertCircle,
  HelpCircle,
  Edit3,
  Trash2,
  Plus,
} from "lucide-react"

const updateShortAnswerFormSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করা আবশ্যক"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করা আবশ্যক"),
  chapterId: z.string().min(1, "অধ্যায় নির্বাচন করা আবশ্যক"),
  question: z.string().min(1, "প্রশ্ন লেখা আবশ্যক"),
  answer: z.string().optional(),
  options: z.array(z.object({ value: z.string() })),
  isMath: z.boolean(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  referenceText: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  isActive: z.boolean(),
})

type UpdateShortAnswerFormData = z.infer<typeof updateShortAnswerFormSchema>

export interface EditShortAnswerViewProps {
  id?: string
}

export function EditShortAnswerView({ id }: EditShortAnswerViewProps = {}) {
  const router = useRouter()
  const params = useParams()
  const shortAnswerId = id || (params?.id as string)

  const { data: saData, isLoading: isSaLoading, isError } = useShortAnswerById(shortAnswerId)
  const updateMutation = useUpdateShortAnswer()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const initialClassId = useMemo(() => {
    if (!saData) return ""
    return (
      (saData as any)?.subject?.classSubjects?.[0]?.academicClass?.id ||
      (saData as any)?.subject?.classSubjects?.[0]?.classId ||
      ""
    )
  }, [saData])

  const formValues = useMemo<UpdateShortAnswerFormData | undefined>(() => {
    if (!saData) return undefined

    return {
      classId: initialClassId,
      subjectId: saData.subjectId,
      chapterId: saData.chapterId,
      question: saData.question,
      answer: saData.answer || "",
      options: Array.isArray((saData as any).options)
        ? (saData as any).options.map((opt: string) => ({ value: opt }))
        : [],
      isMath: Boolean((saData as any).isMath),
      difficulty: (saData.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
      referenceText: (saData.reference || []).join(", "),
      source: (saData as any).source || DEFAULT_SOURCE,
      session: (saData as any).session || ((saData as any).year ? String((saData as any).year) : ""),
      isActive: Boolean(saData.isActive),
    }
  }, [saData, initialClassId])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<UpdateShortAnswerFormData>({
    resolver: zodResolver(updateShortAnswerFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      question: "",
      answer: "",
      options: [],
      isMath: false,
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
      source: DEFAULT_SOURCE,
      session: String(new Date().getFullYear()),
      isActive: true,
    },
    values: formValues,
    resetOptions: {
      keepDirtyValues: true,
    },
  })

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: "options",
  })

  const selectedClassId = watch("classId")
  const activeClassId = selectedClassId || initialClassId

  const { data: subjects = [] } = useSubjectsForSelection(
    activeClassId ? { academicClassId: activeClassId } : undefined
  )

  const selectedSubjectId = watch("subjectId")
  const activeSubjectId = selectedSubjectId || saData?.subjectId

  const { data: chapters = [] } = useChaptersForSelection(
    activeSubjectId ? { subjectId: activeSubjectId } : undefined
  )

  const watchQuestion = watch("question")
  const watchAnswer = watch("answer")
  const watchIsMath = watch("isMath")

  // Ensure initial academic class is immediately present in options (Pillar 4)
  const combinedClasses = useMemo(() => {
    const map = new Map<string, any>()
    const initialClass = (saData as any)?.subject?.classSubjects?.[0]?.academicClass
    if (initialClass) {
      map.set(initialClass.id, initialClass)
    }
    for (const cls of academicClasses) {
      map.set(cls.id, cls)
    }
    return Array.from(map.values())
  }, [academicClasses, saData])

  // Ensure subject from item is immediately present in options (Pillar 4)
  const combinedSubjects = useMemo(() => {
    const map = new Map<string, any>()
    if (saData?.subject) {
      map.set(saData.subject.id, saData.subject)
    }
    for (const sub of subjects) {
      map.set(sub.id, sub)
    }
    return Array.from(map.values())
  }, [subjects, saData?.subject])

  // Ensure chapter from item is immediately present in options (Pillar 4)
  const combinedChapters = useMemo(() => {
    const map = new Map<string, any>()
    const initialChapter = (saData as any)?.chapter
    if (initialChapter) {
      map.set(initialChapter.id, initialChapter)
    }
    for (const ch of chapters) {
      map.set(ch.id, ch)
    }
    return Array.from(map.values())
  }, [chapters, saData])

  // Ensure source is present in source options list (Pillar 4)
  const combinedSources = useMemo(() => {
    const list: { value: string; label: string }[] = [...SHORT_ANSWER_SOURCE_OPTIONS]
    const currentSource = (saData as any)?.source ? String((saData as any).source).trim() : null
    if (currentSource && !list.some((s) => s.value === currentSource)) {
      list.unshift({ value: currentSource, label: currentSource })
    }
    return list
  }, [saData])

  const isSubmitting = updateMutation.isPending || isFormSubmitting || isSaLoading

  const onSubmit = async (data: UpdateShortAnswerFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const optionsArray = (data.options || [])
        .map((o) => o.value.trim())
        .filter((o) => o.length > 0)

      const parsedYear = data.session && !isNaN(Number(data.session))
        ? Number(data.session)
        : null

      await updateMutation.mutateAsync({
        id: shortAnswerId,
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        question: data.question.trim(),
        answer: data.answer?.trim() || null,
        options: optionsArray,
        isMath: data.isMath,
        difficulty: data.difficulty,
        reference: referenceArray,
        source: data.source?.trim() || null,
        session: data.session?.trim() || null,
        year: parsedYear,
        isActive: data.isActive,
        attachments: (saData as any)?.attachments || [],
      })

      toast.success("সংক্ষিপ্ত উত্তর সফলভাবে হালনাগাদ করা হয়েছে।")
      setTimeout(() => {
        router.push("/short-answers")
      }, 800)
    } catch (err: any) {
      const msg = err.message || "সংক্ষিপ্ত উত্তর আপডেট করা সম্ভব হয়নি"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isSaLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-8 space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 dark:bg-white/10 rounded-xl" />
        <div className="h-96 w-full bg-slate-200 dark:bg-white/10 rounded-2xl" />
      </div>
    )
  }

  if (isError || !saData) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-6 text-center">
        <div className="p-8 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400 font-headline">
            সংক্ষিপ্ত উত্তর পাওয়া যায়নি
          </h3>
          <p className="text-sm text-rose-600/80 mt-1 max-w-sm mx-auto font-body">
            অনুরোধকৃত সংক্ষিপ্ত উত্তর প্রশ্নটির রেকর্ড খুঁজে পাওয়া যায়নি বা মুছে ফেলা হয়েছে।
          </p>
          <div className="mt-6">
            <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 font-headline">
              <Link href="/short-answers" prefetch={true}>
                তালিকায় ফিরে যান
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12">
      {/* Shared Page Header */}
      <PageHeader
        title="সংক্ষিপ্ত উত্তর প্রশ্ন সম্পাদনা"
        description="শ্রেণি, বিষয় ও অধ্যায় ভিত্তিক সংক্ষিপ্ত উত্তর প্রশ্ন, অপশন, সমাধান ও ব্যাখ্যা হালনাগাদ করুন।"
        icon={Edit3}
        badge={{ label: "সম্পাদনা", variant: "indigo" }}
        breadcrumbs={[
          { label: "সংক্ষিপ্ত উত্তর তালিকা", href: "/short-answers" },
          { label: "সম্পাদনা" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs font-headline"
        >
          <Link href="/short-answers" prefetch={true}>
            <ArrowLeft className="w-4 h-4" />
            <span>তালিকায় ফিরে যান</span>
          </Link>
        </Button>
      </PageHeader>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-4 text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Main Form Card */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-7 flex flex-row items-center gap-3.5 sm:gap-4">
          <div className="flex size-11 sm:size-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary border border-indigo-100/80 dark:border-primary/20 shrink-0">
            <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold font-headline text-foreground">
              সংক্ষিপ্ত উত্তর প্রশ্নের বিবরণ ও কনফিগারেশন
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              শ্রেণি, বিষয়, অধ্যায়, প্রশ্নের বিবরণ, উত্তর ও অপশন নির্ভুলভাবে হালনাগাদ করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Cascading selectors dropdown grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Academic Class */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  শ্রেণি (Academic Class) <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="classId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`class-select-${field.value}-${combinedClasses.length}`}
                      disabled={isSubmitting}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("subjectId", "")
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between font-body">
                        <SelectValue placeholder="শ্রেণি নির্বাচন করুন..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
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
                  <p className="text-xs text-rose-500 font-medium font-body">{errors.classId.message}</p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  বিষয় (Subject) <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="subjectId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`subject-select-${field.value}-${combinedSubjects.length}`}
                      disabled={isSubmitting || !activeClassId}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between font-body disabled:opacity-50">
                        <SelectValue placeholder={activeClassId ? "বিষয় নির্বাচন করুন..." : "প্রথমে শ্রেণি নির্বাচন করুন"} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
                        {combinedSubjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.nameBn || sub.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subjectId && (
                  <p className="text-xs text-rose-500 font-medium font-body">{errors.subjectId.message}</p>
                )}
              </div>

              {/* Chapter */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  অধ্যায় (Chapter) <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="chapterId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`chapter-select-${field.value}-${combinedChapters.length}`}
                      disabled={isSubmitting || !activeSubjectId}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between font-body disabled:opacity-50">
                        <SelectValue
                          placeholder={
                            activeSubjectId
                              ? "অধ্যায় নির্বাচন করুন..."
                              : "প্রথমে বিষয় নির্বাচন করুন"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
                        {combinedChapters.map((ch) => (
                          <SelectItem key={ch.id} value={ch.id}>
                            {ch.nameBn || ch.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.chapterId && (
                  <p className="text-xs text-rose-500 font-medium font-body">{errors.chapterId.message}</p>
                )}
              </div>
            </div>

            {/* Question Text & Live Preview */}
            <div className="space-y-3 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                প্রশ্ন (Question Stem) <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                disabled={isSubmitting}
                rows={4}
                placeholder="সংক্ষিপ্ত উত্তর প্রশ্ন লিখুন... (LaTeX সমর্থন করে, যেমন $E=mc^2$)"
                {...register("question")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5 font-body leading-relaxed"
              />
              {errors.question && (
                <p className="text-xs text-rose-500 font-medium font-body">{errors.question.message}</p>
              )}

              {/* Question Live Preview */}
              {watchQuestion && (
                <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/40 dark:bg-white/[0.01] p-3 text-xs">
                  <span className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider block mb-1 font-headline">
                    প্রশ্ন প্রিভিউ:
                  </span>
                  <div className="text-sm font-medium text-foreground font-body">
                    <RenderMath text={watchQuestion} isMath={watchIsMath} />
                  </div>
                </div>
              )}
            </div>

            {/* Answer Text & Live Preview */}
            <div className="space-y-3">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                আদর্শ উত্তর ও সমাধান নির্দেশিকা (ঐচ্ছিক)
              </Label>
              <Textarea
                disabled={isSubmitting}
                rows={4}
                placeholder="সঠিক উত্তর বা মূল্যায়ন সমাধান লিখুন... (LaTeX সমর্থন করে)"
                {...register("answer")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5 font-body leading-relaxed"
              />
              {errors.answer && (
                <p className="text-xs text-rose-500 font-medium font-body">{errors.answer.message}</p>
              )}

              {/* Answer Live Preview */}
              {watchAnswer && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs">
                  <span className="font-bold text-[11px] text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block mb-1 font-headline">
                    উত্তর প্রিভিউ:
                  </span>
                  <div className="text-sm font-medium text-foreground font-body">
                    <RenderMath text={watchAnswer} isMath={watchIsMath} />
                  </div>
                </div>
              )}
            </div>

            {/* Answer Options (Optional) */}
            <div className="space-y-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                    উত্তর অপশনসমূহ (ঐচ্ছিক)
                  </Label>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    যদি প্রশ্নটিতে বহুনির্বাচনী বা একাধিক বিকল্প অপশন থাকে তবে তা যোগ করুন।
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendOption({ value: "" })}
                  className="rounded-xl border border-indigo-200 dark:border-primary/20 text-indigo-600 dark:text-primary hover:bg-indigo-50 dark:hover:bg-primary/10 text-xs font-bold flex items-center gap-1.5 h-8 px-3 cursor-pointer font-headline"
                >
                  <Plus className="size-3.5" />
                  <span>অপশন যোগ করুন</span>
                </Button>
              </div>

              {optionFields.length > 0 && (
                <div className="space-y-2.5">
                  {optionFields.map((field, index) => {
                    const labels = ["(ক)", "(খ)", "(গ)", "(ঘ)", "(ঙ)", "(চ)"]
                    return (
                      <div key={field.id} className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-indigo-600 dark:text-primary w-8 text-center shrink-0 font-headline">
                          {labels[index] || `(${index + 1})`}
                        </span>
                        <Input
                          disabled={isSubmitting}
                          placeholder={`অপশন ${index + 1}...`}
                          {...register(`options.${index}.value` as const)}
                          className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm font-body"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 h-9 w-9 p-0 rounded-xl cursor-pointer shrink-0"
                          title="মুছুন"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Difficulty, Source, Session & References Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  কঠিনতার মাত্রা (Difficulty)
                </Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`diff-select-${field.value}`}
                      disabled={isSubmitting}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between font-body">
                        <SelectValue placeholder="কঠিনতা নির্বাচন করুন..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
                        {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.value === "EASY" ? "সহজ" : opt.value === "MEDIUM" ? "মাঝারি" : "কঠিন"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Source */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  উৎস (Source)
                </Label>
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`source-select-${field.value}-${combinedSources.length}`}
                      disabled={isSubmitting}
                      value={field.value || DEFAULT_SOURCE}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between font-body">
                        <SelectValue placeholder="উৎস নির্বাচন করুন..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
                        {combinedSources.map((opt) => (
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
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  সাল / সেশন (ঐচ্ছিক)
                </Label>
                <Input
                  disabled={isSubmitting}
                  type="text"
                  placeholder="যেমন: ২০২৬ বা ২০২৫-২৬"
                  {...register("session")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                />
                {errors.session && (
                  <p className="text-xs text-rose-500 font-medium font-body">{errors.session.message}</p>
                )}
              </div>

              {/* Textbook References */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  রেফারেন্স ট্যাগ (কমা দিয়ে আলাদা করুন)
                </Label>
                <Input
                  disabled={isSubmitting}
                  type="text"
                  placeholder="যেমন: পাঠ্যবই ৩য় অধ্যায়, পাঞ্জেরী ২০২৪"
                  {...register("referenceText")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                />
              </div>
            </div>

            {/* Settings Grid (Math & Active) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              {/* Math / LaTeX Formula */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4">
                <div>
                  <p className="text-sm font-bold text-foreground font-headline">
                    গণিত / LaTeX সমীকরণ
                  </p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    প্রশ্ন বা উত্তরে LaTeX সমীকরণ রেন্ডার করতে এটি সক্রিয় করুন।
                  </p>
                </div>
                <Controller
                  name="isMath"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={Boolean(field.value)}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                    />
                  )}
                />
              </div>

              {/* Active Visibility Toggler */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4">
                <div>
                  <p className="text-sm font-bold text-foreground font-headline">
                    অ্যাক্টিভ প্রশ্ন স্ট্যাটাস
                  </p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    প্রশ্নটি সরাসরি প্রশ্ন ব্যাংকে সক্রিয় ও প্রদর্শনযোগ্য রাখতে এটি চেক করুন।
                  </p>
                </div>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={Boolean(field.value)}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                    />
                  )}
                />
              </div>
            </div>

            {/* Form Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6 sm:pt-8 mt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>সংক্ষিপ্ত উত্তর প্রশ্নটির পরিবর্তনগুলো সংরক্ষিত হবে</span>
              </div>
              <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold px-6 h-11 text-sm transition-all active:scale-95 cursor-pointer font-headline"
                >
                  <Link href="/short-answers" prefetch={true}>
                    বাতিল
                  </Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 h-11 text-sm shadow-sm shadow-indigo-200 dark:shadow-none transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 font-headline"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  ) : (
                    <Save className="w-4 h-4 shrink-0" />
                  )}
                  <span>{isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ করুন"}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

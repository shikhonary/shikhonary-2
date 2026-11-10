"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useSummaryById,
  useUpdateSummary,
  useSubjectsForSelection,
  useAcademicClassesForSelection,
} from "../services/use-summary"
import { useQuestionTypesList } from "@/modules/question-type/services/use-question-type"
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
import { SUMMARY_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import { RenderMath } from "@workspace/ui/components/render-math"
import { PageHeader } from "@/components/shared/page-header"
import {
  FileText,
  ArrowLeft,
  Clock,
  Loader2,
  Save,
  AlertCircle,
  BookOpen,
  Sparkles,
} from "lucide-react"

const editSummaryFormSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  title: z.string().min(1, "সারাংশ বা সারমর্ম অনুচ্ছেদ আবশ্যক"),
  isMath: z.boolean(),
  referenceText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  source: z.string().optional(),
  session: z.string().optional(),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "ভিউ সংখ্যা অবশ্যই সংখ্যা হতে হবে",
  }),
  questionTypeId: z.string().optional(),
  isActive: z.boolean(),
})

type EditSummaryFormData = z.infer<typeof editSummaryFormSchema>

export function EditSummaryView() {
  const router = useRouter()
  const params = useParams()
  const summaryId = params.id as string

  const { data: summaryData, isLoading: isSummaryLoading, isError } = useSummaryById(summaryId)
  const updateMutation = useUpdateSummary()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: questionTypesData } = useQuestionTypesList({ limit: 100 })
  const questionTypes = questionTypesData?.questionTypes ?? []

  // Resolve initial classId robustly from subject relationships
  const initialClassId = useMemo(() => {
    if (!summaryData) return ""
    return (
      (summaryData as any).subject?.classSubjects?.[0]?.classId ||
      (summaryData as any).subject?.classSubjects?.[0]?.academicClass?.id ||
      (summaryData as any).subject?.classSubjects?.[0]?.academicClassId ||
      (summaryData as any).classId ||
      ""
    )
  }, [summaryData])

  // Synchronize form values directly with loaded Summary data
  const formValues = useMemo<EditSummaryFormData | undefined>(() => {
    if (!summaryData) return undefined

    return {
      classId: initialClassId,
      subjectId: summaryData.subjectId || "",
      title: summaryData.title || "",
      isMath: true,
      referenceText: summaryData.reference?.join(", ") || "",
      difficulty: (summaryData.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
      source: summaryData.source ? String(summaryData.source).trim() : DEFAULT_SOURCE,
      session: summaryData.session || new Date().getFullYear().toString(),
      popularityCount: String(summaryData.popularityCount ?? 0),
      questionTypeId: summaryData.questionTypeId || "",
      isActive: summaryData.isActive !== undefined ? summaryData.isActive : true,
    }
  }, [summaryData, initialClassId])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditSummaryFormData>({
    resolver: zodResolver(editSummaryFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      title: "",
      isMath: true,
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      source: DEFAULT_SOURCE,
      session: new Date().getFullYear().toString(),
      popularityCount: "0",
      questionTypeId: "",
      isActive: true,
    },
    values: formValues,
    resetOptions: {
      keepDirtyValues: true,
    },
  })

  const selectedClassId = watch("classId")
  const activeClassId = selectedClassId || initialClassId
  const watchTitle = watch("title")
  const watchIsMath = watch("isMath")
  const { data: subjects = [] } = useSubjectsForSelection(
    activeClassId ? { academicClassId: activeClassId } : undefined
  )

  // Ensure academic class for this Summary is always present in selection list
  const combinedClasses = useMemo(() => {
    const map = new Map<string, any>()
    const subjectClass = (summaryData as any)?.subject?.classSubjects?.[0]?.academicClass
    if (subjectClass) {
      map.set(subjectClass.id, subjectClass)
    }
    for (const cls of academicClasses) {
      map.set(cls.id, cls)
    }
    return Array.from(map.values())
  }, [academicClasses, summaryData])

  // Ensure subject from Summary is immediately present in options even before async query finishes
  const combinedSubjects = useMemo(() => {
    const map = new Map<string, any>()
    if (summaryData?.subject && (!activeClassId || activeClassId === initialClassId)) {
      map.set(summaryData.subject.id, summaryData.subject)
    }
    for (const sub of subjects) {
      map.set(sub.id, sub)
    }
    return Array.from(map.values())
  }, [subjects, summaryData?.subject, activeClassId, initialClassId])

  // Ensure source from Summary is immediately present in source options list
  const combinedSources = useMemo(() => {
    const list: { value: string; label: string }[] = [...SUMMARY_SOURCE_OPTIONS]
    const currentSource = (summaryData as any)?.source ? String((summaryData as any).source).trim() : null
    if (currentSource && !list.some((s) => s.value === currentSource)) {
      list.unshift({ value: currentSource, label: currentSource })
    }
    return list
  }, [summaryData])

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: EditSummaryFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      await updateMutation.mutateAsync({
        id: summaryId,
        subjectId: data.subjectId,
        title: data.title.trim(),
        difficulty: data.difficulty,
        source: data.source?.trim() || DEFAULT_SOURCE,
        session: data.session?.trim() || new Date().getFullYear().toString(),
        popularityCount: Number(data.popularityCount) || 0,
        reference: referenceArray,
        questionTypeId: data.questionTypeId || null,
        isActive: data.isActive,
      })

      toast.success("সারাংশটি সফলভাবে হালনাগাদ করা হয়েছে।")
      setTimeout(() => {
        router.push("/summaries")
      }, 500)
    } catch (err: any) {
      const msg = err.message || "সারাংশ হালনাগাদে সমস্যা হয়েছে"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isSummaryLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
        <p className="mt-3 text-sm text-muted-foreground font-body">সারাংশের তথ্য লোড হচ্ছে...</p>
      </div>
    )
  }

  if (isError || !summaryData) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-4">
        <p className="text-xl font-bold text-rose-600 font-headline">সারাংশটি পাওয়া যায়নি</p>
        <p className="text-sm text-muted-foreground font-body">
          অনুরোধকৃত সারাংশটি খুঁজে পাওয়া যায়নি অথবা মুছে ফেলা হয়েছে।
        </p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/summaries">তালিকায় ফিরে যান</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header matching MCQ Edit Header */}
      <PageHeader
        title="সারাংশ ও সারমর্ম সম্পাদনা"
        description="শ্রেণি, বিষয়, সারাংশ অনুচ্ছেদ ও মেটাডাটা তথ্য হালনাগাদ করুন।"
        icon={FileText}
        badge={{ label: "সম্পাদনা মোড", variant: "indigo" }}
        breadcrumbs={[
          { label: "সারাংশ তালিকা", href: "/summaries" },
          { label: "সারাংশ সম্পাদনা" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Link href="/summaries" prefetch={true}>
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

      {/* Main Form Card matching MCQ layout */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-7 flex flex-row items-center gap-3.5 sm:gap-4">
          <div className="flex size-11 sm:size-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary border border-indigo-100/80 dark:border-primary/20 shrink-0">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold font-headline text-foreground">
              সারাংশের বিবরণ ও কনফিগারেশন
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              শ্রেণি, বিষয়, সারাংশ বা সারমর্ম অনুচ্ছেদ ও মেটাডাটা তথ্য সংশোধন করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Academic Classification Hierarchy */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Academic Class */}
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
                          <SelectItem
                            key={cls.id}
                            value={cls.id}
                          >
                            {cls.nameBn || cls.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.classId && (
                  <p className="text-xs text-rose-500 font-medium">{errors.classId.message}</p>
                )}
              </div>

              {/* Academic Subject */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  বিষয় (Academic Subject) <span className="text-rose-500">*</span>
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
                        <SelectValue
                          placeholder={
                            activeClassId ? "বিষয় নির্বাচন করুন..." : "প্রথমে শ্রেণি নির্বাচন করুন"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64">
                        {combinedSubjects.map((sub) => (
                          <SelectItem
                            key={sub.id}
                            value={sub.id}
                          >
                            {sub.nameBn || sub.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subjectId && (
                  <p className="text-xs text-rose-500 font-medium">{errors.subjectId.message}</p>
                )}
              </div>
            </div>

            {/* Summary Passage / Stem */}
            <div className="space-y-2 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  সারাংশ বা সারমর্ম অনুচ্ছেদ (Passage / Poem) <span className="text-rose-500">*</span>
                </Label>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  LaTeX ও Math সমর্থিত
                </span>
              </div>
              <Textarea
                id="title"
                rows={6}
                disabled={isSubmitting}
                placeholder="যে অনুচ্ছেদ বা কবিতার সারাংশ/সারমর্ম লিখতে হবে তা এখানে লিখুন বা পেস্ট করুন..."
                {...register("title")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5 font-body leading-relaxed"
              />
              {errors.title && (
                <p className="text-xs text-rose-500 font-medium">{errors.title.message}</p>
              )}

              {/* KaTeX Live Math Preview */}
              {watchIsMath && watchTitle && watchTitle.trim().length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] text-xs text-foreground space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    LaTeX ম্যাথ প্রিভিউ:
                  </span>
                  <div className="text-sm sm:text-base leading-relaxed text-foreground font-body whitespace-pre-wrap">
                    <RenderMath text={watchTitle} isMath={true} />
                  </div>
                </div>
              )}
            </div>

            {/* Toggle Flags: Math Formula & Active State matching MCQ */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              {/* Is Math */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    গণিত / LaTeX সমীকরণ
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    সারাংশ ও অনুচ্ছেদে KaTeX ম্যাথ ফর্মুলা রেন্ডার করতে অ্যাক্টিভ করুন।
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
                      className="size-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                    />
                  )}
                />
              </div>

              {/* Is Active */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    অ্যাক্টিভ সারাংশের অবস্থা
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    পরীক্ষা ও অনুশীলনে শিক্ষার্থীদের জন্য অবিলম্বে দৃশ্যমান করুন।
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
                      className="size-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                    />
                  )}
                />
              </div>
            </div>

            {/* Reference */}
            <div className="space-y-6 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <div className="space-y-2">
                <Label htmlFor="referenceText" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  রেফারেন্স / উৎস (কমা দিয়ে একাধিক উল্লেখ করুন)
                </Label>
                <Input
                  id="referenceText"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="যেমন: ঢাকা বোর্ড ২০২৪, পাঠ্যবই পৃষ্ঠা ৪২..."
                  {...register("referenceText")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4"
                />
              </div>
            </div>

            {/* Context & Metadata Settings matching MCQ 2-column grid */}
            <div className="space-y-6 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                মেটাডাটা ও অতিরিক্ত সেটিংস
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Difficulty */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    কাঠিন্যের মাত্রা (Difficulty) <span className="text-rose-500">*</span>
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
                          <SelectValue placeholder="কাঠিন্য নির্বাচন করুন..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                          {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.difficulty && (
                    <p className="text-xs text-rose-500 font-medium">{errors.difficulty.message}</p>
                  )}
                </div>

                {/* Question Type Template */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    প্রশ্ন কাঠামো টেমপ্লেট (ঐচ্ছিক)
                  </Label>
                  <Controller
                    name="questionTypeId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        key={`question-type-select-${field.value || "none"}-${questionTypes.length}`}
                        disabled={isSubmitting}
                        value={field.value || "none"}
                        onValueChange={(val) =>
                          field.onChange(val === "none" ? "" : val)
                        }
                      >
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                          <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64">
                          <SelectItem value="none">কোনোটি নয় (None)</SelectItem>
                          {questionTypes.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.nameEn} ({t.label} - {t.mark} নম্বর)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.questionTypeId && (
                    <p className="text-xs text-rose-500 font-medium">
                      {errors.questionTypeId.message}
                    </p>
                  )}
                </div>

                {/* Source */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    প্রশ্নের উৎস (Source)
                  </Label>
                  <Controller
                    name="source"
                    control={control}
                    render={({ field }) => (
                      <Select
                        key={`source-select-${field.value || "empty"}-${combinedSources.length}`}
                        disabled={isSubmitting}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                          <SelectValue placeholder="উৎস নির্বাচন করুন..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                          {combinedSources.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.source && (
                    <p className="text-xs text-rose-500 font-medium">{errors.source.message}</p>
                  )}
                </div>

                {/* Session */}
                <div className="space-y-2">
                  <Label htmlFor="session" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    সেশন (Session)
                  </Label>
                  <Input
                    id="session"
                    type="text"
                    disabled={isSubmitting}
                    placeholder="যেমন: ২০২৬"
                    {...register("session")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4"
                  />
                  {errors.session && (
                    <p className="text-xs text-rose-500 font-medium">{errors.session.message}</p>
                  )}
                </div>

                {/* Popularity Count */}
                <div className="space-y-2">
                  <Label htmlFor="popularityCount" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    ভিউ সংখ্যা (Popularity Count)
                  </Label>
                  <Input
                    id="popularityCount"
                    type="number"
                    min="0"
                    disabled={isSubmitting}
                    placeholder="0"
                    {...register("popularityCount")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4"
                  />
                  {errors.popularityCount && (
                    <p className="text-xs text-rose-500 font-medium">{errors.popularityCount.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions Footer matching MCQ */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6 sm:pt-8 mt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>সর্বশেষ সম্পাদিত তথ্য ডেটাবেজে সংরক্ষিত হবে</span>
              </div>
              <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold px-6 h-11 text-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Link href="/summaries" prefetch={true}>
                    বাতিল
                  </Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 h-11 text-sm shadow-sm shadow-indigo-200 dark:shadow-none transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  ) : (
                    <Save className="w-4 h-4 shrink-0" />
                  )}
                  <span>{isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : "সারাংশ হালনাগাদ করুন"}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

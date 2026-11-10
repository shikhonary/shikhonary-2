"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useCreateApplication,
  useSubjectsForSelection,
  useAcademicClassesForSelection,
} from "../services/use-application"
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
import { APPLICATION_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import { RenderMath } from "@workspace/ui/components/render-math"
import { PageHeader } from "@/components/shared/page-header"
import {
  FileSignature,
  ArrowLeft,
  Clock,
  Loader2,
  Save,
  AlertCircle,
  BookOpen,
  Sparkles,
} from "lucide-react"

const createApplicationFormSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  title: z.string().min(1, "আবেদনপত্রের বিষয় বা প্রশ্ন বিবরণ আবশ্যক"),
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

type CreateApplicationFormData = z.infer<typeof createApplicationFormSchema>

export function CreateApplicationView() {
  const router = useRouter()
  const createMutation = useCreateApplication()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: questionTypesData } = useQuestionTypesList({ limit: 100 })
  const questionTypes = questionTypesData?.questionTypes ?? []

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateApplicationFormData>({
    resolver: zodResolver(createApplicationFormSchema),
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
  })

  const selectedClassId = watch("classId")
  const watchTitle = watch("title")
  const watchIsMath = watch("isMath")
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const onSubmit = async (data: CreateApplicationFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      await createMutation.mutateAsync({
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

      toast.success("আবেদনপত্রটি সফলভাবে তৈরি করা হয়েছে।")
      setTimeout(() => {
        router.push("/applications")
      }, 500)
    } catch (err: any) {
      const msg = err.message || "আবেদনপত্র তৈরিতে সমস্যা হয়েছে"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header */}
      <PageHeader
        title="নতুন আবেদনপত্র / দরখাস্ত তৈরি"
        description="শ্রেণি ও বিষয় নির্বাচন করে প্রশ্নপত্র ভান্ডারে নতুন আবেদনপত্র বা দরখাস্তের প্রশ্ন যুক্ত করুন।"
        icon={FileSignature}
        badge={{ label: "নতুন আবেদনপত্র", variant: "indigo" }}
        breadcrumbs={[
          { label: "আবেদনপত্র তালিকা", href: "/applications" },
          { label: "নতুন আবেদনপত্র তৈরি" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Link href="/applications" prefetch={true}>
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
              আবেদনপত্রের বিবরণ ও কনফিগারেশন
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              শ্রেণি, বিষয়, আবেদনপত্রের মূল প্রশ্ন ও মেটাডাটা নির্ভুলভাবে পূরণ করুন।
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
                      disabled={isSubmitting || !selectedClassId}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50">
                        <SelectValue
                          placeholder={
                            selectedClassId ? "বিষয় নির্বাচন করুন..." : "প্রথমে শ্রেণি নির্বাচন করুন"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64">
                        {subjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
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

            {/* Application Prompt / Stem */}
            <div className="space-y-2 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="title"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  আবেদনপত্রের বিষয়বস্তু (Application Prompt) <span className="text-rose-500">*</span>
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
                placeholder="যেমন: বিদ্যালয়ে একটি বিজ্ঞান ক্লাব গঠনের অনুমতি চেয়ে প্রধান শিক্ষকের নিকট আবেদনপত্র লেখ।"
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
                  <p className="text-sm font-bold text-foreground">গণিত / LaTeX সমীকরণ</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    আবেদনপত্রের প্রশ্নে KaTeX ম্যাথ ফর্মুলা রেন্ডার করতে অ্যাক্টিভ করুন।
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
                  <p className="text-sm font-bold text-foreground">অ্যাক্টিভ আবেদনপত্রের অবস্থা</p>
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
                <Label
                  htmlFor="referenceText"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  রেফারেন্স / উৎস (কমা দিয়ে একাধিক উল্লেখ করুন)
                </Label>
                <Input
                  id="referenceText"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="যেমন: ঢাকা বোর্ড ২০২৪, রাজশাহী বোর্ড ২০২৩..."
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
                        disabled={isSubmitting}
                        value={field.value || "none"}
                        onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
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
                        disabled={isSubmitting}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                          <SelectValue placeholder="উৎস নির্বাচন করুন..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                          {APPLICATION_SOURCE_OPTIONS.map((opt) => (
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
                  <Label
                    htmlFor="session"
                    className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
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
                  <Label
                    htmlFor="popularityCount"
                    className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
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
                    <p className="text-xs text-rose-500 font-medium">
                      {errors.popularityCount.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions Footer matching MCQ */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6 sm:pt-8 mt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>নতুন রেকর্ড হিসেবে আবেদনপত্রটি সংরক্ষিত হবে</span>
              </div>
              <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold px-6 h-11 text-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Link href="/applications" prefetch={true}>
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
                  <span>{isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : "প্রশ্ন সংরক্ষণ করুন"}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

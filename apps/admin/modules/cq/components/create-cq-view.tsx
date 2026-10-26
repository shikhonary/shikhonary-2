"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useCreateCq,
  useSubjectsForSelection,
  useChaptersForSelection,
  useAcademicClassesForSelection,
} from "../services/use-cq"
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
import { CQ_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import { PageHeader } from "@/components/shared/page-header"
import {
  Plus,
  ArrowLeft,
  Clock,
  Loader2,
  Save,
  AlertCircle,
  Sparkles,
  BookOpen,
} from "lucide-react"

const createCqFormSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করা আবশ্যক"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করা আবশ্যক"),
  chapterId: z.string().min(1, "অধ্যায় নির্বাচন করা আবশ্যক"),
  context: z.string().optional(),
  questionA: z.string().min(1, "ক প্রশ্ন লেখা আবশ্যক"),
  questionB: z.string().min(1, "খ প্রশ্ন লেখা আবশ্যক"),
  questionC: z.string().optional(),
  questionD: z.string().optional(),
  answerA: z.string().optional(),
  answerB: z.string().optional(),
  answerC: z.string().optional(),
  answerD: z.string().optional(),
  explanation: z.string().optional(),
  referenceText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  year: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  questionTypeId: z.string().optional(),
  isActive: z.boolean(),
  marksA: z.string(),
  marksB: z.string(),
  marksC: z.string(),
  marksD: z.string(),
})

type CreateCqFormData = z.infer<typeof createCqFormSchema>

export function CreateCqView() {
  const router = useRouter()
  const createMutation = useCreateCq()
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
  } = useForm<CreateCqFormData>({
    resolver: zodResolver(createCqFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      context: "",
      questionA: "",
      questionB: "",
      questionC: "",
      questionD: "",
      answerA: "",
      answerB: "",
      answerC: "",
      answerD: "",
      explanation: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      year: "",
      source: DEFAULT_SOURCE,
      session: String(new Date().getFullYear()),
      questionTypeId: "",
      isActive: true,
      marksA: "1",
      marksB: "2",
      marksC: "3",
      marksD: "4",
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

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const onSubmit = async (data: CreateCqFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const parsedYear = data.year && !isNaN(Number(data.year))
        ? Number(data.year)
        : data.session && !isNaN(Number(data.session))
        ? Number(data.session)
        : null

      const marksObj = {
        a: Number(data.marksA) || 1,
        b: Number(data.marksB) || 2,
        c: data.questionC ? (Number(data.marksC) || 3) : 0,
        d: data.questionD ? (Number(data.marksD) || 4) : 0,
      }

      await createMutation.mutateAsync({
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        context: data.context?.trim() || null,
        questionA: data.questionA.trim(),
        questionB: data.questionB.trim(),
        questionC: data.questionC?.trim() || null,
        questionD: data.questionD?.trim() || null,
        difficulty: data.difficulty,
        year: parsedYear,
        source: data.source?.trim() || DEFAULT_SOURCE,
        session: data.session?.trim() || null,
        reference: referenceArray,
        questionTypeId: data.questionTypeId || null,
        isActive: data.isActive,
        marks: marksObj,
        answer: {
          answerA: data.answerA?.trim() || null,
          answerB: data.answerB?.trim() || null,
          answerC: data.answerC?.trim() || null,
          answerD: data.answerD?.trim() || null,
          explanation: data.explanation?.trim() || null,
        },
      })

      toast.success("সৃজনশীল প্রশ্নটি সফলভাবে তৈরি করা হয়েছে।")
      setTimeout(() => {
        router.push("/cqs")
      }, 800)
    } catch (err: any) {
      const msg = err.message || "CQ প্রশ্ন তৈরি করা সম্ভব হয়নি"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12">
      {/* Shared Page Header matching MCQ Benchmark */}
      <PageHeader
        title="নতুন CQ প্রশ্ন তৈরি"
        description="শ্রেণি, বিষয় ও অধ্যায় ভিত্তিক সৃজনশীল প্রশ্ন, উদ্দীপক, উপ-প্রশ্ন (ক, খ, গ, ঘ) ও সমাধান তৈরি করুন।"
        icon={Plus}
        badge={{ label: "নতুন CQ", variant: "indigo" }}
        breadcrumbs={[
          { label: "CQ তালিকা", href: "/cqs" },
          { label: "নতুন CQ" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Link href="/cqs" prefetch={true}>
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
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold font-headline text-foreground">
              সৃজনশীল প্রশ্নের বিবরণ ও কনফিগারেশন
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              শ্রেণি, বিষয়, অধ্যায়, উদ্দীপক, উপ-প্রশ্ন (ক, খ, গ, ঘ), নম্বর বণ্টন ও সমাধান নির্ভুলভাবে পূরণ করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Academic Class, Subject & Chapter Selection */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Class */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  শ্রেণি (Academic Class) <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="classId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`class-select-${field.value}-${academicClasses.length}`}
                      disabled={isSubmitting}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("subjectId", "")
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                        <SelectValue placeholder="শ্রেণি নির্বাচন করুন..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
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

              {/* Subject */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  বিষয় (Subject) <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="subjectId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`subject-select-${field.value}-${subjects.length}`}
                      disabled={isSubmitting || !selectedClassId}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50">
                        <SelectValue
                          placeholder={
                            selectedClassId
                              ? "বিষয় নির্বাচন করুন..."
                              : "প্রথমে শ্রেণি নির্বাচন করুন"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
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

              {/* Chapter */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  অধ্যায় (Chapter) <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="chapterId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`chapter-select-${field.value}-${chapters.length}`}
                      disabled={isSubmitting || !selectedSubjectId}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50">
                        <SelectValue
                          placeholder={
                            selectedSubjectId
                              ? "অধ্যায় নির্বাচন করুন..."
                              : "প্রথমে বিষয় নির্বাচন করুন"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
                        {chapters.map((ch) => (
                          <SelectItem key={ch.id} value={ch.id}>
                            {ch.nameBn || ch.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.chapterId && (
                  <p className="text-xs text-rose-500 font-medium">{errors.chapterId.message}</p>
                )}
              </div>
            </div>

            {/* Stimulus Passage Text */}
            <div className="space-y-2 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                উদ্দীপক / অনুচ্ছেদ (Stimulus Passage)
              </Label>
              <Textarea
                disabled={isSubmitting}
                rows={4}
                placeholder="সৃজনশীল প্রশ্নের উদ্দীপক বা দৃশ্যপট এখানে লিখুন..."
                {...register("context")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5 font-body leading-relaxed"
              />
            </div>

            {/* Sub-Questions A, B, C, D Stems */}
            <div className="space-y-5 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-primary font-headline flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  উপ-প্রশ্ন ও নম্বর বণ্টন
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-body">
                  ক (জ্ঞান), খ (অনুধাবন), গ (প্রয়োগ) ও ঘ (উচ্চতর দক্ষতা) উপ-প্রশ্ন ও তাদের নম্বর প্রদান করুন।
                </p>
              </div>

              <div className="space-y-4">
                {/* Question A */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/40 dark:bg-white/[0.01] p-4 sm:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div className="md:col-span-3 space-y-2">
                      <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        ক. জ্ঞানমূলক উপ-প্রশ্ন (A) <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        disabled={isSubmitting}
                        placeholder="যেমন: বল কাকে বলে?"
                        {...register("questionA")}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                      />
                      {errors.questionA && (
                        <p className="text-xs text-rose-500 font-medium">{errors.questionA.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        নম্বর (ক)
                      </Label>
                      <Input
                        type="number"
                        disabled={isSubmitting}
                        {...register("marksA")}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                      />
                    </div>
                  </div>
                </div>

                {/* Question B */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/40 dark:bg-white/[0.01] p-4 sm:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div className="md:col-span-3 space-y-2">
                      <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        খ. অনুধাবনমূলক উপ-প্রশ্ন (B) <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        disabled={isSubmitting}
                        placeholder="যেমন: নিউটনের গতিবিদ্যার ২য় সূত্রটি ব্যাখ্যা কর।"
                        {...register("questionB")}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                      />
                      {errors.questionB && (
                        <p className="text-xs text-rose-500 font-medium">{errors.questionB.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        নম্বর (খ)
                      </Label>
                      <Input
                        type="number"
                        disabled={isSubmitting}
                        {...register("marksB")}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                      />
                    </div>
                  </div>
                </div>

                {/* Question C */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/40 dark:bg-white/[0.01] p-4 sm:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div className="md:col-span-3 space-y-2">
                      <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        গ. প্রয়োগমূলক উপ-প্রশ্ন (C) (ঐচ্ছিক)
                      </Label>
                      <Input
                        type="text"
                        disabled={isSubmitting}
                        placeholder="যেমন: উদ্দীপকের তথ্যের আলোকে ত্বরণ নির্ণয় কর।"
                        {...register("questionC")}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                      />
                      {errors.questionC && (
                        <p className="text-xs text-rose-500 font-medium">{errors.questionC.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        নম্বর (গ)
                      </Label>
                      <Input
                        type="number"
                        disabled={isSubmitting}
                        {...register("marksC")}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                      />
                    </div>
                  </div>
                </div>

                {/* Question D */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/40 dark:bg-white/[0.01] p-4 sm:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div className="md:col-span-3 space-y-2">
                      <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        ঘ. উচ্চতর দক্ষতামূলক উপ-প্রশ্ন (D) (ঐচ্ছিক)
                      </Label>
                      <Input
                        type="text"
                        disabled={isSubmitting}
                        placeholder="যেমন: উদ্দীপকের বস্তুটির বেগ দ্বিগুণ করতে কত বল লাগবে গাণিতিক বিশ্লেষণ দাও।"
                        {...register("questionD")}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        নম্বর (ঘ)
                      </Label>
                      <Input
                        type="number"
                        disabled={isSubmitting}
                        {...register("marksD")}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Answer Solutions */}
            <div className="space-y-5 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-primary font-headline flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  সমাধান ও আদর্শ উত্তরপত্র (ঐচ্ছিক)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-body">
                  প্রতিটি উপ-প্রশ্নের আদর্শ উত্তর ও সামগ্রিক ব্যাখ্যা যুক্ত করুন।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Answer A */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    উত্তর ক (Solution A)
                  </Label>
                  <Textarea
                    disabled={isSubmitting}
                    rows={2}
                    placeholder="ক প্রশ্নের আদর্শ উত্তর লিখুন..."
                    {...register("answerA")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3 font-body"
                  />
                </div>

                {/* Answer B */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    উত্তর খ (Solution B)
                  </Label>
                  <Textarea
                    disabled={isSubmitting}
                    rows={2}
                    placeholder="খ প্রশ্নের আদর্শ উত্তর লিখুন..."
                    {...register("answerB")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3 font-body"
                  />
                </div>

                {/* Answer C */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    উত্তর গ (Solution C)
                  </Label>
                  <Textarea
                    disabled={isSubmitting}
                    rows={3}
                    placeholder="গ প্রশ্নের আদর্শ উত্তর লিখুন..."
                    {...register("answerC")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3 font-body"
                  />
                </div>

                {/* Answer D */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    উত্তর ঘ (Solution D)
                  </Label>
                  <Textarea
                    disabled={isSubmitting}
                    rows={3}
                    placeholder="ঘ প্রশ্নের আদর্শ উত্তর লিখুন..."
                    {...register("answerD")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3 font-body"
                  />
                </div>
              </div>

              {/* Overall Explanation */}
              <div className="space-y-2 pt-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  উত্তর বিশ্লেষণ ও সামগ্রিক ব্যাখ্যা
                </Label>
                <Textarea
                  disabled={isSubmitting}
                  rows={3}
                  placeholder="প্রশ্নটির সামগ্রিক মূল্যায়ন নির্দেশিকা ও ব্যাখ্যা..."
                  {...register("explanation")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5 font-body"
                />
              </div>
            </div>

            {/* Reference & Metadata Settings */}
            <div className="space-y-6 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-primary flex items-center gap-1.5 font-headline">
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
                        key={`difficulty-select-${field.value}`}
                        disabled={isSubmitting}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                          <SelectValue placeholder="কাঠিন্য নির্বাচন করুন..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg font-body">
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
                        key={`type-select-${field.value}`}
                        disabled={isSubmitting}
                        value={field.value || "none"}
                        onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                      >
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                          <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
                          <SelectItem value="none">কোনোটি নয় (None)</SelectItem>
                          {questionTypes.map((t: any) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.nameEn} ({t.label} - {t.mark} নম্বর)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
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
                        key={`source-select-${field.value}`}
                        disabled={isSubmitting}
                        value={field.value || DEFAULT_SOURCE}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                          <SelectValue placeholder="উৎস নির্বাচন করুন...">
                            {field.value}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg font-body">
                          {CQ_SOURCE_OPTIONS.map((opt) => (
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
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    সেশন / সাল
                  </Label>
                  <Input
                    disabled={isSubmitting}
                    type="text"
                    placeholder="যেমন: ২০২৬"
                    {...register("session")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                  />
                </div>

                {/* References */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    রেফারেন্স / উৎস ট্যাগ (কমা দিয়ে একাধিক উল্লেখ করুন)
                  </Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="যেমন: NCTB Textbook Chapter 2, Dhaka Board 2024"
                    {...register("referenceText")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                  />
                </div>

                {/* Is Active Status Switch/Checkbox */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4 md:col-span-2 mt-2">
                  <div>
                    <p className="text-sm font-bold text-foreground font-headline">
                      অ্যাক্টিভ প্রশ্ন স্ট্যাটাস
                    </p>
                    <p className="text-xs text-muted-foreground font-body mt-0.5">
                      প্রশ্নটি সরাসরি অ্যাক্টিভ রাখতে এবং শিক্ষার্থী বা পরীক্ষা মডিউলে প্রদর্শন করতে এটি চেক করুন।
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
            </div>

            {/* Form Actions Footer matching Benchmark */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6 sm:pt-8 mt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>নতুন রেকর্ড হিসেবে সৃজনশীল প্রশ্নটি সংরক্ষিত হবে</span>
              </div>
              <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold px-6 h-11 text-sm transition-all active:scale-95 cursor-pointer font-headline"
                >
                  <Link href="/cqs" prefetch={true}>
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

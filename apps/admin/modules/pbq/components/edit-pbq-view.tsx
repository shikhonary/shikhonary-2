"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  usePbqById,
  useUpdatePbq,
  useSubjectsForSelection,
  useChaptersForSelection,
  useAcademicClassesForSelection,
} from "../services/use-pbq"
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
import { PBQ_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import { PageHeader } from "@/components/shared/page-header"
import {
  ArrowLeft,
  Clock,
  Loader2,
  Save,
  AlertCircle,
  BookOpen,
} from "lucide-react"

const editPbqFormSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করা আবশ্যক"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করা আবশ্যক"),
  chapterId: z.string().optional(),
  context: z.string().min(1, "উদ্দীপক / অনুচ্ছেদ লেখা আবশ্যক"),
  questionA: z.string().min(1, "ক প্রশ্ন লেখা আবশ্যক"),
  questionB: z.string().min(1, "খ প্রশ্ন লেখা আবশ্যক"),
  questionC: z.string().min(1, "গ প্রশ্ন লেখা আবশ্যক"),
  questionD: z.string().min(1, "ঘ প্রশ্ন লেখা আবশ্যক"),
  questionE: z.string().min(1, "ঙ প্রশ্ন লেখা আবশ্যক"),
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
  marksE: z.string(),
})

type EditPbqFormData = z.infer<typeof editPbqFormSchema>

export interface EditPbqViewProps {
  id?: string
}

export function EditPbqView({ id }: EditPbqViewProps = {}) {
  const router = useRouter()
  const params = useParams()
  const pbqId = id || (params?.id as string)

  const { data: pbqData, isLoading: isPbqLoading, isError } = usePbqById(pbqId)
  const updateMutation = useUpdatePbq()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: questionTypesData } = useQuestionTypesList({ limit: 100 })
  const questionTypes = questionTypesData?.questionTypes ?? []

  const initialClassId = useMemo(() => {
    if (!pbqData) return ""
    return (
      (pbqData as any)?.subject?.classSubjects?.[0]?.academicClass?.id ||
      (pbqData as any)?.subject?.classSubjects?.[0]?.classId ||
      ""
    )
  }, [pbqData])

  const formValues = useMemo<EditPbqFormData | undefined>(() => {
    if (!pbqData) return undefined

    return {
      classId: initialClassId,
      subjectId: pbqData.subjectId,
      chapterId: pbqData.academicChapterId || "",
      context: pbqData.context || "",
      questionA: pbqData.questionA,
      questionB: pbqData.questionB,
      questionC: pbqData.questionC,
      questionD: pbqData.questionD,
      questionE: pbqData.questionE,
      referenceText: pbqData.reference?.join(", ") || "",
      difficulty: pbqData.difficulty as any,
      year: (pbqData as any).year !== null && (pbqData as any).year !== undefined ? String((pbqData as any).year) : "",
      source: (pbqData as any).source || DEFAULT_SOURCE,
      session: (pbqData as any).session || ((pbqData as any).year ? String((pbqData as any).year) : ""),
      questionTypeId: pbqData.questionTypeId || "",
      isActive: Boolean(pbqData.isActive),
      marksA: String((pbqData.marks as any)?.a ?? "2"),
      marksB: String((pbqData.marks as any)?.b ?? "2"),
      marksC: String((pbqData.marks as any)?.c ?? "2"),
      marksD: String((pbqData.marks as any)?.d ?? "2"),
      marksE: String((pbqData.marks as any)?.e ?? "2"),
    }
  }, [pbqData, initialClassId])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditPbqFormData>({
    resolver: zodResolver(editPbqFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      context: "",
      questionA: "",
      questionB: "",
      questionC: "",
      questionD: "",
      questionE: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      year: "",
      source: DEFAULT_SOURCE,
      session: String(new Date().getFullYear()),
      questionTypeId: "",
      isActive: true,
      marksA: "2",
      marksB: "2",
      marksC: "2",
      marksD: "2",
      marksE: "2",
    },
    values: formValues,
    resetOptions: {
      keepDirtyValues: true,
    },
  })

  const selectedClassId = watch("classId")
  const activeClassId = selectedClassId || initialClassId

  const { data: subjects = [] } = useSubjectsForSelection(
    activeClassId ? { academicClassId: activeClassId } : undefined
  )

  const selectedSubjectId = watch("subjectId")
  const activeSubjectId = selectedSubjectId || pbqData?.subjectId

  const { data: chapters = [] } = useChaptersForSelection(
    activeSubjectId ? { subjectId: activeSubjectId } : undefined
  )

  // Ensure initial academic class is immediately present in options
  const combinedClasses = useMemo(() => {
    const map = new Map<string, any>()
    const initialClass = (pbqData as any)?.subject?.classSubjects?.[0]?.academicClass
    if (initialClass) {
      map.set(initialClass.id, initialClass)
    }
    for (const cls of academicClasses) {
      map.set(cls.id, cls)
    }
    return Array.from(map.values())
  }, [academicClasses, pbqData])

  // Ensure subject from PBQ is immediately present in options
  const combinedSubjects = useMemo(() => {
    const map = new Map<string, any>()
    if (pbqData?.subject) {
      map.set(pbqData.subject.id, pbqData.subject)
    }
    for (const sub of subjects) {
      map.set(sub.id, sub)
    }
    return Array.from(map.values())
  }, [subjects, pbqData?.subject])

  // Ensure chapter from PBQ is immediately present in options
  const combinedChapters = useMemo(() => {
    const map = new Map<string, any>()
    const initialChapter = (pbqData as any)?.academicChapter
    if (initialChapter) {
      map.set(initialChapter.id, initialChapter)
    }
    for (const ch of chapters) {
      map.set(ch.id, ch)
    }
    return Array.from(map.values())
  }, [chapters, pbqData])

  // Ensure source from PBQ is immediately present in source options list
  const combinedSources = useMemo(() => {
    const list: { value: string; label: string }[] = [...PBQ_SOURCE_OPTIONS]
    const currentSource = (pbqData as any)?.source ? String((pbqData as any).source).trim() : null
    if (currentSource && !list.some((s) => s.value === currentSource)) {
      list.unshift({ value: currentSource, label: currentSource })
    }
    return list
  }, [pbqData])

  const isSubmitting = updateMutation.isPending || isFormSubmitting || isPbqLoading

  const onSubmit = async (data: EditPbqFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const marksObj = {
        a: Number(data.marksA) || 2,
        b: Number(data.marksB) || 2,
        c: Number(data.marksC) || 2,
        d: Number(data.marksD) || 2,
        e: Number(data.marksE) || 2,
      }

      const parsedYear = data.year && !isNaN(Number(data.year))
        ? Number(data.year)
        : data.session && !isNaN(Number(data.session))
        ? Number(data.session)
        : null

      await updateMutation.mutateAsync({
        id: pbqId,
        subjectId: data.subjectId,
        chapterId: data.chapterId === "none" ? null : data.chapterId || null,
        context: data.context.trim(),
        questionA: data.questionA.trim(),
        questionB: data.questionB.trim(),
        questionC: data.questionC.trim(),
        questionD: data.questionD.trim(),
        questionE: data.questionE.trim(),
        difficulty: data.difficulty,
        source: data.source?.trim() || DEFAULT_SOURCE,
        session: data.session?.trim() || null,
        year: parsedYear,
        reference: referenceArray,
        questionTypeId: data.questionTypeId || null,
        isActive: data.isActive,
        marks: marksObj,
      })

      toast.success("অনুচ্ছেদভিত্তিক প্রশ্নটি সফলভাবে হালনাগাদ করা হয়েছে।")
      setTimeout(() => {
        router.push("/pbqs")
      }, 800)
    } catch (err: any) {
      const msg = err.message || "PBQ প্রশ্ন হালনাগাদ করা সম্ভব হয়নি"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isError && !isPbqLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 text-center">
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-8">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 font-headline">
            PBQ প্রশ্ন পাওয়া যায়নি
          </h2>
          <p className="text-sm text-red-600/80 max-w-md font-body">
            অনুরোধকৃত অনুচ্ছেদভিত্তিক প্রশ্নটি মুছে ফেলা হতে পারে বা এর অস্তিত্ব নেই।
          </p>
          <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-headline">
            <Link href="/pbqs" prefetch={true}>
              PBQ তালিকায় ফিরে যান
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12">
      {/* Shared Page Header matching Benchmark */}
      <PageHeader
        title="PBQ প্রশ্ন সম্পাদনা"
        description="শ্রেণি, বিষয় ও অধ্যায় ভিত্তিক অনুচ্ছেদভিত্তিক প্রশ্ন, উদ্দীপক, ৫টি উপ-প্রশ্ন ও মূল্যায়ন নম্বর সম্পাদনা করুন।"
        icon={BookOpen}
        badge={{ label: "PBQ সম্পাদনা", variant: "indigo" }}
        breadcrumbs={[
          { label: "PBQ তালিকা", href: "/pbqs" },
          { label: "PBQ সম্পাদনা" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Link href="/pbqs" prefetch={true}>
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
              অনুচ্ছেদভিত্তিক প্রশ্নের বিবরণ ও কনফিগারেশন
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              শ্রেণি, বিষয়, অধ্যায়, উদ্দীপক, ৫টি উপ-প্রশ্ন (ক, খ, গ, ঘ, ঙ) ও নম্বর বণ্টন নির্ভুলভাবে হালনাগাদ করুন।
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
                      key={`class-select-${field.value}-${combinedClasses.length}`}
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
                      key={`subject-select-${field.value}-${combinedSubjects.length}`}
                      disabled={isSubmitting || !activeClassId}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50">
                        <SelectValue
                          placeholder={
                            activeClassId
                              ? "বিষয় নির্বাচন করুন..."
                              : "প্রথমে শ্রেণি নির্বাচন করুন"
                          }
                        />
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
                  <p className="text-xs text-rose-500 font-medium">{errors.subjectId.message}</p>
                )}
              </div>

              {/* Chapter */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  অধ্যায় (Chapter)
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
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50">
                        <SelectValue
                          placeholder={
                            activeSubjectId
                              ? "অধ্যায় নির্বাচন করুন..."
                              : "প্রথমে বিষয় নির্বাচন করুন"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
                        <SelectItem value="none">কোনো অধ্যায় নয় (General)</SelectItem>
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
                  <p className="text-xs text-rose-500 font-medium">{errors.chapterId.message}</p>
                )}
              </div>
            </div>

            {/* Stimulus Passage Text */}
            <div className="space-y-2 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                উদ্দীপক / অনুচ্ছেদ (Passage Context) <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                disabled={isSubmitting}
                rows={5}
                placeholder="অনুচ্ছেদভিত্তিক প্রশ্নের মূল উদ্দীপক বা প্যাসেজটি এখানে লিখুন..."
                {...register("context")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5 font-body leading-relaxed"
              />
              {errors.context && (
                <p className="text-xs text-rose-500 font-medium">{errors.context.message}</p>
              )}
            </div>

            {/* Sub-Questions A, B, C, D, E Stems */}
            <div className="space-y-5 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-primary font-headline flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  উপ-প্রশ্ন ও নম্বর বণ্টন (Parts ক, খ, গ, ঘ, ঙ)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-body">
                  উদ্দীপকের ওপর ভিত্তি করে ৫টি উপ-প্রশ্ন ও তাদের নির্দিষ্ট মূল্যায়ন নম্বর হালনাগাদ করুন।
                </p>
              </div>

              <div className="space-y-4">
                {/* Question A */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/40 dark:bg-white/[0.01] p-4 sm:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div className="md:col-span-3 space-y-2">
                      <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        ক. প্রথম উপ-প্রশ্ন (Part A) <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        disabled={isSubmitting}
                        placeholder="ক এর প্রশ্ন লিখুন..."
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
                        খ. দ্বিতীয় উপ-প্রশ্ন (Part B) <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        disabled={isSubmitting}
                        placeholder="খ এর প্রশ্ন লিখুন..."
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
                        গ. তৃতীয় উপ-প্রশ্ন (Part C) <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        disabled={isSubmitting}
                        placeholder="গ এর প্রশ্ন লিখুন..."
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
                        ঘ. চতুর্থ উপ-প্রশ্ন (Part D) <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        disabled={isSubmitting}
                        placeholder="ঘ এর প্রশ্ন লিখুন..."
                        {...register("questionD")}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                      />
                      {errors.questionD && (
                        <p className="text-xs text-rose-500 font-medium">{errors.questionD.message}</p>
                      )}
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

                {/* Question E */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/40 dark:bg-white/[0.01] p-4 sm:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div className="md:col-span-3 space-y-2">
                      <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        ঙ. পঞ্চম উপ-প্রশ্ন (Part E) <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        disabled={isSubmitting}
                        placeholder="ঙ এর প্রশ্ন লিখুন..."
                        {...register("questionE")}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                      />
                      {errors.questionE && (
                        <p className="text-xs text-rose-500 font-medium">{errors.questionE.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        নম্বর (ঙ)
                      </Label>
                      <Input
                        type="number"
                        disabled={isSubmitting}
                        {...register("marksE")}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Difficulty, Source, Session & Reference Metadata */}
            <div className="space-y-6 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-primary font-headline">
                মেটাডাটা ও শ্রেণিবিন্যাস (Metadata & Classification)
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Difficulty */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    কাঠিন্যের মাত্রা (Difficulty)
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
                </div>

                {/* Question Type */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    প্রশ্নের ধরণ টেমপ্লেট (Question Type)
                  </Label>
                  <Controller
                    name="questionTypeId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        key={`qt-select-${field.value}-${questionTypes.length}`}
                        disabled={isSubmitting}
                        value={field.value || "none"}
                        onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                      >
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                          <SelectValue placeholder="প্রশ্নের ধরণ..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
                          <SelectItem value="none">ডিফল্ট PBQ ধরণ</SelectItem>
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
                        key={`source-select-${field.value}-${combinedSources.length}`}
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
                    placeholder="যেমন: NCTB Textbook Passage 1, Dhaka Board 2024"
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

            {/* Form Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6 sm:pt-8 mt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>পরিবর্তনসমূহ বিদ্যমান রেকর্ডে সংরক্ষিত হবে</span>
              </div>
              <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold px-6 h-11 text-sm transition-all active:scale-95 cursor-pointer font-headline"
                >
                  <Link href="/pbqs" prefetch={true}>
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

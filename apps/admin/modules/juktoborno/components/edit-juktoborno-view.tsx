"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useJuktobornoById,
  useUpdateJuktoborno,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-juktoborno"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
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
import { JUKTOBORNO_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import {
  BookOpen,
  Save,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Edit3,
} from "lucide-react"

const editJuktobornoFormSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  chapterId: z.string().min(1, "অধ্যায় নির্বাচন করুন"),
  juktoborno: z.string().min(1, "যুক্তবর্ণ আবশ্যক"),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  referenceText: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  year: z.string().optional(),
  isActive: z.boolean(),
})

type EditJuktobornoFormData = z.infer<typeof editJuktobornoFormSchema>

interface EditJuktobornoViewProps {
  id: string
}

export function EditJuktobornoView({ id }: EditJuktobornoViewProps) {
  const router = useRouter()
  const { data: initialData, isLoading, isError } = useJuktobornoById(id)
  const updateMutation = useUpdateJuktoborno()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Academic Class Selection Query
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  // Resolve initial classId robustly from subject or chapter relationships
  const initialClassId = useMemo(() => {
    if (!initialData) return ""
    return (
      (initialData as any).subject?.classSubjects?.[0]?.classId ||
      (initialData as any).subject?.classSubjects?.[0]?.academicClass?.id ||
      (initialData as any).academicChapter?.subject?.classSubjects?.[0]?.classId ||
      (initialData as any).academicChapter?.subject?.classSubjects?.[0]?.academicClass?.id ||
      (initialData as any).classId ||
      ""
    )
  }, [initialData])

  // Synchronize form values directly with loaded juktoborno data
  const formValues = useMemo(() => {
    if (!initialData) return undefined
    return {
      classId: initialClassId,
      subjectId: initialData.subjectId || "",
      chapterId: (initialData as any).academicChapterId || (initialData as any).chapterId || "",
      juktoborno: initialData.juktoborno || "",
      difficulty: (initialData.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
      referenceText: Array.isArray(initialData.reference)
        ? initialData.reference.join(", ")
        : "",
      source: (initialData as any).source ? String((initialData as any).source).trim() : DEFAULT_SOURCE,
      session: initialData.session || new Date().getFullYear().toString(),
      year: (initialData as any).year ? String((initialData as any).year) : "",
      isActive: initialData.isActive !== undefined ? initialData.isActive : true,
    }
  }, [initialData, initialClassId])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditJuktobornoFormData>({
    resolver: zodResolver(editJuktobornoFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      juktoborno: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
      source: DEFAULT_SOURCE,
      session: new Date().getFullYear().toString(),
      year: "",
      isActive: true,
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
  const activeSubjectId = selectedSubjectId || initialData?.subjectId || ""

  const { data: chapters = [] } = useChaptersForSelection(
    activeSubjectId ? { subjectId: activeSubjectId } : undefined
  )

  // Combined fallback classes map
  const combinedClasses = useMemo(() => {
    const map = new Map<string, any>()
    const initialClass = initialData?.subject?.classSubjects?.[0]?.academicClass
    if (initialClass) map.set(initialClass.id, initialClass)
    for (const cls of academicClasses) map.set(cls.id, cls)
    return Array.from(map.values())
  }, [academicClasses, initialData])

  // Combined fallback subjects map
  const combinedSubjects = useMemo(() => {
    const map = new Map<string, any>()
    if (initialData?.subject) map.set(initialData.subject.id, initialData.subject)
    for (const sub of subjects) map.set(sub.id, sub)
    return Array.from(map.values())
  }, [subjects, initialData])

  // Combined fallback chapters map
  const combinedChapters = useMemo(() => {
    const map = new Map<string, any>()
    if (initialData?.academicChapter)
      map.set(initialData.academicChapter.id, initialData.academicChapter)
    for (const ch of chapters) map.set(ch.id, ch)
    return Array.from(map.values())
  }, [chapters, initialData])

  // Combined fallback sources
  const combinedSources = useMemo(() => {
    const list: { value: string; label: string }[] = [...JUKTOBORNO_SOURCE_OPTIONS]
    const cur = (initialData as any)?.source ? String((initialData as any).source).trim() : null
    if (cur && !list.some((s) => s.value === cur)) {
      list.unshift({ value: cur, label: cur })
    }
    return list
  }, [initialData])

  const watchJuktoborno = watch("juktoborno")

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: EditJuktobornoFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const resolvedSession =
        data.session?.trim() ||
        (data.year ? data.year.trim() : new Date().getFullYear().toString())

      await updateMutation.mutateAsync({
        id,
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        academicChapterId: data.chapterId,
        juktoborno: data.juktoborno.trim(),
        difficulty: data.difficulty,
        reference: referenceArray,
        source: data.source ? data.source.trim() : DEFAULT_SOURCE,
        session: resolvedSession,
        isActive: data.isActive,
      })

      toast.success("যুক্তবর্ণ সফলভাবে হালনাগাদ করা হয়েছে।")
      router.push("/juktoborno")
    } catch (err: any) {
      const msg = err.message || "যুক্তবর্ণ আপডেট করা সম্ভব হয়নি"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-pulse">
        <div className="h-20 bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08]" />
        <div className="h-96 bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08]" />
      </div>
    )
  }

  if (isError || !initialData) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-3" />
          <p className="text-base font-bold font-headline">যুক্তবর্ণটি পাওয়া যায়নি</p>
          <p className="text-xs text-muted-foreground mt-1 font-body">
            অনুরোধকৃত যুক্তবর্ণটির তথ্য সার্ভারে বিদ্যমান নেই অথবা মুছে ফেলা হয়েছে।
          </p>
          <div className="mt-6">
            <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 font-headline">
              <Link href="/juktoborno" prefetch={true}>
                তালিকায় ফিরে যান
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="যুক্তবর্ণ সম্পাদনা করুন"
        description="শ্রেণি, বিষয়, অধ্যায়, যুক্তবর্ণ ও মেটাডাটার বিবরণ হালনাগাদ করুন।"
        badge={{ label: "এডিট মোড", variant: "indigo" }}
        icon={Edit3}
        breadcrumbs={[
          { label: "ড্যাশবোর্ড", href: "/" },
          { label: "যুক্তবর্ণ", href: "/juktoborno" },
          { label: "সম্পাদনা" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2 font-headline cursor-pointer"
        >
          <Link href="/juktoborno" prefetch={true}>
            <ArrowLeft className="w-4 h-4" />
            <span>তালিকায় ফিরে যান</span>
          </Link>
        </Button>
      </PageHeader>

      {/* Error Callout Banner */}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-4 text-sm text-rose-600 dark:text-rose-400 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-body">
            <p className="font-bold font-headline">ত্রুটি ঘটেছে</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Edit Card */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-8 bg-slate-50/50 dark:bg-white/[0.02] flex flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 text-indigo-600 dark:text-primary flex items-center justify-center shrink-0 shadow-sm shadow-indigo-100/50 dark:shadow-none">
            <BookOpen className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground font-headline">
              যুক্তবর্ণের বিবরণ সম্পাদনা
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              শ্রেণি, বিষয়, অধ্যায়, মূল যুক্তবর্ণ ও তথ্যসূত্র নির্ভুলভাবে হালনাগাদ করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Class, Subject & Chapter Hierarchy Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Class */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  শ্রেণি (Academic Class) <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="classId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`class-select-${field.value || "empty"}-${combinedClasses.length}`}
                      disabled={isSubmitting}
                      value={field.value || ""}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("subjectId", "")
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between font-body">
                        <SelectValue placeholder="শ্রেণি নির্বাচন করুন..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64">
                        {combinedClasses.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id} label={cls.nameBn || cls.nameEn}>
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
                      key={`subject-select-${field.value || "empty"}-${combinedSubjects.length}`}
                      disabled={isSubmitting || !activeClassId}
                      value={field.value || ""}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50 font-body">
                        <SelectValue
                          placeholder={
                            activeClassId
                              ? "বিষয় নির্বাচন করুন..."
                              : "প্রথমে শ্রেণি নির্বাচন করুন"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64">
                        {combinedSubjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id} label={sub.nameBn || sub.nameEn}>
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
                      key={`chapter-select-${field.value || "empty"}-${combinedChapters.length}`}
                      disabled={isSubmitting || !activeSubjectId}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50 font-body">
                        <SelectValue
                          placeholder={
                            activeSubjectId
                              ? "অধ্যায় নির্বাচন করুন..."
                              : "প্রথমে বিষয় নির্বাচন করুন"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64">
                        {combinedChapters.map((ch) => (
                          <SelectItem key={ch.id} value={ch.id} label={ch.nameBn || ch.nameEn}>
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

            {/* Juktoborno Text Input */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                মূল যুক্তবর্ণ (Juktoborno) <span className="text-rose-500">*</span>
              </Label>
              <Input
                disabled={isSubmitting}
                placeholder="যুক্তবর্ণ লিখুন (যেমন: ক্ষ, জ্ঞ, ষ্ণ, ণ্ড)..."
                {...register("juktoborno")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-headline font-semibold"
              />
              {errors.juktoborno && (
                <p className="text-xs text-rose-500 font-medium font-body">{errors.juktoborno.message}</p>
              )}
            </div>

            {/* Live Preview for Juktoborno */}
            {watchJuktoborno && watchJuktoborno.trim() !== "" && (
              <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-950/10 p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-primary uppercase tracking-wider font-headline">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>লাইভ যুক্তবর্ণ প্রিভিউ (Live Juktoborno Preview)</span>
                </div>
                <div className="text-lg sm:text-2xl text-foreground font-bold whitespace-pre-wrap leading-relaxed font-headline">
                  <RenderMath text={watchJuktoborno} isMath={/[\$\\]/.test(watchJuktoborno)} />
                </div>
              </div>
            )}

            {/* Active Toggle Flag */}
            <div className="border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4">
                <div>
                  <p className="text-sm font-bold text-foreground font-headline">
                    অ্যাক্টিভ যুক্তবর্ণের অবস্থা
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-body">
                    পরীক্ষা ও অনুশীলনে শিক্ষার্থীদের জন্য অবিলম্বে দৃশ্যমান করুন।
                  </p>
                </div>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="size-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                    />
                  )}
                />
              </div>
            </div>

            {/* Context & Metadata Settings */}
            <div className="space-y-6 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-primary flex items-center gap-1.5 font-headline">
                <Sparkles className="w-3.5 h-3.5" />
                মেটাডাটা ও অতিরিক্ত সেটিংস
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Difficulty */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
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
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between font-body">
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
                    <p className="text-xs text-rose-500 font-medium font-body">{errors.difficulty.message}</p>
                  )}
                </div>

                {/* Source */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                    প্রশ্নের উৎস (Source)
                  </Label>
                  <Controller
                    name="source"
                    control={control}
                    render={({ field }) => (
                      <Select
                        key={`source-select-${field.value || "empty"}-${combinedSources.length}`}
                        disabled={isSubmitting}
                        value={field.value || DEFAULT_SOURCE}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between font-body">
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
                    <p className="text-xs text-rose-500 font-medium font-body">{errors.source.message}</p>
                  )}
                </div>

                {/* Session */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                    সেশন (Session)
                  </Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="যেমন: ২০২৬"
                    {...register("session")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                  />
                  {errors.session && (
                    <p className="text-xs text-rose-500 font-medium font-body">{errors.session.message}</p>
                  )}
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                    পরীক্ষার বছর (ঐচ্ছিক)
                  </Label>
                  <Input
                    type="number"
                    disabled={isSubmitting}
                    placeholder="যেমন: ২০২৪"
                    {...register("year")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                  />
                  {errors.year && (
                    <p className="text-xs text-rose-500 font-medium font-body">{errors.year.message}</p>
                  )}
                </div>

                {/* Reference */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                    রেফারেন্স / উৎস ট্যাগ (কমা দিয়ে একাধিক উল্লেখ করুন)
                  </Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="যেমন: ঢাকা বোর্ড ২০২৩, পাঠ্যবই পৃষ্ঠা ৪২..."
                    {...register("referenceText")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <Button
                asChild
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-xl border-slate-200 dark:border-white/[0.08] text-foreground font-semibold px-6 h-11 font-headline cursor-pointer"
              >
                <Link href="/juktoborno" prefetch={true}>
                  বাতিল করুন
                </Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 h-11 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>আপডেট হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>পরিবর্তন সংরক্ষণ করুন</span>
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

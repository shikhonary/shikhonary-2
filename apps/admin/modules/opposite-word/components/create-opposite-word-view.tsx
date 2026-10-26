"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useCreateOppositeWord,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-opposite-word"
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
import { OPPOSITE_WORD_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import {
  BookOpen,
  Save,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Sparkles,
} from "lucide-react"

const createOppositeWordFormSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  chapterId: z.string().min(1, "অধ্যায় নির্বাচন করুন"),
  word: z.string().min(1, "মূল শব্দ আবশ্যক"),
  oppositeWord: z.string().min(1, "বিপরীত শব্দ আবশ্যক"),
  oppositeWordsText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  referenceText: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  year: z.string().optional(),
  isActive: z.boolean(),
})

type CreateOppositeWordFormData = z.infer<typeof createOppositeWordFormSchema>

export function CreateOppositeWordView() {
  const router = useRouter()
  const createMutation = useCreateOppositeWord()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateOppositeWordFormData>({
    resolver: zodResolver(createOppositeWordFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      word: "",
      oppositeWord: "",
      oppositeWordsText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
      source: DEFAULT_SOURCE,
      session: new Date().getFullYear().toString(),
      year: "",
      isActive: true,
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

  const watchWord = watch("word")
  const watchOppositeWord = watch("oppositeWord")
  const watchSource = watch("source")

  const combinedSources = useMemo(() => {
    const list: { value: string; label: string }[] = [...OPPOSITE_WORD_SOURCE_OPTIONS]
    if (watchSource && !list.some((s) => s.value === watchSource)) {
      list.unshift({ value: watchSource, label: watchSource })
    }
    return list
  }, [watchSource])

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const onSubmit = async (data: CreateOppositeWordFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const oppositeWordsArray = data.oppositeWordsText
        ? data.oppositeWordsText
            .split(",")
            .map((w) => w.trim())
            .filter((w) => w.length > 0)
        : []

      const resolvedSession =
        data.session?.trim() ||
        (data.year ? data.year.trim() : new Date().getFullYear().toString())

      await createMutation.mutateAsync({
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        academicChapterId: data.chapterId,
        word: data.word.trim(),
        oppositeWord: data.oppositeWord.trim(),
        oppositeWords: oppositeWordsArray,
        difficulty: data.difficulty,
        reference: referenceArray,
        source: data.source ? data.source.trim() : DEFAULT_SOURCE,
        session: resolvedSession,
        isActive: data.isActive,
      })

      toast.success("নতুন বিপরীত শব্দ সফলভাবে তৈরি হয়েছে।")
      router.push("/opposite-words")
    } catch (err: any) {
      const msg = err.message || "বিপরীত শব্দ তৈরি করা সম্ভব হয়নি"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="নতুন বিপরীত শব্দ যোগ করুন"
        description="শ্রেণি, বিষয় ও অধ্যায় নির্বাচন করে নতুন শব্দ ও তার বিপরীত শব্দ তৈরি করুন।"
        badge={{ label: "বিপরীত শব্দ প্রশ্ন ব্যাংক", variant: "indigo" }}
        icon={BookOpen}
        breadcrumbs={[
          { label: "ড্যাশবোর্ড", href: "/" },
          { label: "বিপরীত শব্দ", href: "/opposite-words" },
          { label: "নতুন বিপরীত শব্দ" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2 font-headline cursor-pointer"
        >
          <Link href="/opposite-words" prefetch={true}>
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

      {/* Main Creation Card */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-8 bg-slate-50/50 dark:bg-white/[0.02] flex flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 text-indigo-600 dark:text-primary flex items-center justify-center shrink-0 shadow-sm shadow-indigo-100/50 dark:shadow-none">
            <BookOpen className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground font-headline">
              বিপরীত শব্দের বিবরণ
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              শ্রেণি, বিষয়, অধ্যায়, মূল শব্দ, বিপরীত শব্দ ও রেফারেন্সের নির্ভুল তথ্য প্রদান করুন।
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
                      key={`class-select-${field.value || "empty"}`}
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
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64">
                        {academicClasses.map((cls) => (
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
                      key={`subject-select-${field.value || "empty"}`}
                      disabled={isSubmitting || !selectedClassId}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50 font-body">
                        <SelectValue
                          placeholder={
                            selectedClassId
                              ? "বিষয় নির্বাচন করুন..."
                              : "প্রথমে শ্রেণি নির্বাচন করুন"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64">
                        {subjects.map((sub) => (
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
                      key={`chapter-select-${field.value || "empty"}`}
                      disabled={isSubmitting || !selectedSubjectId}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50 font-body">
                        <SelectValue
                          placeholder={
                            selectedSubjectId
                              ? "অধ্যায় নির্বাচন করুন..."
                              : "প্রথমে বিষয় নির্বাচন করুন"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64">
                        {chapters.map((ch) => (
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

            {/* Word Statement Text */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  মূল শব্দ (Main Word) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  disabled={isSubmitting}
                  placeholder="মূল শব্দ লিখুন (যেমন: আকাশ, আলো, জীবন)..."
                  {...register("word")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-headline font-semibold"
                />
                {errors.word && (
                  <p className="text-xs text-rose-500 font-medium font-body">{errors.word.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  বিপরীত শব্দ (Opposite Word) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  disabled={isSubmitting}
                  placeholder="সঠিক বিপরীত শব্দ লিখুন (যেমন: পাতাল, অন্ধকার, মরণ)..."
                  {...register("oppositeWord")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-headline font-semibold"
                />
                {errors.oppositeWord && (
                  <p className="text-xs text-rose-500 font-medium font-body">{errors.oppositeWord.message}</p>
                )}
              </div>
            </div>

            {/* Live Previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {watchWord && watchWord.trim() !== "" && (
                <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-950/10 p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-primary uppercase tracking-wider font-headline">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>মূল শব্দ প্রিভিউ</span>
                  </div>
                  <div className="text-base sm:text-lg text-foreground font-bold whitespace-pre-wrap leading-relaxed font-headline">
                    <RenderMath text={watchWord} isMath={/[\$\\]/.test(watchWord)} />
                  </div>
                </div>
              )}

              {watchOppositeWord && watchOppositeWord.trim() !== "" && (
                <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10 p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-headline">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>বিপরীত শব্দ প্রিভিউ</span>
                  </div>
                  <div className="text-base sm:text-lg text-emerald-700 dark:text-emerald-400 font-bold whitespace-pre-wrap leading-relaxed font-headline">
                    <RenderMath text={watchOppositeWord} isMath={/[\$\\]/.test(watchOppositeWord)} />
                  </div>
                </div>
              )}
            </div>

            {/* Alternative Opposite Words */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                বিকল্প বিপরীত শব্দসমূহ (কমা দিয়ে একাধিক উল্লেখ করুন)
              </Label>
              <Input
                disabled={isSubmitting}
                placeholder="যেমন: আঁধার, তমিস্রা..."
                {...register("oppositeWordsText")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
              />
            </div>

            {/* Active Toggle Flag */}
            <div className="border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-foreground font-headline">
                    শব্দ স্ট্যাটাস (Active / Inactive)
                  </Label>
                  <p className="text-xs text-muted-foreground font-body">
                    অ্যাক্টিভ থাকলে এই বিপরীত শব্দটি শিক্ষার্থীদের অনুশীলনের জন্য অবিলম্বে উপলব্ধ থাকবে।
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
                      disabled={isSubmitting}
                      className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  )}
                />
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  কাঠিন্য মাত্রা
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
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body">
                        <SelectValue placeholder="কাঠিন্য নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                        {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Source Select */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  উৎস (Source)
                </Label>
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`source-select-${field.value || "empty"}`}
                      disabled={isSubmitting}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body">
                        <SelectValue placeholder="উৎস নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                        {combinedSources.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Session / Year */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  সাল / সেশন (Session)
                </Label>
                <Input
                  disabled={isSubmitting}
                  placeholder="যেমন: ২০২৪"
                  {...register("session")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                />
              </div>

              {/* References */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  রেফারেন্স (কমা দিয়ে লিখুন)
                </Label>
                <Input
                  disabled={isSubmitting}
                  placeholder="যেমন: ঢাকা বোর্ড ২০২৪, সমাপনী"
                  {...register("referenceText")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                />
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200/80 dark:border-white/[0.08]">
              <Button
                type="button"
                asChild
                variant="outline"
                className="w-full sm:w-auto rounded-xl border-slate-200 dark:border-white/[0.08] text-foreground font-semibold px-6 h-11 font-headline cursor-pointer"
              >
                <Link href="/opposite-words" prefetch={true}>
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

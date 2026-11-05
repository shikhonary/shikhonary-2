"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useCreateSummary, useSubjectsForSelection, useAcademicClassesForSelection } from "../services/use-summary"
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
import { RenderMath } from "@workspace/ui/components/render-math"
import { PageHeader } from "@/components/shared/page-header"
import {
  FileText,
  ArrowLeft,
  Loader2,
  Save,
  AlertCircle,
  BookOpen,
  Sparkles,
} from "lucide-react"

const createSummaryFormSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  title: z.string().min(1, "সারাংশ বা সারমর্ম অনুচ্ছেদ আবশ্যক"),
  referenceText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "ভিউ সংখ্যা অবশ্যই সংখ্যা হতে হবে",
  }),
})

type CreateSummaryFormData = z.infer<typeof createSummaryFormSchema>

export function CreateSummaryView() {
  const router = useRouter()
  const createMutation = useCreateSummary()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateSummaryFormData>({
    resolver: zodResolver(createSummaryFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      title: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
    },
  })

  const selectedClassId = watch("classId")
  const watchTitle = watch("title")
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const onSubmit = async (data: CreateSummaryFormData) => {
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
        popularityCount: Number(data.popularityCount) || 0,
        reference: referenceArray,
      })

      toast.success("সারাংশটি সফলভাবে তৈরি করা হয়েছে।")
      setTimeout(() => {
        router.push("/summaries")
      }, 500)
    } catch (err: any) {
      const msg = err.message || "সারাংশ তৈরিতে সমস্যা হয়েছে"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header */}
      <PageHeader
        title="নতুন সারাংশ ও সারমর্ম তৈরি"
        description="শ্রেণি ও বিষয় নির্বাচন করে প্রশ্নপত্র ভান্ডারে নতুন সারাংশ বা সারমর্ম অনুচ্ছেদ যুক্ত করুন।"
        icon={FileText}
        badge={{ label: "নতুন সারাংশ", variant: "indigo" }}
        breadcrumbs={[
          { label: "সারাংশ তালিকা", href: "/summaries" },
          { label: "নতুন সারাংশ তৈরি" },
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

      {/* Main Form Card */}
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
              শ্রেণি, বিষয়, সারাংশ বা সারমর্ম অনুচ্ছেদ ও রেফারেন্স তথ্য নির্ভুলভাবে পূরণ করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Academic Classification */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-headline">
                একাডেমিক তথ্য (Academic Association)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                            <SelectItem
                              key={cls.id}
                              value={cls.id}
                              label={cls.nameBn || cls.nameEn}
                            >
                              {cls.nameBn || cls.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.classId && (
                    <p className="text-xs font-semibold text-rose-500">{errors.classId.message}</p>
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
                            <SelectItem
                              key={sub.id}
                              value={sub.id}
                              label={sub.nameBn || sub.nameEn}
                            >
                              {sub.nameBn || sub.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.subjectId && (
                    <p className="text-xs font-semibold text-rose-500">{errors.subjectId.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Passage / Text Prompt */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                placeholder="যে অনুচ্ছেদ বা কবিতার সারাংশ/সারমর্ম লিখতে হবে তা এখানে লিখুন বা পেস্ট করুন..."
                {...register("title")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] p-4 text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 font-body leading-relaxed"
              />
              {errors.title && (
                <p className="text-xs font-semibold text-rose-500">{errors.title.message}</p>
              )}

              {/* Live Preview */}
              {watchTitle && watchTitle.trim().length > 0 && (
                <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20 p-4 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block font-headline">
                    লাইভ প্রিভিউ (Live Preview):
                  </span>
                  <div className="text-sm sm:text-base leading-relaxed text-foreground font-body whitespace-pre-wrap">
                    <RenderMath text={watchTitle} isMath={true} />
                  </div>
                </div>
              )}
            </div>

            {/* Metadata & Reference */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-headline">
                মেটাডাটা ও রেফারেন্স (Metadata)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Reference Citations */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="referenceText" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    রেফারেন্স ট্যাগ / বোর্ড সন
                  </Label>
                  <Input
                    id="referenceText"
                    placeholder="যেমন: ঢাকা বোর্ড ২০২৪, রাজশাহী বোর্ড ২০২৩, এসএসসি ২০২২"
                    {...register("referenceText")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4"
                  />
                  <p className="text-[11px] text-muted-foreground font-body">
                    একাধিক রেফারেন্স কমা (,) দিয়ে আলাদা করুন।
                  </p>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    কঠিনতার মাত্রা (Difficulty)
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
                          <SelectValue placeholder="কঠিনতা..." />
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
                    <p className="text-xs font-semibold text-rose-500">{errors.difficulty.message}</p>
                  )}
                </div>
              </div>

              {/* Popularity Count */}
              <div className="w-full sm:w-1/3 space-y-2">
                <Label htmlFor="popularityCount" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  প্রাথমিক ভিউ সংখ্যা
                </Label>
                <Input
                  id="popularityCount"
                  type="number"
                  min="0"
                  {...register("popularityCount")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4"
                />
                {errors.popularityCount && (
                  <p className="text-xs font-semibold text-rose-500">{errors.popularityCount.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200/80 dark:border-white/[0.08]">
              <Button
                asChild
                type="button"
                variant="outline"
                className="rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] font-semibold text-foreground px-5 h-11"
              >
                <Link href="/summaries">বাতিল করুন</Link>
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 h-11 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all cursor-pointer font-headline"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>সংরক্ষণ করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>সারাংশ সংরক্ষণ করুন</span>
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

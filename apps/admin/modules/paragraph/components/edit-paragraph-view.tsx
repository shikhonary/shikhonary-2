"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useParagraphById,
  useUpdateParagraph,
  useSubjectsForSelection,
  useChaptersForSelection,
  useAcademicClassesForSelection,
} from "../services/use-paragraph"
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
import {
  BookOpen,
  ArrowLeft,
  Clock,
  Loader2,
  Save,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { PARAGRAPH_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"

const editParagraphFormSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  chapterId: z.string().optional(),
  name: z.string().min(1, "অনুচ্ছেদ বা কম্প্রিহেনশনের বিষয়বস্তু আবশ্যক"),
  referenceText: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  isActive: z.boolean(),
})

type EditParagraphFormData = z.infer<typeof editParagraphFormSchema>

interface EditParagraphViewProps {
  id?: string
}

export function EditParagraphView({ id }: EditParagraphViewProps) {
  const router = useRouter()
  const params = useParams()
  const paragraphId = id || (params?.id as string)

  const { data: paragraphData, isLoading: isParagraphLoading, isError } = useParagraphById(paragraphId)
  const updateMutation = useUpdateParagraph()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  // Resolve initial classId robustly from subject or chapter relationships
  const initialClassId = useMemo(() => {
    if (!paragraphData) return ""
    return (
      (paragraphData as any).subject?.classSubjects?.[0]?.academicClassId ||
      (paragraphData as any).subject?.classSubjects?.[0]?.classId ||
      (paragraphData as any).academicChapter?.subject?.classSubjects?.[0]?.academicClassId ||
      ""
    )
  }, [paragraphData])

  const formValues = useMemo(() => {
    if (!paragraphData) return undefined
    return {
      classId: initialClassId,
      subjectId: paragraphData.subjectId || "",
      chapterId: paragraphData.academicChapterId || (paragraphData as any).chapterId || "",
      name: paragraphData.name || "",
      referenceText: Array.isArray(paragraphData.reference) ? paragraphData.reference.join(", ") : "",
      source: (paragraphData as any).source ? String((paragraphData as any).source).trim() : DEFAULT_SOURCE,
      session: (paragraphData as any).session || new Date().getFullYear().toString(),
      isActive: paragraphData.isActive !== undefined ? paragraphData.isActive : true,
    }
  }, [paragraphData, initialClassId])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditParagraphFormData>({
    resolver: zodResolver(editParagraphFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      name: "",
      referenceText: "",
      source: DEFAULT_SOURCE,
      session: new Date().getFullYear().toString(),
      isActive: true,
    },
    values: formValues,
    resetOptions: {
      keepDirtyValues: true,
    },
  })

  const selectedClassId = watch("classId")
  const selectedSubjectId = watch("subjectId")
  const watchName = watch("name")

  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: EditParagraphFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      await updateMutation.mutateAsync({
        id: paragraphId,
        subjectId: data.subjectId,
        chapterId: data.chapterId || null,
        name: data.name.trim(),
        reference: referenceArray,
        source: data.source?.trim() || DEFAULT_SOURCE,
        session: data.session?.trim() || new Date().getFullYear().toString(),
        isActive: data.isActive,
      })

      toast.success("অনুচ্ছেদটি সফলভাবে পরিবর্তন সংরক্ষণ করা হয়েছে।")
      setTimeout(() => {
        router.push("/paragraphs")
      }, 500)
    } catch (err: any) {
      const msg = err.message || "অনুচ্ছেদ হালনাগাদে সমস্যা হয়েছে"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  // Loading skeleton state
  if (isParagraphLoading) {
    return (
      <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
        <PageHeader
          title="অনুচ্ছেদ ও কম্প্রিহেনশন সম্পাদনা"
          description="অনুচ্ছেদের তথ্য ও রেফারেন্স লোড করা হচ্ছে..."
          icon={BookOpen}
          badge={{ label: "অনুচ্ছেদ সম্পাদনা", variant: "indigo" }}
        />
        <div className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-8 shadow-xs animate-pulse space-y-6">
          <div className="h-6 w-48 bg-slate-200 dark:bg-white/10 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-11 bg-slate-200 dark:bg-white/10 rounded-xl" />
            <div className="h-11 bg-slate-200 dark:bg-white/10 rounded-xl" />
            <div className="h-11 bg-slate-200 dark:bg-white/10 rounded-xl" />
          </div>
          <div className="h-32 bg-slate-200 dark:bg-white/10 rounded-xl" />
        </div>
      </div>
    )
  }

  // Error state
  if (isError || !paragraphData) {
    return (
      <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
        <PageHeader
          title="অনুচ্ছেদ ও কম্প্রিহেনশন সম্পাদনা"
          description="অনুচ্ছেদটি লোড করা সম্ভব হয়নি।"
          icon={BookOpen}
          badge={{ label: "অনুচ্ছেদ সম্পাদনা", variant: "indigo" }}
        />
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-rose-700 dark:text-rose-400 font-headline">
            অনুচ্ছেদটি খুঁজে পাওয়া যায়নি
          </h3>
          <p className="text-xs text-muted-foreground font-body">
            অনুচ্ছেদটি মুছে ফেলা হয়ে থাকতে পারে বা আপনার অনুমতি নেই।
          </p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/paragraphs">তালিকায় ফিরে যান</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header */}
      <PageHeader
        title="অনুচ্ছেদ ও কম্প্রিহেনশন সম্পাদনা"
        description="শ্রেণি, বিষয় ও অধ্যায় ভিত্তিক অনুচ্ছেদের তথ্য হালনাগাদ করুন।"
        icon={BookOpen}
        badge={{ label: "অনুচ্ছেদ সম্পাদনা", variant: "indigo" }}
        breadcrumbs={[
          { label: "অনুচ্ছেদ তালিকা", href: "/paragraphs" },
          { label: "অনুচ্ছেদ সম্পাদনা" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs font-headline"
        >
          <Link href="/paragraphs" prefetch={true}>
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
              অনুচ্ছেদের বিবরণ ও কনফিগারেশন
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              শ্রেণি, বিষয়, অধ্যায়, অনুচ্ছেদের মূল টেক্সট, রেফারেন্স ও সেশন নির্ভুলভাবে পূরণ করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Academic Class, Subject & Chapter Hierarchy */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Class */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-body">
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
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between cursor-pointer font-body">
                        <SelectValue placeholder="শ্রেণি নির্বাচন করুন..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
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
                  <p className="text-xs text-rose-500 font-medium">{errors.classId.message}</p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-body">
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
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50 cursor-pointer font-body">
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
                  <p className="text-xs text-rose-500 font-medium">{errors.subjectId.message}</p>
                )}
              </div>

              {/* Chapter */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-body">
                  অধ্যায় (Chapter - ঐচ্ছিক)
                </Label>
                <Controller
                  name="chapterId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isSubmitting || !selectedSubjectId}
                      value={field.value || "none"}
                      onValueChange={(val) =>
                        field.onChange(val === "none" ? "" : val)
                      }
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50 cursor-pointer font-body">
                        <SelectValue
                          placeholder={
                            selectedSubjectId
                              ? "অধ্যায় নির্বাচন করুন..."
                              : "প্রথমে বিষয় নির্বাচন করুন"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
                        <SelectItem value="none">কোনো অধ্যায় নয় (সাধারণ)</SelectItem>
                        {chapters.map((ch) => (
                          <SelectItem
                            key={ch.id}
                            value={ch.id}
                            label={ch.nameBn || ch.nameEn}
                          >
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

            {/* Paragraph Passage Content Textarea */}
            <div className="space-y-3 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <div className="flex items-center justify-between">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  অনুচ্ছেদ বা পাঠ সংক্ষেপ (Paragraph / Passage Text) <span className="text-rose-500">*</span>
                </Label>
                {watchName && (
                  <span className="text-xs text-muted-foreground font-body">
                    {watchName.length} অক্ষর
                  </span>
                )}
              </div>
              <Textarea
                disabled={isSubmitting}
                rows={8}
                placeholder="অনুচ্ছেদ বা পাঠের বিস্তারিত অংশটি এখানে লিখুন। প্রয়োজনে LaTeX সমীকরণ যেমন $...$ বা $$...$$ ব্যবহার করতে পারেন..."
                {...register("name")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-4 font-body leading-relaxed"
              />
              {errors.name && (
                <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
              )}

              {/* Live KaTeX / Math Preview Card */}
              {watchName && watchName.trim() && (
                <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950/50 bg-indigo-50/30 dark:bg-indigo-950/10 p-5 space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 font-headline">
                      <Sparkles className="w-3.5 h-3.5" />
                      লাইভ প্রিভিউ (KaTeX Math & Markdown):
                    </span>
                    <span className="text-[11px] text-muted-foreground font-body">
                      রেন্ডারকৃত আউটপুট
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 text-slate-900 dark:text-foreground font-body text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    <RenderMath text={watchName} isMath={true} />
                  </div>
                </div>
              )}
            </div>

            {/* Active Toggle State */}
            <div className="border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4">
                <div>
                  <p className="text-sm font-bold text-foreground font-headline">
                    অ্যাক্টিভ অনুচ্ছেদের অবস্থা
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

            {/* Reference & Metadata Settings */}
            <div className="space-y-6 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-primary flex items-center gap-1.5 font-headline">
                <Sparkles className="w-3.5 h-3.5" />
                মেটাডাটা ও অতিরিক্ত সেটিংস
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Reference */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-body">
                    রেফারেন্স / বোর্ড (কমা দিয়ে একাধিক উল্লেখ করুন)
                  </Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="যেমন: ঢাকা বোর্ড ২০২৪, রাজউক উত্তরা মডেল কলেজ ২০২৩..."
                    {...register("referenceText")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                  />
                </div>

                {/* Source */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-body">
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
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between cursor-pointer font-body">
                          <SelectValue placeholder="উৎস নির্বাচন করুন...">
                            {field.value}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg font-body">
                          {PARAGRAPH_SOURCE_OPTIONS.map((opt) => (
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
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-body">
                    সেশন (Session)
                  </Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="যেমন: ২০২৬"
                    {...register("session")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-body"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6 sm:pt-8 mt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>সর্বশেষ পরিবর্তনের বিবরণ সংরক্ষিত হবে</span>
              </div>
              <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold px-6 h-11 text-sm transition-all active:scale-95 cursor-pointer font-headline"
                >
                  <Link href="/paragraphs" prefetch={true}>
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
                  <span>{isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useChapterById,
  useUpdateChapter,
  useSubjectsForSelection,
  useAcademicYearsForSelection,
  useAcademicClassesForSelection,
} from "../services/use-chapter"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Layers, Loader2, Save, BookOpen, AlertCircle, ChevronRight } from "lucide-react"

const editChapterFormSchema = z.object({
  nameBn: z.string().min(1, "অধ্যায়ের বাংলা নাম আবশ্যক"),
  nameEn: z.string().min(1, "অধ্যায়ের ইংরেজি নাম আবশ্যক"),
  position: z.coerce.number().int().min(0, "ক্রম অবশ্যই শূন্য বা ধনাত্মক সংখ্যা হতে হবে"),
  isActive: z.boolean(),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করা আবশ্যক"),
  academicYearId: z.string().optional().nullable(),
})

type EditChapterFormData = z.infer<typeof editChapterFormSchema>

interface EditChapterViewProps {
  chapterId: string
}

export function EditChapterView({ chapterId }: EditChapterViewProps) {
  const { data: chapter, isLoading: isChapterLoading, isError } = useChapterById(chapterId)
  const { data: yearsData, isLoading: isYearsLoading } = useAcademicYearsForSelection()

  if (isChapterLoading || isYearsLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-indigo-600 dark:text-primary" />
          <p className="text-sm font-semibold text-foreground">অধ্যায়ের বিবরণ লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (isError || !chapter) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
        <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 p-8 text-center space-y-3">
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
            অধ্যায়ের তথ্য পাওয়া যায়নি অথবা লোড করতে সমস্যা হয়েছে।
          </p>
          <Link href="/chapters">
            <Button variant="outline" className="rounded-xl border-slate-200 dark:border-white/[0.08]">
              অধ্যায় তালিকায় ফিরে যান
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <EditChapterForm
      chapter={chapter}
      years={yearsData?.academicYears ?? []}
    />
  )
}

interface EditChapterFormProps {
  chapter: any
  years: any[]
}

function EditChapterForm({ chapter, years }: EditChapterFormProps) {
  const router = useRouter()
  const updateMutation = useUpdateChapter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<string>("None")

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditChapterFormData>({
    resolver: zodResolver(editChapterFormSchema),
    defaultValues: {
      nameBn: chapter.nameBn,
      nameEn: chapter.nameEn,
      position: chapter.position,
      isActive: chapter.isActive,
      subjectId: chapter.subjectId,
      academicYearId: chapter.academicYearId ?? "",
    },
  })

  const selectedYear = watch("academicYearId")
  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const { data: classesData, isLoading: isClassesLoading } = useAcademicClassesForSelection(
    selectedYear || undefined
  )
  const classes = classesData?.academicClasses ?? []

  const { data: subjectsData, isLoading: isSubjectsLoading } = useSubjectsForSelection(
    selectedYear || undefined,
    selectedClass === "None" ? undefined : selectedClass
  )
  const subjects = subjectsData?.academicSubjects ?? []

  // Ensure current subject is in the list
  const combinedSubjects = useMemo(() => {
    if (!chapter.subject) return subjects
    const exists = subjects.some((s) => s.id === chapter.subject.id)
    if (exists) return subjects
    return [chapter.subject, ...subjects]
  }, [subjects, chapter.subject])

  const onSubmit = async (data: EditChapterFormData) => {
    setErrorMessage(null)

    try {
      await updateMutation.mutateAsync({
        id: chapter.id,
        nameBn: data.nameBn.trim(),
        nameEn: data.nameEn.trim(),
        position: data.position,
        subjectId: data.subjectId,
        academicYearId: data.academicYearId || null,
        isActive: data.isActive,
      })

      toast.success("অধ্যায়ের তথ্য সফলভাবে হালনাগাদ করা হয়েছে।")
      setTimeout(() => {
        router.push("/chapters")
      }, 700)
    } catch (err: any) {
      const msg = err.message || "অধ্যায় হালনাগাদ করতে সমস্যা হয়েছে"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full min-w-0 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header Section matching Subject module */}
      <div className="mb-6 sm:mb-8 flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/chapters"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Chapters
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-label-sm text-xs font-bold text-primary">Edit Chapter</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Edit Academic Chapter
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Update chapter title, index position, and subject associations.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 p-4 text-rose-600 dark:text-rose-400">
          <AlertCircle className="size-5 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Form Card matching MCQ */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs">
        <CardHeader className="border-b border-slate-200/60 dark:border-white/[0.06] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-primary flex items-center justify-center shrink-0">
              <BookOpen className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground font-headline">
                অধ্যায়ের তথ্য হালনাগাদ
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5 font-body">
                আইডি: <code className="font-mono text-xs">{chapter.id}</code> • প্রয়োজনীয় তথ্য সংশোধন করে সেভ করুন
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Row 1: Academic Year + Academic Class */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Academic Year */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  শিক্ষাবর্ষ (Academic Year)
                </Label>
                <Controller
                  control={control}
                  name="academicYearId"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5">
                        <SelectValue placeholder="শিক্ষাবর্ষ নির্বাচন করুন (ঐচ্ছিক)" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg font-body">
                        <SelectItem value="none">কোনো নির্দিষ্ট বছর নয়</SelectItem>
                        {years.map((y) => (
                          <SelectItem key={y.id} value={y.id}>
                            {y.nameBn || y.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Class Filter (helps filter subjects) */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  শ্রেণি (Class Filter)
                </Label>
                <Select
                  value={selectedClass}
                  onValueChange={(val) => setSelectedClass(val ?? "None")}
                  disabled={isSubmitting || isClassesLoading}
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5">
                    <SelectValue placeholder="শ্রেণি দিয়ে বিষয় ফিল্টার করুন" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg font-body">
                    <SelectItem value="None">সকল শ্রেণি</SelectItem>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nameBn || c.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Subject + Position */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Subject */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  বিষয় (Subject) <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="subjectId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                      disabled={isSubmitting || isSubjectsLoading}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5">
                        <SelectValue placeholder="বিষয় নির্বাচন করুন..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg max-h-60 font-body">
                        {combinedSubjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nameBn || s.nameEn} {s.code ? `(${s.code})` : ""}
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

              {/* Position / Serial Number */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  অধ্যায়ের ক্রম (Position / Serial Number) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  disabled={isSubmitting}
                  placeholder="যেমন: ১, ২, ৩..."
                  {...register("position")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-mono"
                />
                {errors.position && (
                  <p className="text-xs text-rose-500 font-medium">{errors.position.message}</p>
                )}
              </div>
            </div>

            {/* Row 3: Bangla Name + English Name */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Bangla Name */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  অধ্যায়ের নাম (বাংলা) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  disabled={isSubmitting}
                  placeholder="যেমন: প্রথম অধ্যায়: আমাদের পরিবেশ"
                  {...register("nameBn")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-headline"
                />
                {errors.nameBn && (
                  <p className="text-xs text-rose-500 font-medium">{errors.nameBn.message}</p>
                )}
              </div>

              {/* English Name */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  অধ্যায়ের নাম (English) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  disabled={isSubmitting}
                  placeholder="e.g. Chapter 1: Our Environment"
                  {...register("nameEn")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5"
                />
                {errors.nameEn && (
                  <p className="text-xs text-rose-500 font-medium">{errors.nameEn.message}</p>
                )}
              </div>
            </div>

            {/* Row 4: Status Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold text-foreground cursor-pointer">
                  অধ্যায় সক্রিয় থাকবে (Active Status)
                </Label>
                <p className="text-xs text-muted-foreground">
                  সক্রিয় থাকলে শিক্ষক ও শিক্ষার্থীরা এই অধ্যায়টি প্রশ্ন ব্যাংক ও সিলেবাসে দেখতে পাবে
                </p>
              </div>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            {/* Form Actions Footer matching MCQ */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-white/[0.06]">
              <Button
                type="button"
                variant="outline"
                asChild
                className="w-full sm:w-auto h-11 px-5 rounded-xl border-slate-200 dark:border-white/[0.08] text-muted-foreground hover:text-foreground"
              >
                <Link href="/chapters">বাতিল করুন</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm gap-2"
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

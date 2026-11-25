"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useDanBamMilkoronById,
  useUpdateDanBamMilkoron,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-dan-bam-milkoron"
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
import { ArrowLeft, Plus, Trash2, ArrowRightLeft, AlertCircle, Loader2, Save } from "lucide-react"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"
import { DAN_BAM_MILKORON_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import { PageHeader } from "@/components/shared/page-header"
import { DanBamMilkoronGrid } from "./dan-bam-milkoron-table"

const editDanBamMilkoronFormSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  chapterId: z.string().min(1, "অধ্যায় নির্বাচন করুন"),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  referenceText: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "জনপ্রিয়তা সংখ্যা হতে হবে",
  }),
})

type EditDanBamMilkoronFormData = z.infer<typeof editDanBamMilkoronFormSchema>

const difficultyLabels: Record<string, string> = {
  EASY: "সহজ (Easy)",
  MEDIUM: "মাঝারি (Medium)",
  HARD: "কঠিন (Hard)",
}

interface EditDanBamMilkoronViewProps {
  id: string
}

export function EditDanBamMilkoronView({ id }: EditDanBamMilkoronViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryString = searchParams?.toString()
  const listHref = queryString ? `/dan-bam-milkoron?${queryString}` : "/dan-bam-milkoron"

  const { data: item, isLoading, isError } = useDanBamMilkoronById(id)
  const updateMutation = useUpdateDanBamMilkoron()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [rows, setRows] = useState<Array<{ left: string; right: string }>>([
    { left: "", right: "" },
  ])

  const initialClassId = useMemo(() => {
    if (!item) return ""
    const itm = item as any
    return (
      itm.subject?.classSubjects?.[0]?.classId ||
      itm.academicChapter?.subject?.classSubjects?.[0]?.classId ||
      itm.classId ||
      ""
    )
  }, [item])

  const formValues = useMemo<EditDanBamMilkoronFormData | undefined>(() => {
    if (!item) return undefined
    const itm = item as any
    return {
      classId: initialClassId,
      subjectId: itm.subjectId || "",
      chapterId: itm.academicChapterId || itm.chapterId || "",
      difficulty: (itm.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
      referenceText: Array.isArray(itm.reference) ? itm.reference.join(", ") : "",
      source: itm.source ? String(itm.source).trim() : DEFAULT_SOURCE,
      session: itm.session || new Date().getFullYear().toString(),
      popularityCount: String(itm.popularityCount || 0),
    }
  }, [item, initialClassId])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditDanBamMilkoronFormData>({
    resolver: zodResolver(editDanBamMilkoronFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
      source: DEFAULT_SOURCE,
      session: new Date().getFullYear().toString(),
      popularityCount: "0",
    },
    values: formValues,
    resetOptions: {
      keepDirtyValues: true,
    },
  })

  const selectedClassId = watch("classId")
  const activeClassId = selectedClassId || initialClassId
  const selectedSubjectId = watch("subjectId")
  const activeSubjectId = selectedSubjectId || item?.subjectId || ""

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    activeClassId ? { academicClassId: activeClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    activeSubjectId ? { subjectId: activeSubjectId } : undefined
  )

  const combinedClasses = useMemo(() => {
    const map = new Map<string, any>()
    const subjectClass = (item as any)?.subject?.classSubjects?.[0]?.academicClass
    if (subjectClass) {
      map.set(subjectClass.id, subjectClass)
    }
    for (const cls of academicClasses) {
      map.set(cls.id, cls)
    }
    return Array.from(map.values())
  }, [academicClasses, item])

  const combinedSubjects = useMemo(() => {
    const map = new Map<string, any>()
    if ((item as any)?.subject) {
      map.set((item as any).subject.id, (item as any).subject)
    }
    for (const sub of subjects) {
      map.set(sub.id, sub)
    }
    return Array.from(map.values())
  }, [subjects, item])

  const combinedChapters = useMemo(() => {
    const map = new Map<string, any>()
    const chap = (item as any)?.academicChapter || (item as any)?.chapter
    if (chap) {
      map.set(chap.id, chap)
    }
    for (const ch of chapters) {
      map.set(ch.id, ch)
    }
    return Array.from(map.values())
  }, [chapters, item])

  const combinedSources = useMemo(() => {
    const list: { value: string; label: string }[] = [...DAN_BAM_MILKORON_SOURCE_OPTIONS]
    const currentSource = (item as any)?.source ? String((item as any).source).trim() : null
    if (currentSource && !list.some((s) => s.value === currentSource)) {
      list.unshift({ value: currentSource, label: currentSource })
    }
    return list
  }, [item])

  useEffect(() => {
    if (item) {
      const left = item.leftColumn || []
      const right = item.rightColumn || []
      const maxRows = Math.max(left.length, right.length, 1)
      const initialRows = Array.from({ length: maxRows }).map((_, idx) => ({
        left: left[idx] || "",
        right: right[idx] || "",
      }))
      setRows(initialRows)
    }
  }, [item])

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const handleRowChange = (index: number, col: "left" | "right", val: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [col]: val } : row))
    )
  }

  const addRow = () => setRows((prev) => [...prev, { left: "", right: "" }])
  const removeRow = (index: number) => {
    if (rows.length <= 1) return
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: EditDanBamMilkoronFormData) => {
    setErrorMessage(null)

    const leftColumn = rows.map((r) => r.left.trim()).filter(Boolean)
    const rightColumn = rows.map((r) => r.right.trim()).filter(Boolean)

    if (leftColumn.length === 0 || rightColumn.length === 0) {
      const msg = "বাম পাশ ও ডান পাশে কমপক্ষে ১টি করে আইটেম দিন।"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean)
        : []

      await updateMutation.mutateAsync({
        id,
        subjectId: data.subjectId,
        academicChapterId: data.chapterId,
        leftColumn,
        rightColumn,
        difficulty: data.difficulty,
        reference: referenceArray,
        source: data.source?.trim() || DEFAULT_SOURCE,
        session: data.session?.trim() || new Date().getFullYear().toString(),
        popularityCount: Number(data.popularityCount) || 0,
      })

      toast.success("ডান-বাম মিলকরণটি সফলভাবে আপডেট করা হয়েছে।")
      setTimeout(() => {
        router.push(listHref)
      }, 800)
    } catch (err: any) {
      const msg = err.message || "ডান-বাম মিলকরণ আপডেট করতে সমস্যা হয়েছে"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground space-y-3">
        <Loader2 className="w-7 h-7 animate-spin mx-auto text-indigo-600" />
        <p className="text-sm font-medium">ডান-বাম মিলকরণের তথ্য লোড হচ্ছে...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-16 text-center text-rose-600 border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/10 rounded-2xl">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-bold">ডান-বাম মিলকরণ লোড করা যায়নি</p>
        <p className="text-xs text-muted-foreground mt-1">অনুগ্রহ করে URL যাচাই করুন অথবা পৃষ্ঠাটি রিলোড দিন।</p>
      </div>
    )
  }

  const previewLeft = rows.map((r) => r.left.trim()).filter(Boolean)
  const previewRight = rows.map((r) => r.right.trim()).filter(Boolean)

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <PageHeader
        title="ডান-বাম মিলকরণ সম্পাদনা করুন"
        description="শ্রেণি, বিষয়, অধ্যায়, বাম ও ডান পাশের সারি এবং রেফারেন্স হালনাগাদ করুন।"
        icon={ArrowRightLeft}
        badge={{ label: "ডান-বাম মিলকরণ সম্পাদনা", variant: "indigo" }}
        breadcrumbs={[
          { label: "ডান-বাম মিলকরণ তালিকা", href: listHref },
          { label: "সম্পাদনা" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Link href={listHref} prefetch={true}>
            <ArrowLeft className="w-4 h-4" />
            <span>তালিকায় ফিরে যান</span>
          </Link>
        </Button>
      </PageHeader>

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-4 text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-7 flex flex-row items-center gap-3.5 sm:gap-4">
          <div className="flex size-11 sm:size-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary border border-indigo-100/80 dark:border-primary/20 shrink-0">
            <ArrowRightLeft className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold font-headline text-foreground">
              ডান-বাম মিলকরণের বিবরণ ও কলাম কনফিগারেশন
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              শ্রেণি, বিষয়, অধ্যায়, বাম ও ডান পাশের সারি এবং মেটাডেটা হালনাগাদ করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm h-11 px-4 justify-between">
                        <SelectValue placeholder="শ্রেণি নির্বাচন করুন..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-64">
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
                  <p className="text-xs font-medium text-rose-500">{errors.classId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  বিষয় (Subject) <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="subjectId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`subject-select-${field.value || "empty"}-${combinedSubjects.length}`}
                      disabled={isSubmitting || !activeClassId}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        setValue("chapterId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm h-11 px-4 justify-between disabled:opacity-50">
                        <SelectValue placeholder={activeClassId ? "বিষয় নির্বাচন করুন..." : "প্রথমে শ্রেণি নির্বাচন করুন"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-64">
                        {combinedSubjects.map((subj) => (
                          <SelectItem key={subj.id} value={subj.id}>
                            {subj.nameBn || subj.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subjectId && (
                  <p className="text-xs font-medium text-rose-500">{errors.subjectId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  অধ্যায় (Chapter) <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="chapterId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`chapter-select-${field.value || "empty"}-${combinedChapters.length}`}
                      disabled={isSubmitting || !activeSubjectId}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm h-11 px-4 justify-between disabled:opacity-50">
                        <SelectValue placeholder={activeSubjectId ? "অধ্যায় নির্বাচন করুন..." : "প্রথমে বিষয় নির্বাচন করুন"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-64">
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
                  <p className="text-xs font-medium text-rose-500">{errors.chapterId.message}</p>
                )}
              </div>
            </div>

            {/* 2-Column Rows Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  বাম পাশ ও ডান পাশের সারি (Columns) <span className="text-rose-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRow}
                  disabled={isSubmitting}
                  className="h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>সারি যোগ করুন</span>
                </Button>
              </div>

              <div className="space-y-2.5">
                {rows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2.5 items-center">
                    <Input
                      disabled={isSubmitting}
                      value={row.left}
                      onChange={(e) => handleRowChange(idx, "left", e.target.value)}
                      placeholder={`বাম পাশ ${idx + 1}...`}
                      className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4 text-sm"
                    />
                    <Input
                      disabled={isSubmitting}
                      value={row.right}
                      onChange={(e) => handleRowChange(idx, "right", e.target.value)}
                      placeholder={`ডান পাশ ${idx + 1}...`}
                      className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(idx)}
                      disabled={isSubmitting || rows.length <= 1}
                      className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {(previewLeft.length > 0 || previewRight.length > 0) && (
                <div className="pt-2 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    লাইভ গ্রিড প্রিভিউ:
                  </span>
                  <DanBamMilkoronGrid leftColumn={previewLeft} rightColumn={previewRight} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  কঠিনতার স্তর
                </Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select key={`difficulty-select-${field.value || "empty"}`} disabled={isSubmitting} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {difficultyLabels[opt.value] || opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  উৎস (Source)
                </Label>
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <Select key={`source-select-${field.value || "empty"}-${combinedSources.length}`} disabled={isSubmitting} value={field.value || DEFAULT_SOURCE} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
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

              <div className="space-y-2">
                <Label htmlFor="session" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  সেশন / বছর
                </Label>
                <Input
                  id="session"
                  disabled={isSubmitting}
                  {...register("session")}
                  className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="popularityCount" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  জনপ্রিয়তা সংখ্যা
                </Label>
                <Input
                  id="popularityCount"
                  type="number"
                  disabled={isSubmitting}
                  {...register("popularityCount")}
                  className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4 text-sm"
                />
                {errors.popularityCount && (
                  <p className="text-xs font-medium text-rose-500">{errors.popularityCount.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceText" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                রেফারেন্স / বোর্ড ট্যাগ (References)
              </Label>
              <Input
                id="referenceText"
                type="text"
                disabled={isSubmitting}
                placeholder="কমা দিয়ে একাধিক রেফারেন্স লিখুন..."
                {...register("referenceText")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] h-11 px-4 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <Button
                asChild
                variant="outline"
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 dark:border-white/[0.08] px-5 h-11 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                <Link href={listHref}>বাতিল</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 h-11 text-xs sm:text-sm font-bold text-white shadow-sm shadow-indigo-200 dark:shadow-none transition-all cursor-pointer disabled:opacity-50 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>আপডেট হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>আপডেট সংরক্ষণ করুন</span>
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

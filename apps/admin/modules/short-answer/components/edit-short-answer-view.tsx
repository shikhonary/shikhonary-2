"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useShortAnswerById,
  useUpdateShortAnswer,
  useSubjectsForSelection,
  useChaptersForSelection,
  useAcademicClassesForSelection,
} from "../services/use-short-answer"
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
import { SHORT_ANSWER_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import { RenderMath } from "@workspace/ui/components/render-math"
import { PageHeader } from "@/components/shared/page-header"
import { QuestionAttachmentUploader, type AttachmentItem } from "@/components/shared"
import {
  HelpCircle,
  ArrowLeft,
  Plus,
  Clock,
  Loader2,
  Save,
  AlertCircle,
  Sparkles,
  BookOpen,
} from "lucide-react"

const updateShortAnswerFormSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  chapterId: z.string().min(1, "অধ্যায় নির্বাচন করুন"),
  question: z.string().min(1, "প্রশ্নের বিবরণ আবশ্যক"),
  answer: z.string().optional(),
  options: z.array(z.object({ value: z.string() })),
  isMath: z.boolean(),
  referenceText: z.string().optional(),
  context: z.string().optional(),
  contextCaption: z.string().optional(),
  contextBottomContent: z.string().optional(),
  mediaAttachments: z
    .array(
      z.object({
        id: z.string().optional(),
        type: z.string(),
        caption: z.string().nullable().optional(),
        content: z.string().nullable().optional(),
        url: z.string().nullable().optional(),
        table: z.any().nullable().optional(),
        bottomContent: z.string().nullable().optional(),
        tableBorder: z.boolean().nullable().optional(),
        position: z.number().optional(),
      })
    )
    .optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  year: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  questionTypeId: z.string().optional(),
  isActive: z.boolean(),
})

type UpdateShortAnswerFormData = z.infer<typeof updateShortAnswerFormSchema>

const BENGALI_OPTION_LABELS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"]

export interface EditShortAnswerViewProps {
  id?: string
}

export function EditShortAnswerView({ id }: EditShortAnswerViewProps = {}) {
  const router = useRouter()
  const params = useParams()
  const shortAnswerId = id || (params?.id as string)

  const { data: saData, isLoading: isSaLoading, isError } = useShortAnswerById(shortAnswerId)
  const updateMutation = useUpdateShortAnswer()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: questionTypesData } = useQuestionTypesList({ limit: 100 })
  const questionTypes = questionTypesData?.questionTypes ?? []

  // Resolve initial classId robustly from subject relationships
  const initialClassId = useMemo(() => {
    if (!saData) return ""
    return (
      (saData as any)?.subject?.classSubjects?.[0]?.classId ||
      (saData as any)?.subject?.classSubjects?.[0]?.academicClass?.id ||
      (saData as any)?.subject?.classSubjects?.[0]?.academicClassId ||
      (saData as any)?.classId ||
      ""
    )
  }, [saData])

  // Synchronize form values directly with loaded Short Answer data
  const formValues = useMemo<UpdateShortAnswerFormData | undefined>(() => {
    if (!saData) return undefined

    const passageAttachment =
      (saData as any)?.attachments?.find(
        (a: any) =>
          (a.type === "PASSAGE" || a.type === "text") &&
          Boolean(a.content && a.content.trim())
      ) ||
      (saData as any)?.attachments?.find(
        (a: any) => a.type === "PASSAGE" || a.type === "text"
      )

    const initialContext = passageAttachment?.content?.trim() || ""
    const initialContextCaption = passageAttachment?.caption?.trim() || ""
    const initialContextBottomContent = passageAttachment?.bottomContent?.trim() || ""

    const mediaAttachments = ((saData as any)?.attachments || [])
      .filter(
        (a: any) =>
          a.id !== passageAttachment?.id && a.type !== "PASSAGE" && a.type !== "text"
      )
      .map((a: any) => ({
        id: a.id,
        type: a.type || "image",
        caption: a.caption || "",
        content: a.content || "",
        url: a.url || "",
        table: a.table || null,
        bottomContent: a.bottomContent || "",
        tableBorder: Boolean(a.tableBorder),
        position: a.position ?? 0,
      }))

    return {
      classId: initialClassId,
      subjectId: saData.subjectId || "",
      chapterId: saData.chapterId || "",
      context: initialContext,
      contextCaption: initialContextCaption,
      contextBottomContent: initialContextBottomContent,
      mediaAttachments,
      question: saData.question || "",
      answer: saData.answer || "",
      options: Array.isArray((saData as any).options)
        ? (saData as any).options.map((opt: string) => ({ value: opt }))
        : [],
      isMath: Boolean((saData as any).isMath),
      referenceText: (saData.reference || []).join(", "),
      difficulty: (saData.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
      year: (saData as any).year ? String((saData as any).year) : "",
      source: (saData as any).source ? String((saData as any).source).trim() : DEFAULT_SOURCE,
      session: (saData as any).session || new Date().getFullYear().toString(),
      questionTypeId: (saData as any).questionTypeId || "",
      isActive: saData.isActive !== undefined ? saData.isActive : true,
    }
  }, [saData, initialClassId])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<UpdateShortAnswerFormData>({
    resolver: zodResolver(updateShortAnswerFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      context: "",
      contextCaption: "",
      contextBottomContent: "",
      mediaAttachments: [],
      question: "",
      answer: "",
      options: [],
      isMath: false,
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      year: "",
      source: DEFAULT_SOURCE,
      session: new Date().getFullYear().toString(),
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
  const watchContext = watch("context")
  const watchContextCaption = watch("contextCaption")
  const watchContextBottomContent = watch("contextBottomContent")
  const watchMediaAttachments = watch("mediaAttachments")
  const watchQuestion = watch("question")
  const watchAnswer = watch("answer")
  const watchIsMath = watch("isMath")

  const { data: subjects = [] } = useSubjectsForSelection(
    activeClassId ? { academicClassId: activeClassId } : undefined
  )

  const selectedSubjectId = watch("subjectId")
  const activeSubjectId = selectedSubjectId || saData?.subjectId || ""

  const { data: chapters = [] } = useChaptersForSelection(
    activeSubjectId ? { subjectId: activeSubjectId } : undefined
  )

  // Ensure academic class for this item is always present in selection list
  const combinedClasses = useMemo(() => {
    const map = new Map<string, any>()
    const subjectClass = (saData as any)?.subject?.classSubjects?.[0]?.academicClass
    if (subjectClass) {
      map.set(subjectClass.id, subjectClass)
    }
    for (const cls of academicClasses) {
      map.set(cls.id, cls)
    }
    return Array.from(map.values())
  }, [academicClasses, saData])

  // Ensure subject from item is immediately present in options even before async query finishes
  const combinedSubjects = useMemo(() => {
    const map = new Map<string, any>()
    if (saData?.subject && (!activeClassId || activeClassId === initialClassId)) {
      map.set(saData.subject.id, saData.subject)
    }
    for (const sub of subjects) {
      map.set(sub.id, sub)
    }
    return Array.from(map.values())
  }, [subjects, saData?.subject, activeClassId, initialClassId])

  // Ensure chapter from item is immediately present in options even before async query finishes
  const combinedChapters = useMemo(() => {
    const map = new Map<string, any>()
    if (saData?.chapter && (!activeSubjectId || activeSubjectId === saData.subjectId)) {
      map.set(saData.chapter.id, saData.chapter)
    }
    for (const ch of chapters) {
      map.set(ch.id, ch)
    }
    return Array.from(map.values())
  }, [chapters, saData?.chapter, activeSubjectId, saData?.subjectId])

  // Ensure source from item is immediately present in source options list
  const combinedSources = useMemo(() => {
    const list: { value: string; label: string }[] = [...SHORT_ANSWER_SOURCE_OPTIONS]
    const currentSource = (saData as any)?.source ? String((saData as any).source).trim() : null
    if (currentSource && !list.some((s) => s.value === currentSource)) {
      list.unshift({ value: currentSource, label: currentSource })
    }
    return list
  }, [saData])

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: "options",
  })

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: UpdateShortAnswerFormData) => {
    setErrorMessage(null)

    try {
      const optionsArray = (data.options || [])
        .map((o) => o.value.trim())
        .filter((o) => o.length > 0)
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const parsedYear =
        data.year && !isNaN(Number(data.year))
          ? Number(data.year)
          : data.session && !isNaN(Number(data.session))
            ? Number(data.session)
            : null

      const compiledAttachments: any[] = []

      // 1. Passage / Stimulus attachment
      const hasPassage =
        data.context?.trim() ||
        data.contextCaption?.trim() ||
        data.contextBottomContent?.trim()
      if (hasPassage) {
        compiledAttachments.push({
          type: "PASSAGE",
          content: data.context?.trim() || null,
          caption: data.contextCaption?.trim() || null,
          bottomContent: data.contextBottomContent?.trim() || null,
          position: 0,
        })
      }

      // 2. Media attachments
      if (Array.isArray(data.mediaAttachments)) {
        for (const mAtt of data.mediaAttachments) {
          compiledAttachments.push({
            id: mAtt.id,
            type: mAtt.type || "image",
            url: mAtt.url || null,
            caption: mAtt.caption?.trim() || null,
            content: mAtt.content?.trim() || null,
            bottomContent: mAtt.bottomContent?.trim() || null,
            table: mAtt.table || null,
            tableBorder: mAtt.tableBorder ?? false,
            position: compiledAttachments.length,
          })
        }
      }

      await updateMutation.mutateAsync({
        id: shortAnswerId,
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        question: data.question.trim(),
        answer: data.answer?.trim() || null,
        options: optionsArray,
        isMath: data.isMath,
        reference: referenceArray,
        context: data.context?.trim() || null,
        contextCaption: data.contextCaption?.trim() || null,
        contextBottomContent: data.contextBottomContent?.trim() || null,
        attachments: compiledAttachments,
        difficulty: data.difficulty,
        year: parsedYear,
        source: data.source?.trim() || DEFAULT_SOURCE,
        session: data.session?.trim() || new Date().getFullYear().toString(),
        questionTypeId: data.questionTypeId || null,
        isActive: data.isActive,
      })

      toast.success("সংক্ষিপ্ত উত্তর প্রশ্নটি সফলভাবে হালনাগাদ করা হয়েছে।")
      setTimeout(() => {
        router.push("/short-answers")
      }, 600)
    } catch (err: any) {
      const msg = err.message || "সংক্ষিপ্ত উত্তর হালনাগাদে সমস্যা হয়েছে"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isSaLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
        <p className="mt-3 text-sm text-muted-foreground font-body">
          সংক্ষিপ্ত উত্তর প্রশ্নের তথ্য লোড হচ্ছে...
        </p>
      </div>
    )
  }

  if (isError || !saData) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-4">
        <p className="text-xl font-bold text-rose-600 font-headline">
          সংক্ষিপ্ত উত্তর প্রশ্নটি পাওয়া যায়নি
        </p>
        <p className="text-sm text-muted-foreground font-body">
          অনুরোধকৃত সংক্ষিপ্ত উত্তর প্রশ্নটি খুঁজে পাওয়া যায়নি অথবা মুছে ফেলা হয়েছে।
        </p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/short-answers">তালিকায় ফিরে যান</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header matching MCQ Edit Header */}
      <PageHeader
        title="সংক্ষিপ্ত উত্তর প্রশ্ন সম্পাদনা"
        description="শ্রেণি, বিষয় ও অধ্যায় ভিত্তিক সংক্ষিপ্ত উত্তর প্রশ্ন, আদর্শ উত্তর, অপশন ও মেটাডাটা তথ্য হালনাগাদ করুন।"
        icon={HelpCircle}
        badge={{ label: "সম্পাদনা মোড", variant: "amber" }}
        breadcrumbs={[
          { label: "সংক্ষিপ্ত উত্তর তালিকা", href: "/short-answers" },
          { label: "প্রশ্ন সম্পাদনা" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Link href="/short-answers" prefetch={true}>
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
          <div className="flex size-11 sm:size-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 shrink-0">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold font-headline text-foreground">
              প্রশ্নের বিবরণ ও অপশন কনফিগারেশন
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              শ্রেণি, বিষয়, অধ্যায়, মূল প্রশ্ন, আদর্শ উত্তর ও মেটাডাটা তথ্য সংশোধন করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Class, Subject & Chapter Hierarchy */}
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
                      key={`class-select-${field.value || "empty"}-${combinedClasses.length}`}
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
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64">
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
                      key={`subject-select-${field.value || "empty"}-${combinedSubjects.length}`}
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
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64">
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
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50">
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

            {/* Context / Stimulus Passage */}
            <div className="space-y-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <div>
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  উদ্দীপক / অনুচ্ছেদ (Context / Stimulus Passage)
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5 font-body">
                  প্রশ্নের উদ্দীপক ও ক্যাপশন (ঐচ্ছিক)
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-body">
                  শীর্ষ ক্যাপশন (Attachment Caption - ঐচ্ছিক)
                </Label>
                <Input
                  disabled={isSubmitting}
                  placeholder="যেমন: নিচের উদ্দীপকটি পড়ে পরবর্তী প্রশ্নের উত্তর দাও:"
                  {...register("contextCaption")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-body"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-body">
                  উদ্দীপক বা অনুচ্ছেদ (Passage Content - ঐচ্ছিক)
                </Label>
                <Textarea
                  disabled={isSubmitting}
                  rows={4}
                  placeholder="উদ্দীপক বা অনুচ্ছেদ লিখুন (যদি থাকে)..."
                  {...register("context")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5 font-body leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-body">
                  নিচের ক্যাপশন / উৎস (Bottom Caption Content - ঐচ্ছিক)
                </Label>
                <Input
                  disabled={isSubmitting}
                  placeholder="যেমন: [উৎস: পাঠ্যবই পৃষ্ঠা নং ৪৫]"
                  {...register("contextBottomContent")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-body"
                />
              </div>

              {((watchContext && watchContext.trim()) ||
                (watchContextCaption && watchContextCaption.trim()) ||
                (watchContextBottomContent && watchContextBottomContent.trim())) && (
                <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] p-4 text-xs space-y-2">
                  <span className="font-semibold text-muted-foreground block text-[11px] uppercase tracking-wider">
                    উদ্দীপক প্রিভিউ:
                  </span>
                  {watchContextCaption && watchContextCaption.trim() && (
                    <div className="font-bold text-sm text-foreground font-headline">
                      <RenderMath text={watchContextCaption.trim()} isMath={watchIsMath} />
                    </div>
                  )}
                  {watchContext && watchContext.trim() && (
                    <div className="whitespace-pre-wrap text-foreground font-body leading-relaxed text-sm">
                      <RenderMath text={watchContext.trim()} isMath={watchIsMath} />
                    </div>
                  )}
                  {watchContextBottomContent && watchContextBottomContent.trim() && (
                    <div className="text-muted-foreground font-body italic text-xs pt-1 border-t border-slate-200/50 dark:border-white/[0.05]">
                      <RenderMath text={watchContextBottomContent.trim()} isMath={watchIsMath} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Other Media Attachments */}
            <div className="space-y-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <div>
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                  সংযুক্ত ছবি ও চিত্র (Question Attachments)
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5 font-body">
                  প্রশ্নে সংযুক্ত ছবি আপলোড করুন অথবা ক্যাপশন ও বিবরণ যুক্ত করুন
                </p>
              </div>

              <QuestionAttachmentUploader
                resourceId={shortAnswerId}
                resourceType="GENERAL"
                attachments={(watchMediaAttachments || []) as AttachmentItem[]}
                onChange={(updated) => setValue("mediaAttachments", updated, { shouldDirty: true })}
                disabled={isSubmitting}
                isMath={watchIsMath}
              />
            </div>

            {/* Question Stem Text & Live Preview */}
            <div className="space-y-2 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <div className="flex items-center justify-between">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  প্রশ্নের মূল বিবরণ (Question Stem) <span className="text-rose-500">*</span>
                </Label>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  LaTeX ও Math সমর্থিত
                </span>
              </div>
              <Textarea
                disabled={isSubmitting}
                rows={4}
                placeholder="সংক্ষিপ্ত উত্তর প্রশ্নের মূল বিবরণ লিখুন..."
                {...register("question")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5 font-body leading-relaxed"
              />
              {errors.question && (
                <p className="text-xs text-rose-500 font-medium">{errors.question.message}</p>
              )}

              {watchIsMath && watchQuestion && watchQuestion.trim().length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] text-xs text-foreground space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    LaTeX ম্যাথ প্রিভিউ:
                  </span>
                  <div className="text-sm sm:text-base leading-relaxed text-foreground font-body whitespace-pre-wrap">
                    <RenderMath text={watchQuestion} isMath={true} />
                  </div>
                </div>
              )}
            </div>

            {/* Ideal Answer */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                আদর্শ উত্তর ও সমাধান (Ideal Answer - ঐচ্ছিক)
              </Label>
              <Textarea
                disabled={isSubmitting}
                rows={4}
                placeholder="সঠিক উত্তর বা মূল্যায়ন সমাধান লিখুন..."
                {...register("answer")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5 font-body leading-relaxed"
              />
              {errors.answer && (
                <p className="text-xs text-rose-500 font-medium">{errors.answer.message}</p>
              )}

              {watchIsMath && watchAnswer && watchAnswer.trim().length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-foreground space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                    উত্তর LaTeX প্রিভিউ:
                  </span>
                  <div className="text-sm leading-relaxed text-foreground font-body whitespace-pre-wrap">
                    <RenderMath text={watchAnswer} isMath={true} />
                  </div>
                </div>
              )}
            </div>

            {/* Answer Options Grid (Optional for Short Answer) */}
            <div className="space-y-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                    বিকল্প অপশনসমূহ (ঐচ্ছিক)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    প্রশ্নে একাধিক বিকল্প অপশন বা ক্লু থাকলে তা যুক্ত করুন।
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendOption({ value: "" })}
                  className="rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-primary/20 dark:text-primary dark:hover:bg-primary/10 text-xs font-bold h-8 px-3 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  অপশন যোগ করুন
                </Button>
              </div>

              {optionFields.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {optionFields.map((field, idx) => {
                    const optionLabel = BENGALI_OPTION_LABELS[idx] || String(idx + 1)
                    return (
                      <div
                        key={field.id}
                        className="space-y-2 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/30 dark:bg-white/[0.01] p-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-foreground flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-lg bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-primary font-bold text-xs border border-indigo-100 dark:border-primary/20">
                              {optionLabel}
                            </span>
                            <span>অপশন {optionLabel}</span>
                          </Label>
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
                          >
                            মুছুন
                          </button>
                        </div>
                        <Input
                          type="text"
                          disabled={isSubmitting}
                          placeholder={`অপশন ${optionLabel}-এর বিবরণ লিখুন...`}
                          {...register(`options.${idx}.value`)}
                          className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5"
                        />
                      </div>
                    )
                  })}
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
                    প্রশ্ন ও উত্তরে KaTeX ম্যাথ ফর্মুলা রেন্ডার করতে অ্যাক্টিভ করুন।
                  </p>
                </div>
                <Controller
                  name="isMath"
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

              {/* Is Active */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4">
                <div>
                  <p className="text-sm font-bold text-foreground">অ্যাক্টিভ প্রশ্নের অবস্থা</p>
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
                      checked={field.value}
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
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  রেফারেন্স / উৎস (কমা দিয়ে একাধিক উল্লেখ করুন)
                </Label>
                <Input
                  type="text"
                  disabled={isSubmitting}
                  placeholder="যেমন: ঢাকা বোর্ড ২০২৩, পাঠ্যবই পৃষ্ঠা ৪২..."
                  {...register("referenceText")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4"
                />
              </div>
            </div>

            {/* Context & Metadata Settings */}
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
                        key={`diff-select-${field.value || "empty"}`}
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
                          <SelectValue placeholder="উৎস নির্বাচন করুন...">
                            {field.value}
                          </SelectValue>
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
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    সেশন (Session)
                  </Label>
                  <Input
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

                {/* Year */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    পরীক্ষার বছর (ঐচ্ছিক)
                  </Label>
                  <Input
                    type="number"
                    disabled={isSubmitting}
                    placeholder="যেমন: ২০২৪"
                    {...register("year")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4"
                  />
                  {errors.year && (
                    <p className="text-xs text-rose-500 font-medium">{errors.year.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions Footer */}
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
                  <Link href="/short-answers" prefetch={true}>
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
                  <span>
                    {isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : "প্রশ্ন হালনাগাদ করুন"}
                  </span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

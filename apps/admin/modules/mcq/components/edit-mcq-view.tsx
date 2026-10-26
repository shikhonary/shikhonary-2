"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useMcqById,
  useUpdateMcq,
  useSubjectsForSelection,
  useChaptersForSelection,
  useAcademicClassesForSelection,
} from "../services/use-mcq"
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
import { MCQ_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import { PageHeader } from "@/components/shared/page-header"
import {
  HelpCircle,
  ArrowLeft,
  Plus,
  X,
  Clock,
  Loader2,
  Save,
  AlertCircle,
  Sparkles,
  BookOpen,
} from "lucide-react"

const updateMcqFormSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  chapterId: z.string().min(1, "অধ্যায় নির্বাচন করুন"),
  question: z.string().min(1, "প্রশ্নের বিবরণ আবশ্যক"),
  answer: z.string().min(1, "সঠিক উত্তর নির্বাচন করুন"),
  options: z
    .array(z.object({ value: z.string().min(1, "অপশনের বিবরণ ফাঁকা রাখা যাবে না") }))
    .min(2, "কমপক্ষে ২টি অপশন আবশ্যক"),
  statements: z.array(z.object({ value: z.string() })).optional(),
  type: z.string().min(1, "প্রশ্নের ধরন আবশ্যক"),
  isMath: z.boolean(),
  referenceText: z.string().optional(),
  explanation: z.string().optional(),
  questionUrl: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  year: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  questionTypeId: z.string().optional(),
  isActive: z.boolean(),
})

type UpdateMcqFormData = z.infer<typeof updateMcqFormSchema>

const BENGALI_OPTION_LABELS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"]

interface EditMcqViewProps {
  id: string
}

export function EditMcqView({ id }: EditMcqViewProps) {
  const router = useRouter()
  const { data: mcq, isLoading, isError } = useMcqById(id)
  const updateMutation = useUpdateMcq()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: questionTypesData } = useQuestionTypesList({ limit: 100 })
  const questionTypes = questionTypesData?.questionTypes ?? []

  // Resolve initial classId robustly from subject or chapter relationships
  const initialClassId = useMemo(() => {
    if (!mcq) return ""
    return (
      (mcq as any).subject?.classSubjects?.[0]?.classId ||
      (mcq as any).chapter?.subject?.classSubjects?.[0]?.classId ||
      (mcq as any).classId ||
      ""
    )
  }, [mcq])

  // Synchronize form values directly with loaded MCQ data
  const formValues = useMemo(() => {
    if (!mcq) return undefined
    return {
      classId: initialClassId,
      subjectId: mcq.subjectId || "",
      chapterId: mcq.chapterId || "",
      question: mcq.question || "",
      answer: mcq.answer || "",
      options: mcq.options?.map((opt) => ({ value: opt })) || [
        { value: "" },
        { value: "" },
        { value: "" },
        { value: "" },
      ],
      statements: (mcq.statements || []).map((stmt) => ({ value: stmt })),
      type: mcq.type || "SINGLE",
      isMath: Boolean(mcq.isMath),
      referenceText: (mcq.reference || []).join(", "),
      explanation: mcq.explanation || "",
      questionUrl: mcq.questionUrl || "",
      difficulty: (mcq.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
      year: (mcq as any).year ? String((mcq as any).year) : "",
      source: (mcq as any).source ? String((mcq as any).source).trim() : DEFAULT_SOURCE,
      session: (mcq as any).session || new Date().getFullYear().toString(),
      questionTypeId: mcq.questionTypeId || "",
      isActive: mcq.isActive !== undefined ? mcq.isActive : true,
    }
  }, [mcq, initialClassId])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<UpdateMcqFormData>({
    resolver: zodResolver(updateMcqFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      question: "",
      answer: "",
      options: [
        { value: "" },
        { value: "" },
        { value: "" },
        { value: "" },
      ],
      statements: [],
      type: "SINGLE",
      isMath: false,
      referenceText: "",
      explanation: "",
      questionUrl: "",
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

  const { data: subjects = [] } = useSubjectsForSelection(
    activeClassId ? { academicClassId: activeClassId } : undefined
  )

  const selectedSubjectId = watch("subjectId")
  const activeSubjectId = selectedSubjectId || mcq?.subjectId || ""

  const { data: chapters = [] } = useChaptersForSelection(
    activeSubjectId ? { subjectId: activeSubjectId } : undefined
  )

  // Ensure academic class for this MCQ is always present in selection list
  const combinedClasses = useMemo(() => {
    const map = new Map<string, any>()
    const subjectClass = (mcq as any)?.subject?.classSubjects?.[0]?.academicClass
    if (subjectClass) {
      map.set(subjectClass.id, subjectClass)
    }
    for (const cls of academicClasses) {
      map.set(cls.id, cls)
    }
    return Array.from(map.values())
  }, [academicClasses, mcq])

  // Ensure subject from MCQ is immediately present in options even before async query finishes
  const combinedSubjects = useMemo(() => {
    const map = new Map<string, any>()
    if (mcq?.subject) {
      map.set(mcq.subject.id, mcq.subject)
    }
    for (const sub of subjects) {
      map.set(sub.id, sub)
    }
    return Array.from(map.values())
  }, [subjects, mcq?.subject])

  // Ensure chapter from MCQ is immediately present in options even before async query finishes
  const combinedChapters = useMemo(() => {
    const map = new Map<string, any>()
    if (mcq?.chapter) {
      map.set(mcq.chapter.id, mcq.chapter)
    }
    for (const ch of chapters) {
      map.set(ch.id, ch)
    }
    return Array.from(map.values())
  }, [chapters, mcq?.chapter])

  // Ensure source from MCQ is immediately present in source options list
  const combinedSources = useMemo(() => {
    const list: { value: string; label: string }[] = [...MCQ_SOURCE_OPTIONS]
    const currentSource = (mcq as any)?.source ? String((mcq as any).source).trim() : null
    if (currentSource && !list.some((s) => s.value === currentSource)) {
      list.unshift({ value: currentSource, label: currentSource })
    }
    return list
  }, [mcq])

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: "options",
  })

  const {
    fields: statementFields,
    append: appendStatement,
    remove: removeStatement,
  } = useFieldArray({
    control,
    name: "statements",
  })

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: UpdateMcqFormData) => {
    setErrorMessage(null)

    try {
      const optionsArray = data.options.map((o) => o.value.trim())
      const statementsArray = (data.statements || [])
        .map((s) => s.value.trim())
        .filter((s) => s.length > 0)
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const parsedYear =
        data.year && !isNaN(Number(data.year)) ? Number(data.year) : null

      await updateMutation.mutateAsync({
        id,
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        question: data.question.trim(),
        answer: data.answer.trim(),
        options: optionsArray,
        statements: statementsArray,
        type: data.type,
        isMath: data.isMath,
        reference: referenceArray,
        explanation: data.explanation?.trim() || null,
        questionUrl: data.questionUrl?.trim() || null,
        difficulty: data.difficulty,
        year: parsedYear,
        source: data.source?.trim() || DEFAULT_SOURCE,
        session: data.session?.trim() || new Date().getFullYear().toString(),
        questionTypeId: data.questionTypeId || null,
        isActive: data.isActive,
      })

      toast.success("MCQ প্রশ্নটি সফলভাবে হালনাগাদ করা হয়েছে।")
      setTimeout(() => {
        router.push("/mcqs")
      }, 800)
    } catch (err: any) {
      const msg = err.message || "MCQ প্রশ্ন হালনাগাদে সমস্যা হয়েছে"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  const currentOptions = watch("options")

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-primary" />
        <p className="text-sm font-medium text-muted-foreground">MCQ তথ্যাবলি লোড হচ্ছে...</p>
      </div>
    )
  }

  if (isError || !mcq) {
    return (
      <div className="w-full max-w-lg mx-auto my-12 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-8 text-center text-rose-700 dark:text-rose-400">
        <AlertCircle className="w-10 h-10 mx-auto stroke-[1.8]" />
        <h3 className="mt-3 text-lg font-bold font-headline">MCQ পাওয়া যায়নি</h3>
        <p className="mt-1 text-sm text-rose-600/80">
          অনুরোধকৃত বহুনির্বাচনি প্রশ্নটি সার্ভার থেকে লোড করা সম্ভব হয়নি।
        </p>
        <Button
          asChild
          className="mt-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 text-sm shadow-xs"
        >
          <Link href="/mcqs" prefetch={true}>MCQ তালিকায় ফিরে যান</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header matching CreateMcqView */}
      <PageHeader
        title="বহুনির্বাচনি প্রশ্ন সম্পাদনা"
        description="শ্রেণি, বিষয় ও অধ্যায় নির্বাচন করে প্রশ্নপত্র ভান্ডারে বহুনির্বাচনি প্রশ্ন, অপশন ও তথ্য হালনাগাদ করুন।"
        icon={HelpCircle}
        badge={{ label: "সম্পাদনা মোড", variant: "amber" }}
        breadcrumbs={[
          { label: "MCQ তালিকা", href: "/mcqs" },
          { label: "প্রশ্ন সম্পাদনা" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Link href="/mcqs" prefetch={true}>
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

      {/* Main Form Card - Exactly matching CreateMcqView */}
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
              শ্রেণি, বিষয়, অধ্যায়, মূল প্রশ্ন, অপশন, সঠিক উত্তর ও সমাধান ব্যাখ্যা নির্ভুলভাবে পূরণ করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Class, Subject & Chapter Hierarchy - Exactly matching CreateMcqView */}
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
                          <SelectItem
                            key={cls.id}
                            value={cls.id}
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
                          <SelectItem
                            key={sub.id}
                            value={sub.id}
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
                          <SelectItem
                            key={ch.id}
                            value={ch.id}
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

            {/* Question Stem Text */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                প্রশ্নের মূল বিবরণ (Question Stem) <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                disabled={isSubmitting}
                rows={3}
                placeholder="বহুনির্বাচনি প্রশ্নের মূল বিবরণ লিখুন..."
                {...register("question")}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5"
              />
              {errors.question && (
                <p className="text-xs text-rose-500 font-medium">{errors.question.message}</p>
              )}
            </div>

            {/* Statements (Optional for Roman Numeral MCQ) */}
            <div className="space-y-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/40 dark:bg-white/[0.01] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                    বিবৃতি / উপ-উক্তি (ঐচ্ছিক - বহুপদী প্রশ্নের জন্য)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    যেমন: i. প্রথম উক্তি ii. দ্বিতীয় উক্তি iii. তৃতীয় উক্তি
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendStatement({ value: "" })}
                  className="rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-primary/20 dark:text-primary dark:hover:bg-primary/10 text-xs font-bold h-8 px-3 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  বিবৃতি যোগ করুন
                </Button>
              </div>

              {statementFields.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  {statementFields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-primary/10 text-xs font-bold text-indigo-700 dark:text-primary font-mono border border-indigo-100 dark:border-primary/20">
                        i{idx + 1}.
                      </span>
                      <Input
                        type="text"
                        disabled={isSubmitting}
                        placeholder={`বিবৃতি #${idx + 1}...`}
                        {...register(`statements.${idx}.value`)}
                        className="flex-1 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStatement(idx)}
                        className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Answer Options Configuration */}
            <div className="space-y-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/40 dark:bg-white/[0.01] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                    প্রশ্নের অপশনসমূহ (Answer Options) <span className="text-rose-500">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    প্রতিটি অপশনের বিবরণ লিখুন (কমপক্ষে ২টি অপশন আবশ্যক)।
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
                  নতুন অপশন যোগ করুন
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {optionFields.map((field, idx) => {
                  const optionLabel =
                    BENGALI_OPTION_LABELS[idx] || String(idx + 1)
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
                        {optionFields.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
                          >
                            মুছুন
                          </button>
                        )}
                      </div>
                      <Input
                        type="text"
                        disabled={isSubmitting}
                        placeholder={`অপশন ${optionLabel}-এর বিবরণ লিখুন...`}
                        {...register(`options.${idx}.value`)}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5"
                      />
                      {errors.options?.[idx]?.value && (
                        <p className="text-xs text-rose-500 font-medium">
                          {errors.options[idx]?.value?.message}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Correct Answer & Question Type */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              {/* Correct Answer */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  সঠিক উত্তর (Correct Answer) <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="answer"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`answer-select-${field.value || "empty"}-${currentOptions.length}`}
                      disabled={isSubmitting}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                        <SelectValue placeholder="সঠিক উত্তর নির্বাচন করুন..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64">
                        {currentOptions.map((opt, idx) => {
                          const val = opt.value.trim()
                          const label =
                            BENGALI_OPTION_LABELS[idx] || String(idx + 1)
                          return (
                            <SelectItem
                              key={idx}
                              value={val || `Option ${label}`}
                            >
                              অপশন {label}: {val || "(ফাঁকা)"}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.answer && (
                  <p className="text-xs text-rose-500 font-medium">{errors.answer.message}</p>
                )}
              </div>

              {/* Question Type */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  প্রশ্নের ধরন (Question Type) <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`type-select-${field.value || "empty"}`}
                      disabled={isSubmitting}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                        <SelectValue placeholder="ধরন নির্বাচন করুন..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                        <SelectItem value="SINGLE">একক সঠিক উত্তর (SINGLE)</SelectItem>
                        <SelectItem value="MULTIPLE">একাধিক সঠিক উত্তর (MULTIPLE)</SelectItem>
                        <SelectItem value="COMBINED">বহুপদী সমাপ্তিসূচক (COMBINED)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-xs text-rose-500 font-medium">{errors.type.message}</p>
                )}
              </div>
            </div>

            {/* Toggle Flags: Math Formula & Active State */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              {/* Is Math */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    গণিত / LaTeX সমীকরণ
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    প্রশ্ন ও অপশনে KaTeX ম্যাথ ফর্মুলা রেন্ডার করতে অ্যাক্টিভ করুন।
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
                  <p className="text-sm font-bold text-foreground">
                    অ্যাক্টিভ প্রশ্নের অবস্থা
                  </p>
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

            {/* Explanation & Reference */}
            <div className="space-y-6 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              {/* Explanation */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  সঠিক উত্তরের ব্যাখ্যা / সমাধান (Explanation)
                </Label>
                <Textarea
                  disabled={isSubmitting}
                  rows={3}
                  placeholder="সঠিক উত্তরের বিস্তারিত ব্যাখ্যা বা সমাধান লিখুন..."
                  {...register("explanation")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5"
                />
              </div>

              {/* Reference */}
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
                        key={`difficulty-select-${field.value || "empty"}`}
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
                    বছর (Year)
                  </Label>
                  <Input
                    type="number"
                    disabled={isSubmitting}
                    placeholder="যেমন: ২০২৬"
                    {...register("year")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4"
                  />
                  {errors.year && (
                    <p className="text-xs text-rose-500 font-medium">{errors.year.message}</p>
                  )}
                </div>

                {/* Question Image URL */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    চিত্র / উদ্দীপক লিঙ্ক (Image URL)
                  </Label>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="https://..."
                    {...register("questionUrl")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6 sm:pt-8 mt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>বিদ্যমান MCQ রেকর্ডটি হালনাগাদ করা হবে</span>
              </div>
              <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold px-6 h-11 text-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Link href="/mcqs" prefetch={true}>
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

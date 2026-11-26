"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ArrowLeft,
  Save,
  ClipboardList,
  AlertCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { PageHeader } from "@/components/shared/page-header"
import {
  REARRANGE_SOURCE_OPTIONS,
  DEFAULT_SOURCE,
  type RearrangeSource,
} from "../constants"
import {
  useRearrangeById,
  useUpdateRearrange,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-rearrange"

const editRearrangeSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  chapterId: z.string().optional(),
  options: z
    .array(z.object({ value: z.string().min(1, "বাক্যটি খালি রাখা যাবে না") }))
    .min(1, "অন্তত একটি বাক্য যোগ করুন"),
  answerKey: z.string().optional(),
  difficulty: z.enum([
    QUESTION_DIFFICULTY.EASY,
    QUESTION_DIFFICULTY.MEDIUM,
    QUESTION_DIFFICULTY.HARD,
  ]),
  referenceText: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
})

type EditRearrangeFormData = z.infer<typeof editRearrangeSchema>

const ROW_LABELS = ["(a)", "(b)", "(c)", "(d)", "(e)", "(f)", "(g)", "(h)", "(i)", "(j)", "(k)", "(l)"]

const difficultyLabels: Record<string, string> = {
  EASY: "সহজ (Easy)",
  MEDIUM: "মাঝারি (Medium)",
  HARD: "কঠিন (Hard)",
}

export function EditRearrangeView({ id }: { id: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const qs = searchParams.toString()
  const listHref = qs ? `/rearrange?${qs}` : "/rearrange"

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [bulkText, setBulkText] = useState("")
  const [showBulkPaste, setShowBulkPaste] = useState(false)

  const { data: item, isLoading: isItemLoading, isError: isItemError } = useRearrangeById(id)
  const updateMutation = useUpdateRearrange()

  const initialClassId =
    item?.subject?.classSubjects?.[0]?.classId ||
    (item as any)?.subject?.academicClassId ||
    (item as any)?.academicChapter?.academicClassId ||
    ""

  const formValues = useMemo<EditRearrangeFormData | undefined>(() => {
    if (!item) return undefined

    const rawDifficulty = item.difficulty as string
    const validDifficulty =
      rawDifficulty === QUESTION_DIFFICULTY.EASY ||
      rawDifficulty === QUESTION_DIFFICULTY.MEDIUM ||
      rawDifficulty === QUESTION_DIFFICULTY.HARD
        ? rawDifficulty
        : QUESTION_DIFFICULTY.MEDIUM

    return {
      classId: initialClassId,
      subjectId: item.subjectId || "",
      chapterId: item.academicChapterId || "",
      options: Array.isArray(item.options) ? item.options.map((opt) => ({ value: opt })) : [],
      answerKey: item.answerKey || "",
      difficulty: validDifficulty,
      referenceText: Array.isArray(item.reference) ? item.reference.join(", ") : "",
      source: item.source || DEFAULT_SOURCE,
      session: item.session || new Date().getFullYear().toString(),
    }
  }, [item, initialClassId])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditRearrangeFormData>({
    resolver: zodResolver(editRearrangeSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      options: [],
      answerKey: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
      source: DEFAULT_SOURCE,
      session: new Date().getFullYear().toString(),
    },
    values: formValues,
    resetOptions: { keepDirtyValues: true },
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "options",
  })

  const selectedClassId = watch("classId")
  const selectedSubjectId = watch("subjectId")
  const selectedChapterId = watch("chapterId")
  const selectedDifficulty = watch("difficulty")
  const selectedSource = watch("source")

  const activeClassId = selectedClassId || formValues?.classId || ""
  const activeSubjectId = selectedSubjectId || formValues?.subjectId || ""

  const { data: classesData } = useAcademicClassesForSelection()
  const { data: subjectsData } = useSubjectsForSelection(
    activeClassId ? { academicClassId: activeClassId } : undefined
  )
  const { data: chaptersData } = useChaptersForSelection(
    activeSubjectId ? { subjectId: activeSubjectId } : undefined
  )

  const combinedClasses = useMemo(() => {
    const list = Array.isArray(classesData) ? [...classesData] : []
    const itemCls = (item as any)?.subject?.academicClass
    if (activeClassId && itemCls && !list.some((c: any) => c.id === activeClassId)) {
      list.unshift(itemCls)
    }
    return list
  }, [classesData, activeClassId, item])

  const combinedSubjects = useMemo(() => {
    const list = Array.isArray(subjectsData) ? [...subjectsData] : []
    const itemSub = item?.subject
    if (activeSubjectId && itemSub && !list.some((s: any) => s.id === activeSubjectId)) {
      list.unshift(itemSub as any)
    }
    return list
  }, [subjectsData, activeSubjectId, item])

  const combinedChapters = useMemo(() => {
    const list = Array.isArray(chaptersData) ? [...chaptersData] : []
    const activeChapterId = selectedChapterId || formValues?.chapterId || ""
    const itemCh = item?.academicChapter
    if (activeChapterId && itemCh && !list.some((ch: any) => ch.id === activeChapterId)) {
      list.unshift(itemCh as any)
    }
    return list
  }, [chaptersData, selectedChapterId, formValues?.chapterId, item])

  const combinedSources = useMemo(() => {
    const list: { label: string; value: string }[] = REARRANGE_SOURCE_OPTIONS.map((opt) => ({
      label: opt.label,
      value: opt.value,
    }))
    const currentSource = selectedSource || formValues?.source
    if (currentSource && !list.some((opt) => opt.value === currentSource)) {
      list.unshift({ label: currentSource, value: currentSource })
    }
    return list
  }, [selectedSource, formValues?.source])

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim().replace(/^[a-z0-9ivx]+\s*[\.\)\-]\s*/i, ""))
      .filter((l) => l.length > 0)

    if (lines.length > 0) {
      lines.forEach((line) => append({ value: line }))
      setBulkText("")
      setShowBulkPaste(false)
      toast.success(`${lines.length} টি বাক্য যোগ করা হয়েছে।`)
    }
  }

  const onSubmit = async (data: EditRearrangeFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const optionsArray = data.options
        .map((o) => o.value.trim())
        .filter((o) => o.length > 0)

      if (optionsArray.length === 0) {
        toast.error("অন্তত একটি বাক্য যোগ করুন।")
        return
      }

      await updateMutation.mutateAsync({
        id,
        subjectId: data.subjectId,
        academicChapterId: data.chapterId || null,
        options: optionsArray,
        answerKey: data.answerKey?.trim() || null,
        difficulty: data.difficulty,
        reference: referenceArray,
        source: (data.source?.trim() as RearrangeSource) || null,
        session: data.session?.trim() || null,
      })

      toast.success("রিঅ্যারেঞ্জ প্রশ্ন সফলভাবে আপডেট করা হয়েছে।")
      router.push(listHref)
    } catch (err: any) {
      const msg = err?.message || "রিঅ্যারেঞ্জ প্রশ্ন আপডেট করতে সমস্যা হয়েছে।"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isItemLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isItemError || !item) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-10 text-center space-y-4">
        <AlertCircle className="size-10 text-destructive mx-auto" />
        <h3 className="text-lg font-bold text-destructive">প্রশ্নটি খুঁজে পাওয়া যায়নি</h3>
        <Button asChild variant="outline">
          <Link href={listHref}>তালিকায় ফিরে যান</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="রিঅ্যারেঞ্জ প্রশ্ন সম্পাদনা"
        description="এলোমেলো বাক্যসমূহ, সঠিক ক্রম এবং মেটাডেটা আপডেট করুন।"
        icon={ClipboardList}
        breadcrumbs={[
          { label: "রিঅ্যারেঞ্জ", href: listHref },
          { label: "সম্পাদনা" },
        ]}
      >
        <Button asChild variant="outline" size="sm" className="h-9 gap-2 rounded-lg">
          <Link href={listHref}>
            <ArrowLeft className="size-4" />
            <span>ফিরে যান</span>
          </Link>
        </Button>
      </PageHeader>

      {errorMessage && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="size-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border shadow-xs">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-base font-bold">শ্রেণি, বিষয় ও অধ্যায়</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>
                শ্রেণি <span className="text-destructive">*</span>
              </Label>
              <Select
                key={`cls-${activeClassId || "empty"}-${combinedClasses.length}`}
                value={activeClassId}
                onValueChange={(val) => {
                  setValue("classId", val, { shouldValidate: true, shouldDirty: true })
                  setValue("subjectId", "", { shouldDirty: true })
                  setValue("chapterId", "", { shouldDirty: true })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {combinedClasses.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.nameBn || cls.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.classId && <p className="text-xs text-destructive">{errors.classId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>
                বিষয় <span className="text-destructive">*</span>
              </Label>
              <Select
                key={`sub-${activeSubjectId || "empty"}-${combinedSubjects.length}`}
                value={activeSubjectId}
                disabled={!activeClassId}
                onValueChange={(val) => {
                  setValue("subjectId", val, { shouldValidate: true, shouldDirty: true })
                  setValue("chapterId", "", { shouldDirty: true })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {combinedSubjects.map((sub: any) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.nameBn || sub.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subjectId && <p className="text-xs text-destructive">{errors.subjectId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>অধ্যায় (ঐচ্ছিক)</Label>
              <Select
                key={`ch-${selectedChapterId || formValues?.chapterId || "empty"}-${combinedChapters.length}`}
                value={selectedChapterId || formValues?.chapterId || ""}
                disabled={!activeSubjectId}
                onValueChange={(val) => setValue("chapterId", val, { shouldDirty: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="অধ্যায় নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {combinedChapters.map((ch: any) => (
                    <SelectItem key={ch.id} value={ch.id}>
                      {ch.nameBn || ch.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="border-b border-border/60 pb-4 flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-base font-bold">বাক্যসমূহ (Jumbled Sentences)</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBulkPaste((v) => !v)}
                className="h-8 text-xs"
              >
                {showBulkPaste ? "লুকান" : "একসাথে পেস্ট করুন"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ value: "" })}
                className="h-8 gap-1 text-xs"
              >
                <Plus className="size-3.5" />
                <span>বাক্য যোগ করুন</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {showBulkPaste && (
              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                <Label className="text-xs font-semibold">প্রতি লাইনে একটি করে বাক্য পেস্ট করুন:</Label>
                <Textarea
                  rows={5}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={"(a) First sentence...\n(b) Second sentence..."}
                />
                <Button type="button" size="sm" onClick={handleBulkAdd}>
                  লাইনে লাইনে যোগ করুন
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <span className="mt-2.5 w-8 text-xs font-mono font-bold text-primary shrink-0">
                    {ROW_LABELS[index] || `(${index + 1})`}
                  </span>
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder={`বাক্য ${index + 1}`}
                      {...register(`options.${index}.value`)}
                    />
                    {errors.options?.[index]?.value && (
                      <p className="text-xs text-destructive">
                        {errors.options[index]?.value?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 pt-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                      className="size-8"
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === fields.length - 1}
                      onClick={() => move(index, index + 1)}
                      className="size-8"
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={fields.length <= 1}
                      onClick={() => remove(index)}
                      className="size-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {errors.options?.root && (
              <p className="text-xs text-destructive">{errors.options.root.message}</p>
            )}

            <div className="space-y-2 pt-2">
              <Label htmlFor="answerKey">সঠিক ক্রম (Answer Key - ঐচ্ছিক)</Label>
              <Input id="answerKey" {...register("answerKey")} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-base font-bold">মেটাডেটা ও রেফারেন্স</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>কঠিন্য</Label>
              <Select
                key={`diff-${selectedDifficulty || formValues?.difficulty || "MEDIUM"}`}
                value={selectedDifficulty || formValues?.difficulty || QUESTION_DIFFICULTY.MEDIUM}
                onValueChange={(val) =>
                  setValue("difficulty", val as any, { shouldDirty: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="কঠিন্য নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {difficultyLabels[opt.value] || opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>উৎস (Source)</Label>
              <Select
                key={`src-${selectedSource || formValues?.source || "empty"}`}
                value={selectedSource || formValues?.source || ""}
                onValueChange={(val) => setValue("source", val, { shouldDirty: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="উৎস নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {combinedSources.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session">সাল / সেশন</Label>
              <Input id="session" {...register("session")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceText">রেফারেন্স (কমা দিয়ে আলাদা করুন)</Label>
              <Input id="referenceText" {...register("referenceText")} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button asChild type="button" variant="outline" className="rounded-lg">
            <Link href={listHref}>বাতিল করুন</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2 rounded-lg font-semibold">
            <Save className="size-4" />
            <span>{isSubmitting ? "আপডেট হচ্ছে..." : "আপডেট করুন"}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

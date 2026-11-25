"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save, FileText, AlertCircle } from "lucide-react"
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
import { POD_NIRNOY_SOURCE_OPTIONS, type PodNirnoySource } from "../constants"
import {
  usePodNirnoyById,
  useUpdatePodNirnoy,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-pod-nirnoy"

const editPodNirnoySchema = z
  .object({
    classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
    subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
    chapterId: z.string().optional(),
    word: z.string().optional(),
    content: z.string().optional(),
    wordsText: z.string().optional(),
    referenceText: z.string().optional(),
    source: z.string().optional(),
    session: z.string().optional(),
    difficulty: z.enum([
      QUESTION_DIFFICULTY.EASY,
      QUESTION_DIFFICULTY.MEDIUM,
      QUESTION_DIFFICULTY.HARD,
    ]),
    popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
      message: "জনপ্রিয়তা সংখ্যা হতে হবে",
    }),
  })
  .refine(
    (data) => Boolean(data.content?.trim() || data.word?.trim() || data.wordsText?.trim()),
    {
      message: "বাক্য/পাঠ, নির্দিষ্ট শব্দ অথবা পদসমূহ থেকে যেকোনো একটি আবশ্যক",
      path: ["content"],
    }
  )

type EditPodNirnoyFormData = z.infer<typeof editPodNirnoySchema>

const difficultyLabels: Record<string, string> = {
  EASY: "সহজ (Easy)",
  MEDIUM: "মাঝারি (Medium)",
  HARD: "কঠিন (Hard)",
}

export function EditPodNirnoyView({ id }: { id: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const qs = searchParams.toString()
  const listHref = qs ? `/pod-nirnoy?${qs}` : "/pod-nirnoy"

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { data: item, isLoading: isItemLoading, isError: isItemError } = usePodNirnoyById(id)
  const updateMutation = useUpdatePodNirnoy()

  const initialClassId =
    item?.subject?.classSubjects?.[0]?.classId ||
    (item as any)?.subject?.academicClassId ||
    (item as any)?.academicChapter?.academicClassId ||
    ""

  const formValues = useMemo<EditPodNirnoyFormData | undefined>(() => {
    if (!item) return undefined

    const itemAny = item as any
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
      chapterId: item.academicChapterId || itemAny.chapterId || "",
      word: item.word || "",
      content: item.content || "",
      wordsText: Array.isArray(item.words) ? item.words.join(", ") : "",
      referenceText: Array.isArray(item.reference) ? item.reference.join(", ") : "",
      source: item.source || "গাইড বুক",
      session: item.session || new Date().getFullYear().toString(),
      difficulty: validDifficulty,
      popularityCount: String(item.popularityCount ?? 0),
    }
  }, [item, initialClassId])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditPodNirnoyFormData>({
    resolver: zodResolver(editPodNirnoySchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      word: "",
      content: "",
      wordsText: "",
      referenceText: "",
      source: "গাইড বুক",
      session: new Date().getFullYear().toString(),
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
    },
    values: formValues,
    resetOptions: { keepDirtyValues: true },
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
    const itemCh = item?.academicChapter || (item as any)?.chapter
    if (activeChapterId && itemCh && !list.some((ch: any) => ch.id === activeChapterId)) {
      list.unshift(itemCh as any)
    }
    return list
  }, [chaptersData, selectedChapterId, formValues?.chapterId, item])

  const combinedSources = useMemo(() => {
    const list: { label: string; value: string }[] = POD_NIRNOY_SOURCE_OPTIONS.map((opt) => ({
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

  const onSubmit = async (data: EditPodNirnoyFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const wordsArray = data.wordsText
        ? data.wordsText
            .split(",")
            .map((w) => w.trim())
            .filter((w) => w.length > 0)
        : []

      await updateMutation.mutateAsync({
        id,
        subjectId: data.subjectId,
        academicChapterId: data.chapterId || null,
        word: data.word?.trim() || null,
        content: data.content?.trim() || null,
        words: wordsArray,
        reference: referenceArray,
        source: (data.source?.trim() as PodNirnoySource) || null,
        session: data.session?.trim() || null,
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
      })

      toast.success("পদ নির্ণয় প্রশ্ন সফলভাবে আপডেট করা হয়েছে।")
      router.push(listHref)
    } catch (err: any) {
      const msg = err?.message || "পদ নির্ণয় প্রশ্ন আপডেট করতে সমস্যা হয়েছে।"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isItemLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-44 w-full rounded-xl" />
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
        title="পদ নির্ণয় প্রশ্ন সম্পাদনা"
        description="প্রশ্নটির বাক্য, নির্দিষ্ট পদসমূহ এবং মেটাডেটা আপডেট করুন।"
        icon={FileText}
        breadcrumbs={[
          { label: "পদ নির্ণয়", href: listHref },
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
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-base font-bold">বাক্য, মূল শব্দ ও পদসমূহ</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">বাক্য / মূল পাঠ (Sentence / Content)</Label>
              <Textarea id="content" rows={4} {...register("content")} />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="word">একক শব্দ (Target Word - ঐচ্ছিক)</Label>
                <Input id="word" {...register("word")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wordsText">নির্দিষ্ট পদসমূহ (কমা দিয়ে আলাদা করুন)</Label>
                <Input id="wordsText" {...register("wordsText")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-base font-bold">মেটাডেটা ও রেফারেন্স</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <Label htmlFor="popularityCount">জনপ্রিয়তা</Label>
              <Input id="popularityCount" type="number" {...register("popularityCount")} />
              {errors.popularityCount && (
                <p className="text-xs text-destructive">{errors.popularityCount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceText">রেফারেন্স (কমা দিয়ে)</Label>
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

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
import {
  NUMBER_IN_WORDS_SOURCE_OPTIONS,
  DEFAULT_SOURCE,
  type NumberInWordsSource,
} from "../constants"
import {
  useNumberInWordsById,
  useUpdateNumberInWords,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-number-in-words"

const editNumberInWordsSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  chapterId: z.string().min(1, "অধ্যায় নির্বাচন করুন"),
  number: z.string().min(1, "সংখ্যা লিখুন"),
  inWords: z.string().min(1, "কথায় লেখা আবশ্যক"),
  difficulty: z.enum([
    QUESTION_DIFFICULTY.EASY,
    QUESTION_DIFFICULTY.MEDIUM,
    QUESTION_DIFFICULTY.HARD,
  ]),
  referenceText: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
})

type EditNumberInWordsFormData = z.infer<typeof editNumberInWordsSchema>

const difficultyLabels: Record<string, string> = {
  EASY: "সহজ (Easy)",
  MEDIUM: "মাঝারি (Medium)",
  HARD: "কঠিন (Hard)",
}

export function EditNumberInWordsView({ id }: { id: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const qs = searchParams.toString()
  const listHref = qs ? `/number-in-words?${qs}` : "/number-in-words"

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { data: item, isLoading: isItemLoading, isError: isItemError } = useNumberInWordsById(id)
  const updateMutation = useUpdateNumberInWords()

  const initialClassId =
    item?.subject?.classSubjects?.[0]?.classId ||
    (item as any)?.subject?.academicClassId ||
    (item as any)?.academicChapter?.academicClassId ||
    ""

  const formValues = useMemo<EditNumberInWordsFormData | undefined>(() => {
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
      number: item.number || "",
      inWords: item.inWords || "",
      difficulty: validDifficulty,
      referenceText: Array.isArray(item.reference) ? item.reference.join(", ") : "",
      source: itemAny.source || DEFAULT_SOURCE,
      session: itemAny.session || new Date().getFullYear().toString(),
    }
  }, [item, initialClassId])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditNumberInWordsFormData>({
    resolver: zodResolver(editNumberInWordsSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      number: "",
      inWords: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
      source: DEFAULT_SOURCE,
      session: new Date().getFullYear().toString(),
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
    const list: { label: string; value: string }[] = NUMBER_IN_WORDS_SOURCE_OPTIONS.map((opt) => ({
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

  const onSubmit = async (data: EditNumberInWordsFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      await updateMutation.mutateAsync({
        id,
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        academicChapterId: data.chapterId,
        number: data.number.trim(),
        inWords: data.inWords.trim(),
        difficulty: data.difficulty,
        reference: referenceArray,
        source: (data.source?.trim() as NumberInWordsSource) || null,
        session: data.session?.trim() || null,
      })

      toast.success("কথায় লেখা প্রশ্ন সফলভাবে আপডেট করা হয়েছে।")
      router.push(listHref)
    } catch (err: any) {
      const msg = err?.message || "কথায় লেখা প্রশ্ন আপডেট করতে সমস্যা হয়েছে।"
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
        title="কথায় লেখা প্রশ্ন সম্পাদনা"
        description="সংখ্যা, কথায় লেখা এবং মেটাডেটা আপডেট করুন।"
        icon={FileText}
        breadcrumbs={[
          { label: "কথায় লেখা", href: listHref },
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
              <Label>
                অধ্যায় <span className="text-destructive">*</span>
              </Label>
              <Select
                key={`ch-${selectedChapterId || formValues?.chapterId || "empty"}-${combinedChapters.length}`}
                value={selectedChapterId || formValues?.chapterId || ""}
                disabled={!activeSubjectId}
                onValueChange={(val) =>
                  setValue("chapterId", val, { shouldValidate: true, shouldDirty: true })
                }
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
              {errors.chapterId && <p className="text-xs text-destructive">{errors.chapterId.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-base font-bold">সংখ্যা ও কথায় লেখা</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">
                সংখ্যা <span className="text-destructive">*</span>
              </Label>
              <Input id="number" {...register("number")} />
              {errors.number && <p className="text-xs text-destructive">{errors.number.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inWords">
                কথায় লেখা <span className="text-destructive">*</span>
              </Label>
              <Textarea id="inWords" rows={2} {...register("inWords")} />
              {errors.inWords && <p className="text-xs text-destructive">{errors.inWords.message}</p>}
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

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
import { Checkbox } from "@workspace/ui/components/checkbox"
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
import { FORM_FILLING_SOURCE_OPTIONS, type FormFillingSource } from "../constants"
import {
  useFormFillingById,
  useUpdateFormFilling,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-form-filling"

const editFormFillingSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  chapterId: z.string().min(1, "অধ্যায় নির্বাচন করুন"),
  scenario: z.string().min(1, "উদ্দীপক লিখুন"),
  institution: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  hasPhoto: z.boolean(),
  declaration: z.string().optional(),
  signaturesText: z.string().optional(),
  formDataText: z.string().min(1, "Form Data JSON আবশ্যক"),
  solutionText: z.string().optional(),
  difficulty: z.enum([
    QUESTION_DIFFICULTY.EASY,
    QUESTION_DIFFICULTY.MEDIUM,
    QUESTION_DIFFICULTY.HARD,
  ]),
  referenceText: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
})

type EditFormFillingFormData = z.infer<typeof editFormFillingSchema>

const difficultyLabels: Record<string, string> = {
  EASY: "সহজ (Easy)",
  MEDIUM: "মাঝারি (Medium)",
  HARD: "কঠিন (Hard)",
}

export function EditFormFillingView({ id }: { id: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const qs = searchParams.toString()
  const listHref = qs ? `/form-filling?${qs}` : "/form-filling"

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { data: item, isLoading: isItemLoading, isError: isItemError } = useFormFillingById(id)
  const updateMutation = useUpdateFormFilling()

  const initialClassId =
    item?.subject?.classSubjects?.[0]?.classId ||
    (item as any)?.subject?.academicClassId ||
    (item as any)?.academicChapter?.academicClassId ||
    ""

  const formValues = useMemo<EditFormFillingFormData | undefined>(() => {
    if (!item) return undefined

    let formDataStr = ""
    if (item.formData) {
      try {
        formDataStr =
          typeof item.formData === "string" ? item.formData : JSON.stringify(item.formData, null, 2)
      } catch {
        formDataStr = String(item.formData)
      }
    }

    let solutionStr = ""
    if (item.solution) {
      try {
        solutionStr =
          typeof item.solution === "string" ? item.solution : JSON.stringify(item.solution, null, 2)
      } catch {
        solutionStr = String(item.solution)
      }
    }

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
      scenario: item.scenario || "",
      institution: itemAny.institution || "",
      title: itemAny.title || "",
      description: itemAny.description || "",
      hasPhoto: Boolean(itemAny.hasPhoto),
      declaration: itemAny.declaration || "",
      signaturesText: Array.isArray(itemAny.signatures) ? itemAny.signatures.join(", ") : "",
      formDataText: formDataStr,
      solutionText: solutionStr,
      difficulty: validDifficulty,
      referenceText: Array.isArray(item.reference) ? item.reference.join(", ") : "",
      source: item.source || "গাইড বুক",
      session: item.session || new Date().getFullYear().toString(),
    }
  }, [item, initialClassId])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditFormFillingFormData>({
    resolver: zodResolver(editFormFillingSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      scenario: "",
      institution: "",
      title: "",
      description: "",
      hasPhoto: false,
      declaration: "",
      signaturesText: "",
      formDataText: "",
      solutionText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
      source: "গাইড বুক",
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
  const hasPhoto = watch("hasPhoto")

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
    const list: { label: string; value: string }[] = FORM_FILLING_SOURCE_OPTIONS.map((opt) => ({
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

  const onSubmit = async (data: EditFormFillingFormData) => {
    setErrorMessage(null)

    try {
      let parsedFormData: any
      try {
        parsedFormData = JSON.parse(data.formDataText)
      } catch {
        throw new Error("Form Data JSON ফরম্যাট সঠিক নয়। অনুগ্রহ করে সঠিক JSON দিন।")
      }

      let parsedSolution: any = null
      if (data.solutionText && data.solutionText.trim() !== "") {
        try {
          parsedSolution = JSON.parse(data.solutionText)
        } catch {
          throw new Error("Solution JSON ফরম্যাট সঠিক নয়। অনুগ্রহ করে সঠিক JSON দিন।")
        }
      }

      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const signaturesArray = data.signaturesText
        ? data.signaturesText
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : []

      await updateMutation.mutateAsync({
        id,
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        academicChapterId: data.chapterId,
        scenario: data.scenario.trim(),
        institution: data.institution?.trim() || null,
        title: data.title?.trim() || null,
        description: data.description?.trim() || null,
        hasPhoto: data.hasPhoto,
        declaration: data.declaration?.trim() || null,
        signatures: signaturesArray,
        formData: parsedFormData,
        solution: parsedSolution,
        difficulty: data.difficulty,
        reference: referenceArray,
        source: (data.source?.trim() as FormFillingSource) || null,
        session: data.session?.trim() || null,
      })

      toast.success("ফর্ম পূরণ প্রশ্ন সফলভাবে আপডেট করা হয়েছে।")
      router.push(listHref)
    } catch (err: any) {
      const msg = err?.message || "ফর্ম পূরণ প্রশ্ন আপডেট করতে সমস্যা হয়েছে।"
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
        title="ফর্ম পূরণ প্রশ্ন সম্পাদনা"
        description="প্রশ্নটির উদ্দীপক, ফর্মের কাঠামো, সমাধান এবং মেটাডেটা আপডেট করুন।"
        icon={FileText}
        breadcrumbs={[
          { label: "ফর্ম পূরণ", href: listHref },
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
            <CardTitle className="text-base font-bold">উদ্দীপক ও ফর্মের শিরোনাম</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scenario">
                উদ্দীপক / প্রশ্ন <span className="text-destructive">*</span>
              </Label>
              <Textarea id="scenario" rows={3} {...register("scenario")} />
              {errors.scenario && <p className="text-xs text-destructive">{errors.scenario.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institution">প্রতিষ্ঠানের নাম</Label>
                <Input id="institution" {...register("institution")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">ফর্মের শিরোনাম</Label>
                <Input id="title" {...register("title")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">উপ-শিরোনাম / বিবরণ (ঐচ্ছিক)</Label>
              <Input id="description" {...register("description")} />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <Checkbox
                id="hasPhoto"
                checked={hasPhoto}
                onCheckedChange={(checked) => setValue("hasPhoto", checked === true, { shouldDirty: true })}
              />
              <Label htmlFor="hasPhoto" className="cursor-pointer font-medium">
                ফর্মের ডানপাশে ছবির ঘর ("ছবি") থাকবে
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-base font-bold">ফর্মের ফিল্ড ও সমাধান (JSON)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="formDataText">
                  Form Data (JSON) <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="formDataText"
                  rows={10}
                  className="font-mono text-xs"
                  {...register("formDataText")}
                />
                {errors.formDataText && (
                  <p className="text-xs text-destructive">{errors.formDataText.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="solutionText">Solution (JSON - ঐচ্ছিক)</Label>
                <Textarea
                  id="solutionText"
                  rows={10}
                  className="font-mono text-xs"
                  {...register("solutionText")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="declaration">অঙ্গীকারনামা / ঘোষণা (ঐচ্ছিক)</Label>
                <Input id="declaration" {...register("declaration")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signaturesText">স্বাক্ষরসমূহ (কমা দিয়ে আলাদা করুন)</Label>
                <Input id="signaturesText" {...register("signaturesText")} />
              </div>
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

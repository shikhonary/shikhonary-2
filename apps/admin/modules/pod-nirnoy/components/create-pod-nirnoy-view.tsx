"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  useCreatePodNirnoy,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-pod-nirnoy"

const createPodNirnoySchema = z
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

type CreatePodNirnoyFormData = z.infer<typeof createPodNirnoySchema>

const difficultyLabels: Record<string, string> = {
  EASY: "সহজ (Easy)",
  MEDIUM: "মাঝারি (Medium)",
  HARD: "কঠিন (Hard)",
}

export function CreatePodNirnoyView() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const createMutation = useCreatePodNirnoy()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreatePodNirnoyFormData>({
    resolver: zodResolver(createPodNirnoySchema),
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
  })

  const selectedClassId = watch("classId")
  const selectedSubjectId = watch("subjectId")
  const selectedChapterId = watch("chapterId")
  const selectedDifficulty = watch("difficulty")
  const selectedSource = watch("source")

  const { data: classesData } = useAcademicClassesForSelection()
  const { data: subjectsData } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const { data: chaptersData } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const classes = Array.isArray(classesData) ? classesData : []
  const subjects = Array.isArray(subjectsData) ? subjectsData : []
  const chapters = Array.isArray(chaptersData) ? chaptersData : []

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const onSubmit = async (data: CreatePodNirnoyFormData) => {
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

      await createMutation.mutateAsync({
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

      toast.success("পদ নির্ণয় প্রশ্ন সফলভাবে যোগ করা হয়েছে।")
      router.push("/pod-nirnoy")
    } catch (err: any) {
      const msg = err?.message || "পদ নির্ণয় প্রশ্ন তৈরি করতে সমস্যা হয়েছে।"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="নতুন পদ নির্ণয় প্রশ্ন যোগ করুন"
        description="প্রশ্ন ব্যাংকের জন্য নতুন পদ নির্ণয় প্রশ্ন, বাক্য ও নির্দিষ্ট পদসমূহ তৈরি করুন।"
        icon={FileText}
        breadcrumbs={[
          { label: "পদ নির্ণয়", href: "/pod-nirnoy" },
          { label: "নতুন যোগ করুন" },
        ]}
      >
        <Button asChild variant="outline" size="sm" className="h-9 gap-2 rounded-lg">
          <Link href="/pod-nirnoy">
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
                value={selectedClassId}
                onValueChange={(val) => {
                  setValue("classId", val, { shouldValidate: true })
                  setValue("subjectId", "")
                  setValue("chapterId", "")
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
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
                value={selectedSubjectId}
                disabled={!selectedClassId}
                onValueChange={(val) => {
                  setValue("subjectId", val, { shouldValidate: true })
                  setValue("chapterId", "")
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((sub: any) => (
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
                value={selectedChapterId || ""}
                disabled={!selectedSubjectId}
                onValueChange={(val) => setValue("chapterId", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="অধ্যায় নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((ch: any) => (
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
              <Textarea
                id="content"
                rows={4}
                placeholder="যেমন: রাখাল গরুকে ঘাস খাওয়ায়।"
                {...register("content")}
              />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="word">একক শব্দ (Target Word - ঐচ্ছিক)</Label>
                <Input id="word" placeholder="যেমন: রাখাল" {...register("word")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wordsText">নির্দিষ্ট পদসমূহ (কমা দিয়ে আলাদা করুন)</Label>
                <Input
                  id="wordsText"
                  placeholder="যেমন: রাখাল (বিশেষ্য), গরুকে (বিশেষ্য)"
                  {...register("wordsText")}
                />
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
                value={selectedDifficulty}
                onValueChange={(val) => setValue("difficulty", val as any)}
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
                value={selectedSource || ""}
                onValueChange={(val) => setValue("source", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="উৎস নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {POD_NIRNOY_SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session">সাল / সেশন</Label>
              <Input id="session" placeholder="যেমন: 2025" {...register("session")} />
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
              <Input
                id="referenceText"
                placeholder="যেমন: ঢাকা বোর্ড ২০২৪"
                {...register("referenceText")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button asChild type="button" variant="outline" className="rounded-lg">
            <Link href="/pod-nirnoy">বাতিল করুন</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2 rounded-lg font-semibold">
            <Save className="size-4" />
            <span>{isSubmitting ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

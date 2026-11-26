"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save, Quote, AlertCircle } from "lucide-react"
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
import {
  PUNCTUATION_SOURCE_OPTIONS,
  DEFAULT_SOURCE,
  type PunctuationSource,
} from "../constants"
import {
  useCreatePunctuation,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
} from "../services/use-punctuation"

const createPunctuationSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  content: z.string().min(1, "প্রশ্নের টেক্সট / অনুচ্ছেদ আবশ্যক"),
  source: z.string().optional(),
  session: z.string().optional(),
  referenceText: z.string().optional(),
  difficulty: z.enum([
    QUESTION_DIFFICULTY.EASY,
    QUESTION_DIFFICULTY.MEDIUM,
    QUESTION_DIFFICULTY.HARD,
  ]),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "জনপ্রিয়তা সংখ্যা হতে হবে",
  }),
})

type CreatePunctuationFormData = z.infer<typeof createPunctuationSchema>

const difficultyLabels: Record<string, string> = {
  EASY: "সহজ (Easy)",
  MEDIUM: "মাঝারি (Medium)",
  HARD: "কঠিন (Hard)",
}

export function CreatePunctuationView() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const createMutation = useCreatePunctuation()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreatePunctuationFormData>({
    resolver: zodResolver(createPunctuationSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      content: "",
      source: DEFAULT_SOURCE,
      session: new Date().getFullYear().toString(),
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
    },
  })

  const selectedClassId = watch("classId")
  const selectedSubjectId = watch("subjectId")
  const selectedDifficulty = watch("difficulty")
  const selectedSource = watch("source")

  const { data: classesData } = useAcademicClassesForSelection()
  const { data: subjectsData } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )

  const classes = Array.isArray(classesData) ? classesData : []
  const subjects = Array.isArray(subjectsData) ? subjectsData : []

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const onSubmit = async (data: CreatePunctuationFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      await createMutation.mutateAsync({
        subjectId: data.subjectId,
        rawText: data.content.trim(),
        source: (data.source?.trim() as PunctuationSource) || null,
        session: data.session?.trim() || null,
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
        reference: referenceArray,
      })

      toast.success("বিরামচিহ্ন প্রশ্ন সফলভাবে যোগ করা হয়েছে।")
      router.push("/punctuation")
    } catch (err: any) {
      const msg = err?.message || "বিরামচিহ্ন প্রশ্ন তৈরি করতে সমস্যা হয়েছে।"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="নতুন বিরামচিহ্ন প্রশ্ন যোগ করুন"
        description="প্রশ্ন ব্যাংকের জন্য নতুন বিরামচিহ্ন (Punctuation) অনুচ্ছেদ তৈরি করুন।"
        icon={Quote}
        breadcrumbs={[
          { label: "বিরামচিহ্ন", href: "/punctuation" },
          { label: "নতুন যোগ করুন" },
        ]}
      >
        <Button asChild variant="outline" size="sm" className="h-9 gap-2 rounded-lg">
          <Link href="/punctuation">
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
            <CardTitle className="text-base font-bold">শ্রেণি ও বিষয়</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                শ্রেণি <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedClassId}
                onValueChange={(val) => {
                  setValue("classId", val, { shouldValidate: true })
                  setValue("subjectId", "")
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
                onValueChange={(val) => setValue("subjectId", val, { shouldValidate: true })}
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
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-base font-bold">অনুচ্ছেদ / প্রশ্নের টেক্সট</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">
                প্রশ্নের টেক্সট <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                rows={5}
                placeholder="বিরামচিহ্নহীন বা প্রয়োজনীয় অনুচ্ছেদটি লিখুন..."
                {...register("content")}
              />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
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
                  {PUNCTUATION_SOURCE_OPTIONS.map((opt) => (
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
            <Link href="/punctuation">বাতিল করুন</Link>
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

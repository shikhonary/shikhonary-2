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
import { Checkbox } from "@workspace/ui/components/checkbox"
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
  useCreateFormFilling,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-form-filling"

const createFormFillingSchema = z.object({
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

type CreateFormFillingFormData = z.infer<typeof createFormFillingSchema>

const difficultyLabels: Record<string, string> = {
  EASY: "সহজ (Easy)",
  MEDIUM: "মাঝারি (Medium)",
  HARD: "কঠিন (Hard)",
}

const DEFAULT_FORM_DATA_JSON = JSON.stringify(
  {
    "১. নাম": "",
    "২. পিতার নাম": "",
    "৩. মাতার নাম": "",
    "৪. জন্ম তারিখ": "",
    "৫. শ্রেণি": "",
  },
  null,
  2
)

const DEFAULT_SOLUTION_JSON = JSON.stringify(
  {
    "১. নাম": "তানভীর আহমেদ",
    "২. পিতার নাম": "রফিকুল ইসলাম",
    "৩. মাতার নাম": "সালমা বেগম",
    "৪. জন্ম তারিখ": "১২/০৫/২০১০",
    "৫. শ্রেণি": "অষ্টম",
  },
  null,
  2
)

export function CreateFormFillingView() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const createMutation = useCreateFormFilling()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateFormFillingFormData>({
    resolver: zodResolver(createFormFillingSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      scenario: "",
      institution: "",
      title: "ভর্তি ফরম",
      description: "",
      hasPhoto: false,
      declaration: "উপরিউক্ত তথ্যসমূহ সম্পূর্ণ সত্য।",
      signaturesText: "প্রার্থীর স্বাক্ষর, অভিভাবকের স্বাক্ষর",
      formDataText: DEFAULT_FORM_DATA_JSON,
      solutionText: DEFAULT_SOLUTION_JSON,
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
      source: "গাইড বুক",
      session: new Date().getFullYear().toString(),
    },
  })

  const selectedClassId = watch("classId")
  const selectedSubjectId = watch("subjectId")
  const selectedChapterId = watch("chapterId")
  const selectedDifficulty = watch("difficulty")
  const selectedSource = watch("source")
  const hasPhoto = watch("hasPhoto")

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

  const onSubmit = async (data: CreateFormFillingFormData) => {
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

      await createMutation.mutateAsync({
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

      toast.success("ফর্ম পূরণ প্রশ্ন সফলভাবে যোগ করা হয়েছে।")
      router.push("/form-filling")
    } catch (err: any) {
      const msg = err?.message || "ফর্ম পূরণ প্রশ্ন তৈরি করতে সমস্যা হয়েছে।"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="নতুন ফর্ম পূরণ প্রশ্ন যোগ করুন"
        description="প্রশ্ন ব্যাংকের জন্য নতুন ফর্ম পূরণ প্রশ্ন ও তার কাঠামো তৈরি করুন।"
        icon={FileText}
        breadcrumbs={[
          { label: "ফর্ম পূরণ", href: "/form-filling" },
          { label: "নতুন যোগ করুন" },
        ]}
      >
        <Button asChild variant="outline" size="sm" className="h-9 gap-2 rounded-lg">
          <Link href="/form-filling">
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
              <Label>
                অধ্যায় <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedChapterId}
                disabled={!selectedSubjectId}
                onValueChange={(val) => setValue("chapterId", val, { shouldValidate: true })}
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
              <Textarea
                id="scenario"
                rows={3}
                placeholder="যেমন: মনে করো, তুমি তানভীর আহমেদ। বিদ্যালয়ের পাঠাগারের সদস্য হওয়ার জন্য নিচের ফরমটি পূরণ করো।"
                {...register("scenario")}
              />
              {errors.scenario && <p className="text-xs text-destructive">{errors.scenario.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institution">প্রতিষ্ঠানের নাম</Label>
                <Input
                  id="institution"
                  placeholder="যেমন: ঢাকা সরকারি উচ্চ বিদ্যালয়"
                  {...register("institution")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">ফর্মের শিরোনাম</Label>
                <Input id="title" placeholder="যেমন: সদস্য ফরম / ভর্তি ফরম" {...register("title")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">উপ-শিরোনাম / বিবরণ (ঐচ্ছিক)</Label>
              <Input
                id="description"
                placeholder="যেমন: ২০২৫ শিক্ষাবর্ষ"
                {...register("description")}
              />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <Checkbox
                id="hasPhoto"
                checked={hasPhoto}
                onCheckedChange={(checked) => setValue("hasPhoto", checked === true)}
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
                <Input
                  id="declaration"
                  placeholder="যেমন: উপরোক্ত সকল তথ্য সত্য ও নির্ভুল।"
                  {...register("declaration")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signaturesText">স্বাক্ষরসমূহ (কমা দিয়ে আলাদা করুন)</Label>
                <Input
                  id="signaturesText"
                  placeholder="যেমন: শিক্ষার্থীর স্বাক্ষর, অভিভাবকের স্বাক্ষর"
                  {...register("signaturesText")}
                />
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
                  {FORM_FILLING_SOURCE_OPTIONS.map((opt) => (
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
              <Label htmlFor="referenceText">রেফারেন্স (কমা দিয়ে আলাদা করুন)</Label>
              <Input
                id="referenceText"
                placeholder="যেমন: ঢাকা বোর্ড ২০২৪, রাজউক উত্তরা মডেল"
                {...register("referenceText")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button asChild type="button" variant="outline" className="rounded-lg">
            <Link href="/form-filling">বাতিল করুন</Link>
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

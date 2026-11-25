"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save, FileText, AlertCircle, Underline } from "lucide-react"
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
  useCreatePartsOfSpeech,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-parts-of-speech"

const createPartsOfSpeechSchema = z.object({
  classId: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  subjectId: z.string().min(1, "বিষয় নির্বাচন করুন"),
  chapterId: z.string().optional(),
  content: z.string().min(1, "প্রশ্নের টেক্সট / অনুচ্ছেদ আবশ্যক"),
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

type CreatePartsOfSpeechFormData = z.infer<typeof createPartsOfSpeechSchema>

const difficultyLabels: Record<string, string> = {
  EASY: "সহজ (Easy)",
  MEDIUM: "মাঝারি (Medium)",
  HARD: "কঠিন (Hard)",
}

function ContentPreview({ text }: { text: string }) {
  if (!text.trim()) {
    return (
      <span className="text-muted-foreground italic text-xs">
        উপরে টেক্সট লিখলে এখানে আন্ডারলাইন প্রিভিউ দেখা যাবে...
      </span>
    )
  }

  const parts = text.split(/(<u>.*?<\/u>)/gi)

  return (
    <div className="leading-relaxed text-sm text-foreground">
      {parts.map((part, index) => {
        if (/^<u>(.*?)<\/u>$/i.test(part)) {
          const match = part.match(/^<u>(.*?)<\/u>$/i)
          return (
            <u
              key={index}
              className="font-bold text-primary underline decoration-primary decoration-2 underline-offset-3"
            >
              {match ? match[1] : part}
            </u>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </div>
  )
}

export function CreatePartsOfSpeechView() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const createMutation = useCreatePartsOfSpeech()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreatePartsOfSpeechFormData>({
    resolver: zodResolver(createPartsOfSpeechSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      content: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
    },
  })

  const selectedClassId = watch("classId")
  const selectedSubjectId = watch("subjectId")
  const selectedChapterId = watch("chapterId")
  const selectedDifficulty = watch("difficulty")
  const contentValue = watch("content")

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

  const insertUnderlineTag = () => {
    const textarea = document.getElementById("content-textarea-create") as HTMLTextAreaElement | null
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = contentValue.substring(start, end) || "word"
    const replacement = `<u>${selectedText}</u>`
    const newContent = contentValue.substring(0, start) + replacement + contentValue.substring(end)

    setValue("content", newContent, { shouldValidate: true })
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + 3, start + 3 + selectedText.length)
    }, 50)
  }

  const onSubmit = async (data: CreatePartsOfSpeechFormData) => {
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
        chapterId: data.chapterId || null,
        content: data.content.trim(),
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
        reference: referenceArray,
      })

      toast.success("Parts of Speech প্রশ্ন সফলভাবে যোগ করা হয়েছে।")
      router.push("/parts-of-speech")
    } catch (err: any) {
      const msg = err?.message || "প্রশ্ন তৈরি করতে সমস্যা হয়েছে।"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="নতুন Parts of Speech প্রশ্ন যোগ করুন"
        description="প্রশ্ন ব্যাংকের জন্য নতুন Parts of Speech প্রশ্ন ও আন্ডারলাইন করা শব্দ তৈরি করুন।"
        icon={FileText}
        breadcrumbs={[
          { label: "Parts of Speech", href: "/parts-of-speech" },
          { label: "নতুন যোগ করুন" },
        ]}
      >
        <Button asChild variant="outline" size="sm" className="h-9 gap-2 rounded-lg">
          <Link href="/parts-of-speech">
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
          <CardHeader className="border-b border-border/60 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">বাক্য / অনুচ্ছেদ</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={insertUnderlineTag}
              className="h-8 gap-1.5 text-xs"
            >
              <Underline className="size-3.5" />
              <span>Underline (&lt;u&gt;) যোগ করুন</span>
            </Button>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content-textarea-create">
                প্রশ্নের টেক্সট <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content-textarea-create"
                rows={4}
                placeholder="যেমন: The <u>quick</u> brown fox jumps over the lazy dog."
                {...register("content")}
              />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                লাইভ প্রিভিউ:
              </span>
              <ContentPreview text={contentValue} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-base font-bold">মেটাডেটা ও রেফারেন্স</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="popularityCount">জনপ্রিয়তা (Popularity Count)</Label>
              <Input id="popularityCount" type="number" {...register("popularityCount")} />
              {errors.popularityCount && (
                <p className="text-xs text-destructive">{errors.popularityCount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceText">রেফারেন্স (কমা দিয়ে আলাদা করুন)</Label>
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
            <Link href="/parts-of-speech">বাতিল করুন</Link>
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

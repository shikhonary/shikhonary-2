"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useCreateEkKothayProkash,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-ek-kothay-prokash"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { ChevronRightIcon } from "lucide-react"
import { QUESTION_DIFFICULTY } from "@workspace/utils"
import { EK_KOTHAY_PROKASH_SOURCE_OPTIONS } from "../constants"

const createEkKothayProkashFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().min(1, "Please select a chapter"),
  phrase: z.string().min(1, "Phrase is required"),
  oneWord: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  referenceText: z.string().optional(),
  source: z.string().optional(),
})

type CreateEkKothayProkashFormData = z.infer<typeof createEkKothayProkashFormSchema>

export function CreateEkKothayProkashView() {
  const router = useRouter()
  const createMutation = useCreateEkKothayProkash()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateEkKothayProkashFormData>({
    resolver: zodResolver(createEkKothayProkashFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      phrase: "",
      oneWord: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
      source: "গাইড বুক",
    },
  })

  const selectedClassId = watch("classId")
  const selectedSubjectId = watch("subjectId")

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const onSubmit = async (data: CreateEkKothayProkashFormData) => {
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
        chapterId: data.chapterId,
        academicChapterId: data.chapterId,
        phrase: data.phrase.trim(),
        oneWord: data.oneWord?.trim() || null,
        difficulty: data.difficulty,
        reference: referenceArray,
        source: data.source?.trim() || null,
      })

      toast.success("Ek Kothay Prokash entry created successfully.")
      setTimeout(() => {
        router.push("/ek-kothay-prokash")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to create Ek Kothay Prokash entry"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-4 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/ek-kothay-prokash"
              className="font-label-sm hover:text-primary transition-colors cursor-pointer text-xs"
            >
              Ek Kothay Prokash
            </Link>
            <ChevronRightIcon className="size-3 text-on-surface-variant/70" />
            <span className="font-label-sm font-bold text-primary text-xs">Create Entry</span>
          </nav>
          <h2 className="mb-2 font-headline-md text-3xl font-extrabold text-primary">
            Create Ek Kothay Prokash Entry
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed text-sm">
            Add a new phrase and its one-word substitution (এক কথায় প্রকাশ) to the chapter-based question bank.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-lg bg-error/10 border border-error/20 p-4 text-xs font-semibold text-error">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Academic Context */}
        <Card className="border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs rounded-xl">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-base font-bold text-on-surface">
              Academic Context
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Class */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Class *</Label>
              <Controller
                name="classId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val)
                      setValue("subjectId", "")
                      setValue("chapterId", "")
                    }}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {academicClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.classId && (
                <p className="text-[11px] font-medium text-error">{errors.classId.message}</p>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Subject *</Label>
              <Controller
                name="subjectId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val)
                      setValue("chapterId", "")
                    }}
                    disabled={!selectedClassId}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder={selectedClassId ? "Select Subject" : "Select Class First"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {subjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subjectId && (
                <p className="text-[11px] font-medium text-error">{errors.subjectId.message}</p>
              )}
            </div>

            {/* Chapter */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Chapter *</Label>
              <Controller
                name="chapterId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedSubjectId}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder={selectedSubjectId ? "Select Chapter" : "Select Subject First"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {chapters.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id}>
                          {ch.nameBn || ch.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.chapterId && (
                <p className="text-[11px] font-medium text-error">{errors.chapterId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content & Expression */}
        <Card className="border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs rounded-xl">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-base font-bold text-on-surface">
              Content & Expression
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {/* Phrase */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Phrase / Sentence (বাক্য / বাক্যাংশ) *</Label>
              <Textarea
                {...register("phrase")}
                placeholder="e.g. যা পূর্বে দেখা যায়নি"
                className="bg-white min-h-[100px] font-solaiman text-base"
              />
              {errors.phrase && (
                <p className="text-[11px] font-medium text-error">{errors.phrase.message}</p>
              )}
            </div>

            {/* OneWord */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">One Word Substitution (এক কথায় প্রকাশ)</Label>
              <Input
                {...register("oneWord")}
                placeholder="e.g. অদৃষ্টপূর্ব"
                className="bg-white font-solaiman text-base"
              />
              {errors.oneWord && (
                <p className="text-[11px] font-medium text-error">{errors.oneWord.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings & Reference Metadata */}
        <Card className="border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs rounded-xl">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-base font-bold text-on-surface">
              Metadata & Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Difficulty */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Difficulty</Label>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select Difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value={QUESTION_DIFFICULTY.EASY}>EASY</SelectItem>
                      <SelectItem value={QUESTION_DIFFICULTY.MEDIUM}>MEDIUM</SelectItem>
                      <SelectItem value={QUESTION_DIFFICULTY.HARD}>HARD</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Source</Label>
              <Controller
                name="source"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select Source" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {EK_KOTHAY_PROKASH_SOURCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Reference */}
            <div className="space-y-2 md:col-span-3">
              <Label className="text-xs font-bold text-on-surface">References (comma separated)</Label>
              <Input
                {...register("referenceText")}
                placeholder="e.g. ঢাকা বোর্ড ২০২৪, রাজশাহী বোর্ড ২০২৩"
                className="bg-white"
              />
              <p className="text-[11px] text-outline">Separate multiple board/exam references with commas.</p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/ek-kothay-prokash">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="bg-primary text-white font-bold">
            {isSubmitting ? "Creating..." : "Save Entry"}
          </Button>
        </div>
      </form>
    </div>
  )
}

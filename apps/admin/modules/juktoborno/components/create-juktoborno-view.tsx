"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useCreateJuktoborno,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-juktoborno"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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
import { JUKTOBORNO_SOURCE_OPTIONS } from "../constants"

const createJuktobornoFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().optional(),
  juktoborno: z.string().min(1, "Juktoborno text is required"),
  source: z.string().optional(),
  session: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  referenceText: z.string().optional(),
})

type CreateJuktobornoFormData = z.infer<typeof createJuktobornoFormSchema>

export function CreateJuktobornoView() {
  const router = useRouter()
  const createMutation = useCreateJuktoborno()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateJuktobornoFormData>({
    resolver: zodResolver(createJuktobornoFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      juktoborno: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
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

  const onSubmit = async (data: CreateJuktobornoFormData) => {
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
        juktoborno: data.juktoborno.trim(),
        source: data.source || null,
        session: data.session || null,
        difficulty: data.difficulty,
        reference: referenceArray,
      })

      toast.success("Juktoborno entry created successfully.")
      setTimeout(() => {
        router.push("/juktoborno")
      }, 500)
    } catch (err: any) {
      const msg = err?.message || "Failed to create juktoborno entry."
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/juktoborno" className="hover:text-primary transition-colors">
          Juktoborno
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="font-semibold text-on-surface">Add New Juktoborno</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">
          Create Juktoborno Entry
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Add a new conjunct letter (যুক্তবর্ণ) question entry linked to class, subject, and chapter.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl border border-error/30 bg-error-container/20 text-error text-sm font-medium">
          {errorMessage}
        </div>
      )}

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Juktoborno Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Class, Subject, Chapter Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Class Selection */}
              <div className="space-y-2">
                <Label htmlFor="classId" className="font-semibold">
                  Academic Class <span className="text-error">*</span>
                </Label>
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
                      <SelectTrigger id="classId" className="w-full">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
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
                  <p className="text-xs text-error">{errors.classId.message}</p>
                )}
              </div>

              {/* Subject Selection */}
              <div className="space-y-2">
                <Label htmlFor="subjectId" className="font-semibold">
                  Subject <span className="text-error">*</span>
                </Label>
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
                      <SelectTrigger id="subjectId" className="w-full">
                        <SelectValue
                          placeholder={
                            !selectedClassId ? "Select Class First" : "Select Subject"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
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
                  <p className="text-xs text-error">{errors.subjectId.message}</p>
                )}
              </div>

              {/* Chapter Selection */}
              <div className="space-y-2">
                <Label htmlFor="chapterId" className="font-semibold">
                  Chapter (Optional)
                </Label>
                <Controller
                  name="chapterId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedSubjectId}
                    >
                      <SelectTrigger id="chapterId" className="w-full">
                        <SelectValue
                          placeholder={
                            !selectedSubjectId ? "Select Subject First" : "Select Chapter"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((ch) => (
                          <SelectItem key={ch.id} value={ch.id}>
                            {ch.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.chapterId && (
                  <p className="text-xs text-error">{errors.chapterId.message}</p>
                )}
              </div>
            </div>

            {/* Juktoborno Text */}
            <div className="space-y-2">
              <Label htmlFor="juktoborno" className="font-semibold">
                Juktoborno (যুক্তবর্ণ) <span className="text-error">*</span>
              </Label>
              <Input
                id="juktoborno"
                placeholder="e.g. ক্ষ, জ্ঞ, ঙ্ক"
                {...register("juktoborno")}
                className="w-full"
              />
              {errors.juktoborno && (
                <p className="text-xs text-error">{errors.juktoborno.message}</p>
              )}
            </div>

            {/* Difficulty & Board References Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficulty" className="font-semibold">
                  Difficulty Level
                </Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="difficulty" className="w-full">
                        <SelectValue placeholder="Select Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={QUESTION_DIFFICULTY.EASY}>EASY</SelectItem>
                        <SelectItem value={QUESTION_DIFFICULTY.MEDIUM}>MEDIUM</SelectItem>
                        <SelectItem value={QUESTION_DIFFICULTY.HARD}>HARD</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

            {/* Source & Session Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source Select */}
              <div className="space-y-2">
                <Label htmlFor="source" className="font-semibold">
                  Source / উৎস
                </Label>
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger id="source" className="w-full">
                        <SelectValue placeholder="উৎস নির্বাচন করুন (যেমন: গাইড বুক)" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-neutral-900 border border-outline-variant max-h-60">
                        {JUKTOBORNO_SOURCE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-neutral-900">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Session Input */}
              <div className="space-y-2">
                <Label htmlFor="session" className="font-semibold">
                  Session / বছর
                </Label>
                <Input
                  id="session"
                  placeholder="e.g. 2024-2025 or 2024"
                  {...register("session")}
                  className="w-full"
                />
              </div>
            </div>

            {/* Board References */}
            <div className="space-y-2">
                <Label htmlFor="referenceText" className="font-semibold">
                  Board References (Comma separated)
                </Label>
                <Input
                  id="referenceText"
                  placeholder="e.g. ঢাকা বোর্ড ২০২৪, রাজশাহী বোর্ড ২০২৩"
                  {...register("referenceText")}
                  className="w-full"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
              <Button asChild variant="outline">
                <Link href="/juktoborno">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Create Juktoborno"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

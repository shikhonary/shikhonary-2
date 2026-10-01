"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useCreateFormFilling,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-form-filling"
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
import { FORM_FILLING_SOURCE_OPTIONS } from "../constants"

import { Checkbox } from "@workspace/ui/components/checkbox"

const sampleFormDataDefault = `{
  "Name": "",
  "Father's Name": "",
  "Mother's Name": "",
  "Date of Birth": "",
  "Class": "",
  "Roll No": ""
}`

const createFormFillingFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().min(1, "Please select a chapter"),
  scenario: z.string().min(1, "Scenario description is required"),
  institution: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  hasPhoto: z.boolean(),
  declaration: z.string().optional(),
  signaturesText: z.string().optional(),
  formDataText: z.string().min(1, "Form Data JSON is required"),
  solutionText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  referenceText: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
})

type CreateFormFillingFormData = z.infer<typeof createFormFillingFormSchema>

export function CreateFormFillingView() {
  const router = useRouter()
  const createMutation = useCreateFormFilling()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateFormFillingFormData>({
    resolver: zodResolver(createFormFillingFormSchema),
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
      signaturesText: "প্রার্থীর স্বাক্ষর",
      formDataText: sampleFormDataDefault,
      solutionText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
      source: "গাইড বুক",
      session: new Date().getFullYear().toString(),
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

  const onSubmit = async (data: CreateFormFillingFormData) => {
    setErrorMessage(null)

    try {
      let parsedFormData: any
      try {
        parsedFormData = JSON.parse(data.formDataText)
      } catch (e: any) {
        throw new Error("Form Data JSON is invalid. Please ensure valid JSON format.")
      }

      let parsedSolution: any = null
      if (data.solutionText && data.solutionText.trim() !== "") {
        try {
          parsedSolution = JSON.parse(data.solutionText)
        } catch (e: any) {
          throw new Error("Solution JSON is invalid. Please ensure valid JSON format.")
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
        source: data.source?.trim() || null,
        session: data.session?.trim() || null,
      })

      toast.success("Form Filling entry created successfully.")
      setTimeout(() => {
        router.push("/form-filling")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to create form filling entry"
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
              href="/form-filling"
              className="font-label-sm hover:text-primary transition-colors cursor-pointer text-xs"
            >
              Form Filling
            </Link>
            <ChevronRightIcon className="size-3 text-on-surface-variant/70" />
            <span className="font-label-sm font-bold text-primary text-xs">Create Entry</span>
          </nav>
          <h2 className="mb-2 font-headline-md text-3xl font-extrabold text-primary">
            Create Form Filling Entry
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed text-sm">
            Add a new form filling scenario (ফরম পূরণ) and field structure to the question bank.
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
        <Card className="rounded-2xl border border-outline-variant/60 shadow-xs bg-white">
          <CardHeader className="border-b border-outline-variant/40 bg-surface-container-low/50 px-6 py-4">
            <CardTitle className="text-base font-bold text-primary">
              1. Academic Taxonomy & Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <SelectTrigger className="rounded-xl border-outline-variant/60 bg-white">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md">
                      {academicClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.nameBn || cls.nameEn}
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

            {/* Subject */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Subject *</Label>
              <Controller
                name="subjectId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    disabled={!selectedClassId}
                    onValueChange={(val) => {
                      field.onChange(val)
                      setValue("chapterId", "")
                    }}
                  >
                    <SelectTrigger className="rounded-xl border-outline-variant/60 bg-white">
                      <SelectValue placeholder={selectedClassId ? "Select subject" : "Select class first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md">
                      {subjects.map((subj) => (
                        <SelectItem key={subj.id} value={subj.id}>
                          {subj.nameBn || subj.nameEn}
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

            {/* Chapter */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Chapter *</Label>
              <Controller
                name="chapterId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    disabled={!selectedSubjectId}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="rounded-xl border-outline-variant/60 bg-white">
                      <SelectValue placeholder={selectedSubjectId ? "Select chapter" : "Select subject first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md">
                      {chapters.map((chap) => (
                        <SelectItem key={chap.id} value={chap.id}>
                          {chap.nameBn || chap.nameEn}
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
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="rounded-2xl border border-outline-variant/60 shadow-xs bg-white">
          <CardHeader className="border-b border-outline-variant/40 bg-surface-container-low/50 px-6 py-4">
            <CardTitle className="text-base font-bold text-primary">
              2. Form Header, Scenario & Data Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Form Header / Institution Name, Title & Subtitle */}
            <div className="space-y-4 bg-surface-container-low/30 p-4 rounded-xl border border-outline-variant/40">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-on-surface">Institution Name (প্রতিষ্ঠানের নাম / উৎস)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. কোকিল সরকারি প্রাথমিক বিদ্যালয়, ঠাকুরগাঁও"
                    {...register("institution")}
                    className="rounded-xl border-outline-variant/60 bg-white font-solaiman text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-on-surface">Form Title (ফরমের শিরোনাম)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. ভর্তির আবেদন ফরম"
                    {...register("title")}
                    className="rounded-xl border-outline-variant/60 bg-white font-solaiman text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-on-surface">Form Subtitle / Description (বিষয়/উপশিরোনাম)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. গ্রন্থাগার সদস্যপদ ফরম / সঞ্চয়ী হিসাব"
                    {...register("description")}
                    className="rounded-xl border-outline-variant/60 bg-white font-solaiman text-sm"
                  />
                </div>
              </div>

              {/* Has Photo Box Toggle */}
              <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/30">
                <Controller
                  name="hasPhoto"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasPhoto"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label
                        htmlFor="hasPhoto"
                        className="text-xs font-semibold text-on-surface cursor-pointer select-none"
                      >
                        Include Photo Box (ডানদিকের কোণায় &ldquo;ছবি&rdquo; ঘর প্রদর্শন করুন)
                      </label>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Scenario */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Scenario / উদ্দীপক *</Label>
              <Textarea
                rows={4}
                placeholder="e.g. মনে করো, তুমি সায়িদা/সায়িদ। তুমি কোকিল সরকারি প্রাথমিক বিদ্যালয়ের পঞ্চম শ্রেণির শিক্ষার্থী। নিচের ভর্তির আবেদন ফরমটি সঠিক তথ্য দিয়ে পূরণ করো।"
                {...register("scenario")}
                className="rounded-xl border-outline-variant/60 font-solaiman text-base leading-relaxed"
              />
              {errors.scenario && (
                <p className="text-xs text-error">{errors.scenario.message}</p>
              )}
            </div>

            {/* Form Data JSON */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-on-surface">Form Data Structure (JSON) *</Label>
                <span className="text-[11px] text-outline font-mono">Valid JSON Object or Array</span>
              </div>
              <Textarea
                rows={6}
                placeholder={`{\n  "১. প্রার্থীর নাম": "",\n  "২. শ্রেণি": "",\n  "৩. পিতার নাম": ""\n}`}
                {...register("formDataText")}
                className="rounded-xl border-outline-variant/60 font-mono text-xs leading-relaxed"
              />
              {errors.formDataText && (
                <p className="text-xs text-error">{errors.formDataText.message}</p>
              )}
            </div>

            {/* Solution JSON */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-on-surface">Solution Answer Key (Optional JSON)</Label>
                <span className="text-[11px] text-outline font-mono font-normal">Optional JSON</span>
              </div>
              <Textarea
                rows={5}
                placeholder={`{\n  "১. প্রার্থীর নাম": "সায়িদা",\n  "২. শ্রেণি": "পঞ্চম"\n}`}
                {...register("solutionText")}
                className="rounded-xl border-outline-variant/60 font-mono text-xs leading-relaxed"
              />
            </div>

            {/* Declaration & Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-low/30 p-4 rounded-xl border border-outline-variant/40">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-on-surface">Declaration / Undertaking (অঙ্গীকার / ঘোষণা)</Label>
                <Textarea
                  rows={3}
                  placeholder="e.g. উপরে বর্ণিত সকল তথ্য সত্য। আমি এই প্রতিষ্ঠানের প্রতি আনুগত্যের নীতিমালা মেনে চলব।"
                  {...register("declaration")}
                  className="rounded-xl border-outline-variant/60 bg-white font-solaiman text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-on-surface">Signatures / স্বাক্ষরকারীগণ (Comma separated)</Label>
                <Input
                  type="text"
                  placeholder="e.g. প্রার্থীর স্বাক্ষর, অভিভাবকের স্বাক্ষর"
                  {...register("signaturesText")}
                  className="rounded-xl border-outline-variant/60 bg-white font-solaiman text-sm"
                />
                <span className="text-[11px] text-outline block">
                  Multiple signatures separated by comma (e.g. প্রার্থীর স্বাক্ষর, অভিভাবকের স্বাক্ষর)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata & Tagging */}
        <Card className="rounded-2xl border border-outline-variant/60 shadow-xs bg-white">
          <CardHeader className="border-b border-outline-variant/40 bg-surface-container-low/50 px-6 py-4">
            <CardTitle className="text-base font-bold text-primary">
              3. Metadata, Tags & Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Difficulty */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Difficulty Level *</Label>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="rounded-xl border-outline-variant/60 bg-white">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md">
                      <SelectItem value={QUESTION_DIFFICULTY.EASY}>Easy</SelectItem>
                      <SelectItem value={QUESTION_DIFFICULTY.MEDIUM}>Medium</SelectItem>
                      <SelectItem value={QUESTION_DIFFICULTY.HARD}>Hard</SelectItem>
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
                  <Select value={field.value || "গাইড বুক"} onValueChange={field.onChange}>
                    <SelectTrigger className="rounded-xl border-outline-variant/60 bg-white">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md">
                      {FORM_FILLING_SOURCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Session */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Session / Year</Label>
              <Input
                type="text"
                placeholder="e.g. 2026"
                {...register("session")}
                className="rounded-xl border-outline-variant/60 bg-white"
              />
            </div>

            {/* Reference Tags */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-on-surface">Board References (Comma separated)</Label>
              <Input
                type="text"
                placeholder="e.g. ঢাকা বোর্ড ২০২৪, রাজশাহী বোর্ড ২০২৩"
                {...register("referenceText")}
                className="rounded-xl border-outline-variant/60 bg-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => router.push("/form-filling")}
            className="rounded-xl border-outline-variant px-6 py-2.5 font-bold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-primary text-white hover:bg-primary/90 px-8 py-2.5 font-bold cursor-pointer"
          >
            {isSubmitting ? "Saving..." : "Create Form Filling"}
          </Button>
        </div>
      </form>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@workspace/ui/lib/utils"
import { toast } from "@workspace/ui/components/sonner"
import {
  useSeenComprehensionById,
  useUpdateSeenComprehension,
  useSubjectsForSelection,
  useAcademicClassesForSelection,
  useChaptersForSelection,
} from "../services/use-seen-comprehension"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  BookOpen,
  ArrowLeft,
  Plus,
  Trash2,
  Layers,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import {
  QUESTION_DIFFICULTY,
  SEEN_COMPREHENSION_TYPES,
} from "@workspace/utils"
import { RenderMath } from "@workspace/ui/components/render-math"

const subQuestionFormSchema = z.object({
  groupNumber: z.coerce.number().int(),
  groupTitle: z.string().optional(),
  itemLabel: z.string().optional(),
  type: z.string(),
  question: z.string().min(1, "Question text is required"),
  optionsText: z.string().optional(),
  answer: z.string().optional(),
  explanation: z.string().optional(),
  marks: z.coerce.number(),
})

const editSeenComprehensionFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().optional(),
  comprehensionType: z.string(),
  title: z.string().optional(),
  passage: z.string().min(1, "Passage content is required"),
  instruction: z.string().optional(),
  source: z.string().optional(),
  referenceText: z.string().optional(),
  session: z.string().optional(),
  difficulty: z.string(),
  isActive: z.boolean(),
  questions: z.array(subQuestionFormSchema).min(1, "At least one question is required"),
})

type EditSeenComprehensionFormData = z.infer<typeof editSeenComprehensionFormSchema>

export function EditSeenComprehensionView({ id: propId }: { id?: string } = {}) {
  const router = useRouter()
  const params = useParams()
  const id = propId || (params?.id as string) || ""
  const { data: item, isLoading, isError } = useSeenComprehensionById(id)
  const updateMutation = useUpdateSeenComprehension()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [previewPassage, setPreviewPassage] = useState(false)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditSeenComprehensionFormData>({
    resolver: zodResolver(editSeenComprehensionFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      comprehensionType: SEEN_COMPREHENSION_TYPES.SEEN_COMPREHENSION_1,
      title: "",
      passage: "",
      instruction: "",
      source: "",
      referenceText: "",
      session: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      isActive: true,
      questions: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  })

  useEffect(() => {
    if (item) {
      const clsId = (item.subject as any)?.academicClassId || ""
      const refText = Array.isArray(item.reference) ? item.reference.join(", ") : ""

      const mappedQuestions = (item.questions || []).map((q: any) => {
        let optText = ""
        if (q.options) {
          try {
            const parsed = typeof q.options === "string" ? JSON.parse(q.options) : q.options
            if (Array.isArray(parsed)) {
              optText = parsed.map((o: any) => (typeof o === "string" ? o : o.text || "")).join(", ")
            }
          } catch {
            optText = String(q.options)
          }
        }

        return {
          groupNumber: q.groupNumber ?? 1,
          groupTitle: q.groupTitle || "",
          itemLabel: q.itemLabel || "",
          type: q.type || "SHORT_ANSWER",
          question: q.question || "",
          optionsText: optText,
          answer: q.answer || "",
          explanation: q.explanation || "",
          marks: q.marks ?? 1.0,
        }
      })

      reset({
        classId: clsId,
        subjectId: item.subjectId,
        chapterId: item.academicChapterId || "",
        comprehensionType: item.comprehensionType || SEEN_COMPREHENSION_TYPES.SEEN_COMPREHENSION_1,
        title: item.title || "",
        passage: item.passage || "",
        instruction: item.instruction || "",
        source: item.source || "",
        referenceText: refText,
        session: item.session || "",
        difficulty: item.difficulty || QUESTION_DIFFICULTY.MEDIUM,
        isActive: item.isActive,
        questions: mappedQuestions.length > 0 ? mappedQuestions : [
          {
            groupNumber: 1,
            groupTitle: "",
            itemLabel: "a",
            type: "SHORT_ANSWER",
            question: "",
            optionsText: "",
            answer: "",
            explanation: "",
            marks: 1.0,
          },
        ],
      })
    }
  }, [item, reset])

  const selectedClassId = watch("classId")
  const selectedSubjectId = watch("subjectId")
  const watchedPassage = watch("passage")
  const watchedQuestions = watch("questions") || []

  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const totalCalculatedMarks = watchedQuestions.reduce(
    (sum, q) => sum + (Number(q.marks) || 0),
    0
  )

  const addQuestion = (type = "SHORT_ANSWER", marks = 1.0) => {
    let groupNum = 1;
    let title = "";
    if (type === "MCQ") {
      groupNum = 1;
      title = "1. Choose the correct answer from the following alternatives:";
    } else if (type === "TRUE_FALSE") {
      const existingGroupNumbers = Array.from(new Set(watchedQuestions.map((q) => q.groupNumber || 1))).sort((a, b) => a - b);
      const tfGroup = watchedQuestions.find((q) => q.type === "TRUE_FALSE");
      if (tfGroup) {
        groupNum = tfGroup.groupNumber;
      } else if (existingGroupNumbers.includes(2) && !watchedQuestions.some(q => q.groupNumber === 2 && q.type === "TRUE_FALSE")) {
        groupNum = Math.max(...existingGroupNumbers, 1) + 1;
      } else {
        groupNum = 2;
      }
      title = `${groupNum}. Write 'True' for correct statement and 'False' for incorrect statement.`;
    } else {
      const existingGroupNumbers = Array.from(new Set(watchedQuestions.map((q) => q.groupNumber || 1))).sort((a, b) => a - b);
      const saGroup = watchedQuestions.find((q) => q.type === "SHORT_ANSWER");
      if (saGroup) {
        groupNum = saGroup.groupNumber;
      } else {
        groupNum = Math.max(...existingGroupNumbers, 1) + 1;
      }
      title = `${groupNum}. Answer the following questions:`;
    }
    const countInGroup = watchedQuestions.filter((q) => (q.groupNumber || 1) === groupNum).length;

    append({
      groupNumber: groupNum,
      groupTitle: title,
      itemLabel: String.fromCharCode(97 + (countInGroup % 26)),
      type,
      question: "",
      optionsText: type === "MCQ" ? "Option 1, Option 2, Option 3, Option 4" : "",
      answer: type === "TRUE_FALSE" ? "True" : "",
      explanation: "",
      marks,
    })
  }

  const onSubmit = async (data: EditSeenComprehensionFormData) => {
    setErrorMessage(null)

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      const formattedQuestions = data.questions.map((q, idx) => {
        let optionsJson: Array<{ key: string; text: string }> = []
        if (q.type === "MCQ" && q.optionsText) {
          optionsJson = q.optionsText
            .split(/,|\n/)
            .map((opt) => opt.trim())
            .filter((opt) => opt.length > 0)
            .map((opt, oIdx) => ({
              key: String.fromCharCode(105 + oIdx),
              text: opt,
            }))
        }

        return {
          groupNumber: q.groupNumber,
          groupTitle: q.groupTitle || null,
          itemLabel: q.itemLabel || null,
          orderIndex: idx,
          type: q.type,
          question: q.question,
          options: optionsJson,
          answer: q.answer || null,
          explanation: q.explanation || null,
          marks: q.marks,
        }
      })

      await updateMutation.mutateAsync({
        id,
        subjectId: data.subjectId,
        academicChapterId: data.chapterId || null,
        comprehensionType: data.comprehensionType,
        title: data.title || null,
        passage: data.passage,
        instruction: data.instruction || null,
        source: data.source || null,
        reference: referenceArray,
        session: data.session || null,
        difficulty: data.difficulty,
        totalMarks: totalCalculatedMarks,
        isActive: data.isActive,
        questions: formattedQuestions,
      })

      toast.success("Seen Comprehension updated successfully!")
      router.push("/seen-comprehensions")
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update Seen Comprehension")
      toast.error(err?.message || "Error updating Seen Comprehension")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-outline font-medium">Loading seen comprehension details...</p>
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="p-8 text-center text-destructive">
        <p className="text-sm font-bold">Seen Comprehension not found or failed to load.</p>
        <Button asChild variant="outline" className="mt-4 rounded-xl">
          <Link href="/seen-comprehensions">Back to List</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="rounded-xl h-9 w-9 border-outline-variant/60"
          >
            <Link href="/seen-comprehensions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-primary">
              Edit Seen Comprehension
            </h1>
            <p className="text-xs text-outline">
              Update passage text, instructions, and sub-questions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary border-primary/20">
            Total Marks: {totalCalculatedMarks}
          </Badge>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. Academic Information Card */}
        <Card className="rounded-2xl border-outline-variant/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-outline-variant/40">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-on-surface">
              <Layers className="h-4 w-4 text-primary" />
              Academic Classification & Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Class */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Academic Class *</Label>
              <Controller
                control={control}
                name="classId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val)
                      setValue("subjectId", "")
                      setValue("chapterId", "")
                    }}
                  >
                    <SelectTrigger className="rounded-xl h-10 text-xs">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {academicClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.nameEn} {cls.nameBn ? `(${cls.nameBn})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.classId && (
                <p className="text-[11px] text-destructive">{errors.classId.message}</p>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Subject *</Label>
              <Controller
                control={control}
                name="subjectId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val)
                      setValue("chapterId", "")
                    }}
                  >
                    <SelectTrigger className="rounded-xl h-10 text-xs">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {subjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.nameEn} {sub.nameBn ? `(${sub.nameBn})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subjectId && (
                <p className="text-[11px] text-destructive">{errors.subjectId.message}</p>
              )}
            </div>

            {/* Chapter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Chapter (Optional)</Label>
              <Controller
                control={control}
                name="chapterId"
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="rounded-xl h-10 text-xs">
                      <SelectValue placeholder="Select Chapter" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {chapters.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id}>
                          {ch.nameEn} {ch.nameBn ? `(${ch.nameBn})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Comprehension Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Comprehension Type *</Label>
              <Controller
                control={control}
                name="comprehensionType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="rounded-xl h-10 text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value={SEEN_COMPREHENSION_TYPES.SEEN_COMPREHENSION_1}>
                        Seen Comprehension 1 (MCQ & Short Questions)
                      </SelectItem>
                      <SelectItem value={SEEN_COMPREHENSION_TYPES.SEEN_COMPREHENSION_2}>
                        Seen Comprehension 2 (Cloze, Transfer, Flowchart)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Difficulty *</Label>
              <Controller
                control={control}
                name="difficulty"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="rounded-xl h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Board / Reference */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Board / References</Label>
              <Input
                {...register("referenceText")}
                placeholder="e.g. Dhaka Board 2024, Rajshahi Board 2023"
                className="rounded-xl h-10 text-xs"
              />
            </div>

            {/* Source */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Source / Textbook Page</Label>
              <Input
                {...register("source")}
                placeholder="e.g. English For Today, Class 9, Unit 1 Lesson 2"
                className="rounded-xl h-10 text-xs"
              />
            </div>

            {/* Session */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Session (Optional)</Label>
              <Input
                {...register("session")}
                placeholder="e.g. 2024-2025"
                className="rounded-xl h-10 text-xs"
              />
            </div>

            {/* Active Switch */}
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer h-10">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-xs font-bold text-on-surface">Publish as Active</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* 2. Passage Context Card */}
        <Card className="rounded-2xl border-outline-variant/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-outline-variant/40 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-on-surface">
              <BookOpen className="h-4 w-4 text-primary" />
              Reading Passage & Instruction
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewPassage(!previewPassage)}
              className="rounded-lg h-7 text-xs font-bold"
            >
              {previewPassage ? "Edit Mode" : "Math / Formatted Preview"}
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Passage Title (Optional)</Label>
                <Input
                  {...register("title")}
                  placeholder="e.g. Bangabandhu's Historic Speech on 7th March"
                  className="rounded-xl h-10 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Instruction / Prompt</Label>
                <Input
                  {...register("instruction")}
                  placeholder="e.g. Read the passage carefully and answer the questions following it:"
                  className="rounded-xl h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Passage Text (Supports Markdown & LaTeX Math) *</Label>
              {previewPassage ? (
                <div className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low text-xs leading-relaxed max-h-96 overflow-y-auto">
                  <RenderMath text={watchedPassage || "No passage text entered."} />
                </div>
              ) : (
                <Textarea
                  {...register("passage")}
                  rows={8}
                  placeholder="Enter the full seen passage text here..."
                  className="rounded-xl text-xs font-body leading-relaxed"
                />
              )}
              {errors.passage && (
                <p className="text-[11px] text-destructive">{errors.passage.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3. Sub-Questions Builder Card */}
        <Card className="rounded-2xl border-outline-variant/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-on-surface">
                <FileText className="h-4 w-4 text-primary" />
                Sub-Questions ({fields.length} Items)
              </CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion("MCQ", 1.0)}
                className="rounded-xl h-8 text-xs font-bold gap-1 text-indigo-600 border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10"
              >
                <Plus className="h-3.5 w-3.5" />
                + MCQ
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion("TRUE_FALSE", 1.0)}
                className="rounded-xl h-8 text-xs font-bold gap-1 text-teal-600 border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10"
              >
                <Plus className="h-3.5 w-3.5" />
                + True / False
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion("SHORT_ANSWER", 2.0)}
                className="rounded-xl h-8 text-xs font-bold gap-1 text-emerald-600 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
              >
                <Plus className="h-3.5 w-3.5" />
                + Short Question
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion("FILL_IN_THE_BLANKS", 1.0)}
                className="rounded-xl h-8 text-xs font-bold gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                + Other Item
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {fields.map((field, idx) => {
              const currentQuestionType = watch(`questions.${idx}.type`)
              const isMcq = currentQuestionType === "MCQ"
              const isTrueFalse = currentQuestionType === "TRUE_FALSE"

              return (
                <div
                  key={field.id}
                  className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs text-on-surface">Question #{idx + 1}</span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(idx)}
                      disabled={fields.length <= 1}
                      className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer"
                      title="Remove question"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {/* Group Number */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold">Group / Section #</Label>
                      <Input
                        type="number"
                        {...register(`questions.${idx}.groupNumber` as const)}
                        className="rounded-lg h-9 text-xs"
                      />
                    </div>

                    {/* Item Label */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold">Item Label (e.g. a, b, i)</Label>
                      <Input
                        {...register(`questions.${idx}.itemLabel` as const)}
                        placeholder="a"
                        className="rounded-lg h-9 text-xs"
                      />
                    </div>

                    {/* Question Type */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold">Question Type</Label>
                      <Controller
                        control={control}
                        name={`questions.${idx}.type` as const}
                        render={({ field: typeField }) => (
                          <Select value={typeField.value} onValueChange={typeField.onChange}>
                            <SelectTrigger className="rounded-lg h-9 text-xs font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="MCQ">MCQ (Multiple Choice)</SelectItem>
                              <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                              <SelectItem value="FILL_IN_THE_BLANKS">Fill in the Blanks</SelectItem>
                              <SelectItem value="INFORMATION_TRANSFER">Information Transfer</SelectItem>
                              <SelectItem value="FLOW_CHART">Flowchart</SelectItem>
                              <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                              <SelectItem value="MATCHING">Matching</SelectItem>
                              <SelectItem value="SUMMARY">Summary</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {/* Marks */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold">Marks</Label>
                      <Input
                        type="number"
                        step="0.5"
                        {...register(`questions.${idx}.marks` as const)}
                        className="rounded-lg h-9 text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Group Title (Optional) */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold">Group Heading / Instruction (Optional)</Label>
                    <Input
                      {...register(`questions.${idx}.groupTitle` as const)}
                      placeholder="e.g. 1. Choose the correct answer from the following alternatives:"
                      className="rounded-lg h-9 text-xs"
                    />
                  </div>

                  {/* Question Prompt */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold">Question Text *</Label>
                    <Input
                      {...register(`questions.${idx}.question` as const)}
                      placeholder="Enter the question text here..."
                      className="rounded-lg h-9 text-xs"
                    />
                    {errors.questions?.[idx]?.question && (
                      <p className="text-[11px] text-destructive">
                        {errors.questions[idx]?.question?.message}
                      </p>
                    )}
                  </div>

                  {/* MCQ Options (if MCQ) */}
                  {isMcq && (
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold">
                        Options (separated by comma or newline)
                      </Label>
                      <Input
                        {...register(`questions.${idx}.optionsText` as const)}
                        placeholder="Option 1, Option 2, Option 3, Option 4"
                        className="rounded-lg h-9 text-xs text-primary"
                      />
                    </div>
                  )}

                  {/* Answer & Explanation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-bold">
                          {isTrueFalse ? "Answer (True / False)" : "Correct Answer / Model Answer"}
                        </Label>
                        {isTrueFalse && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setValue(`questions.${idx}.answer`, "True")}
                              className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded font-bold border transition-colors cursor-pointer",
                                watch(`questions.${idx}.answer`) === "True"
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "border-border text-emerald-600 hover:bg-emerald-50"
                              )}
                            >
                              True
                            </button>
                            <button
                              type="button"
                              onClick={() => setValue(`questions.${idx}.answer`, "False. Correct Answer: ")}
                              className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded font-bold border transition-colors cursor-pointer",
                                watch(`questions.${idx}.answer`)?.startsWith("False")
                                  ? "bg-rose-600 text-white border-rose-600"
                                  : "border-border text-rose-600 hover:bg-rose-50"
                              )}
                            >
                              False
                            </button>
                          </div>
                        )}
                      </div>
                      <Input
                        {...register(`questions.${idx}.answer` as const)}
                        placeholder={isTrueFalse ? "True / False (If false, correct statement)" : "Expected answer or correct alternative"}
                        className="rounded-lg h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold">Explanation (Optional)</Label>
                      <Input
                        {...register(`questions.${idx}.explanation` as const)}
                        placeholder="Rationale or grammar explanation"
                        className="rounded-lg h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            <Button
              type="button"
              variant="outline"
              onClick={() => addQuestion()}
              className="w-full rounded-xl border-dashed h-10 text-xs font-bold gap-2 text-primary hover:bg-primary/5"
            >
              <Plus className="h-4 w-4" />
              Add Another Question
            </Button>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            asChild
            type="button"
            variant="outline"
            className="rounded-xl h-11 px-6 text-xs font-bold"
          >
            <Link href="/seen-comprehensions">Cancel</Link>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl h-11 px-8 text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-white shadow-md cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSubmitting ? "Updating..." : "Update Seen Comprehension"}
          </Button>
        </div>
      </form>
    </div>
  )
}

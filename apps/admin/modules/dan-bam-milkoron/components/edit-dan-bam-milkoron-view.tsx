"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useDanBamMilkoronById,
  useUpdateDanBamMilkoron,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-dan-bam-milkoron"
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
import { ChevronRightIcon, Plus, Trash2, ArrowRightLeft, Loader2 } from "lucide-react"
import { QUESTION_DIFFICULTY } from "@workspace/utils"
import { DAN_BAM_MILKORON_SOURCE_OPTIONS } from "../constants"
import { DanBamMilkoronGrid } from "./dan-bam-milkoron-table"

const editDanBamMilkoronFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  chapterId: z.string().min(1, "Please select a chapter"),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  referenceText: z.string().optional(),
  source: z.string().optional(),
  session: z.string().optional(),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Popularity count must be a number",
  }),
})

type EditDanBamMilkoronFormData = z.infer<typeof editDanBamMilkoronFormSchema>

interface EditDanBamMilkoronViewProps {
  id: string
}

export function EditDanBamMilkoronView({ id }: EditDanBamMilkoronViewProps) {
  const router = useRouter()
  const { data: item, isLoading, isError } = useDanBamMilkoronById(id)
  const updateMutation = useUpdateDanBamMilkoron()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 2-Column Rows State
  const [rows, setRows] = useState<Array<{ left: string; right: string }>>([
    { left: "", right: "" },
  ])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditDanBamMilkoronFormData>({
    resolver: zodResolver(editDanBamMilkoronFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      chapterId: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      referenceText: "",
      source: "",
      session: "",
      popularityCount: "0",
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

  useEffect(() => {
    if (item) {
      const subject = item.subject as any
      const classIdFromSubject = subject?.classSubjects?.[0]?.classId || ""

      reset({
        classId: classIdFromSubject,
        subjectId: item.subjectId,
        chapterId: item.academicChapterId || "",
        difficulty: (item.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
        referenceText: Array.isArray(item.reference) ? item.reference.join(", ") : "",
        source: item.source || "",
        session: item.session || "",
        popularityCount: String(item.popularityCount || 0),
      })

      const left = item.leftColumn || []
      const right = item.rightColumn || []
      const maxRows = Math.max(left.length, right.length, 1)
      const initialRows = Array.from({ length: maxRows }).map((_, idx) => ({
        left: left[idx] || "",
        right: right[idx] || "",
      }))
      setRows(initialRows)
    }
  }, [item, reset])

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const handleRowChange = (index: number, col: "left" | "right", val: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [col]: val } : row))
    )
  }

  const handleAddRow = () => {
    setRows([...rows, { left: "", right: "" }])
  }

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return
    setRows(rows.filter((_, i) => i !== index))
  }

  const leftColumn = rows.map((r) => r.left.trim()).filter(Boolean)
  const rightColumn = rows.map((r) => r.right.trim()).filter(Boolean)

  const onSubmit = async (data: EditDanBamMilkoronFormData) => {
    setErrorMessage(null)

    if (leftColumn.length === 0 || rightColumn.length === 0) {
      setErrorMessage("বাম পাশ এবং ডান পাশ উভয় কলামে অন্তত একটি করে আইটেম দিন")
      toast.error("বাম পাশ এবং ডান পাশ উভয় কলামে অন্তত একটি করে আইটেম দিন")
      return
    }

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
        leftColumn,
        rightColumn,
        difficulty: data.difficulty,
        reference: referenceArray,
        source: data.source || undefined,
        session: data.session || undefined,
        popularityCount: Number(data.popularityCount) || 0,
      })

      toast.success("ডান-বাম মিলকরণ সফলভাবে আপডেট করা হয়েছে")
      router.push("/dan-bam-milkoron")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "আপডেট করতে ব্যর্থ হয়েছে"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="rounded-xl border border-outline-variant/30 bg-surface p-8 text-center">
        <p className="text-sm font-medium text-error">ডান-বাম মিলকরণ তথ্য খুঁজে পাওয়া যায়নি</p>
        <Link href="/dan-bam-milkoron">
          <Button variant="outline" className="mt-4 border-outline-variant cursor-pointer">
            তালিকায় ফিরে যান
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
        <Link href="/dan-bam-milkoron" className="hover:text-primary transition-colors">
          ডান-বাম মিলকরণ
        </Link>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-on-surface font-semibold">সম্পাদনা</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="font-headline-sm text-2xl font-bold tracking-tight text-on-surface">
          ডান-বাম মিলকরণ সম্পাদনা করুন
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant">
          বাম এবং ডান কলামের তথ্য পরিবর্তন করে আপডেট করুন।
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-error/10 border border-error/20 p-4 text-sm text-error">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Taxonomy Section */}
        <Card className="rounded-xl border border-outline-variant/30 bg-surface shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-on-surface">
              একাডেমিক তথ্য (Academic Information)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Academic Class */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-on-surface">
                শ্রেণী (Class) <span className="text-error">*</span>
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
                    <SelectTrigger className="w-full bg-white border border-outline-variant">
                      <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
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
                <p className="text-xs text-error">{errors.classId.message}</p>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-on-surface">
                বিষয় (Subject) <span className="text-error">*</span>
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
                    <SelectTrigger className="w-full bg-white border border-outline-variant disabled:opacity-50">
                      <SelectValue
                        placeholder={
                          selectedClassId ? "বিষয় নির্বাচন করুন" : "প্রথমে শ্রেণী নির্বাচন করুন"
                        }
                      />
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
                <p className="text-xs text-error">{errors.subjectId.message}</p>
              )}
            </div>

            {/* Chapter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-on-surface">
                অধ্যায় (Chapter) <span className="text-error">*</span>
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
                    <SelectTrigger className="w-full bg-white border border-outline-variant disabled:opacity-50">
                      <SelectValue
                        placeholder={
                          selectedSubjectId ? "অধ্যায় নির্বাচন করুন" : "প্রথমে বিষয় নির্বাচন করুন"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
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
          </CardContent>
        </Card>

        {/* 2-Column Matching Inputs */}
        <Card className="rounded-xl border border-outline-variant/30 bg-surface shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
                <ArrowRightLeft className="size-4 text-primary" />
                মিলকরণ কলামসমূহ (Columns Data)
              </CardTitle>
              <p className="text-xs text-on-surface-variant mt-1">
                প্রতিটি সারির বাম ও ডান পাশের তথ্য লিখুন। LaTeX ম্যাথ লিখলে `$...$` ব্যবহার করতে পারেন।
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="flex items-center gap-1.5 h-8 text-xs font-semibold cursor-pointer border-outline-variant"
            >
              <Plus className="h-3.5 w-3.5" />
              সারি যোগ করুন
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-bold text-on-surface-variant px-1">
              <div className="col-span-5 sm:col-span-5">বাম পাশ (Left Column)</div>
              <div className="col-span-5 sm:col-span-6">ডান পাশ (Right Column)</div>
              <div className="col-span-2 sm:col-span-1 text-right">অ্যাকশন</div>
            </div>

            {rows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-center bg-surface-container-lowest/50 p-2 rounded-lg border border-outline-variant/20"
              >
                <div className="col-span-5 sm:col-span-5 flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-primary/70 shrink-0 select-none w-5">
                    ({index + 1})
                  </span>
                  <Input
                    placeholder={`বাম পাশের তথ্য ${index + 1}`}
                    value={row.left}
                    onChange={(e) => handleRowChange(index, "left", e.target.value)}
                    className="bg-white border-outline-variant h-9 text-xs"
                  />
                </div>
                <div className="col-span-5 sm:col-span-6 flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-secondary/70 shrink-0 select-none w-5">
                    ({String.fromCharCode(0x0995 + index)})
                  </span>
                  <Input
                    placeholder={`ডান পাশের তথ্য ${index + 1}`}
                    value={row.right}
                    onChange={(e) => handleRowChange(index, "right", e.target.value)}
                    className="bg-white border-outline-variant h-9 text-xs"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRow(index)}
                    disabled={rows.length <= 1}
                    className="h-8 w-8 text-outline hover:text-error hover:bg-error/10 disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Live Preview */}
            {(leftColumn.length > 0 || rightColumn.length > 0) && (
              <div className="mt-4 pt-3 border-t border-outline-variant/20">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  লাইভ প্রিভিউ (Live Preview):
                </span>
                <DanBamMilkoronGrid leftColumn={leftColumn} rightColumn={rightColumn} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card className="rounded-xl border border-outline-variant/30 bg-surface shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-on-surface">
              অতিরিক্ত তথ্য (Additional Details)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Difficulty */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-on-surface">
                কঠিনতার স্তর (Difficulty) <span className="text-error">*</span>
              </Label>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full bg-white border border-outline-variant">
                      <SelectValue />
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
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-on-surface">উৎস (Source)</Label>
              <Controller
                name="source"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full bg-white border border-outline-variant">
                      <SelectValue placeholder="উৎস নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {DAN_BAM_MILKORON_SOURCE_OPTIONS.map((opt) => (
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
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-on-surface">সেশন (Session)</Label>
              <Input
                {...register("session")}
                placeholder="যেমন: 2024"
                className="bg-white border border-outline-variant"
              />
            </div>

            {/* Reference */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-bold text-on-surface">
                রেফারেন্স (Reference - কমা দিয়ে আলাদা করুন)
              </Label>
              <Input
                {...register("referenceText")}
                placeholder="যেমন: ঢাকা বোর্ড ২০২৪, রাজশাহী বোর্ড ২০২৩"
                className="bg-white border border-outline-variant"
              />
            </div>

            {/* Popularity Count */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-on-surface">জনপ্রিয়তা (Popularity Count)</Label>
              <Input
                type="number"
                {...register("popularityCount")}
                placeholder="0"
                className="bg-white border border-outline-variant"
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/dan-bam-milkoron">
            <Button
              type="button"
              variant="outline"
              className="border-outline-variant cursor-pointer"
            >
              বাতিল
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white cursor-pointer px-6"
          >
            {isSubmitting ? "আপডেট হচ্ছে..." : "আপডেট করুন"}
          </Button>
        </div>
      </form>
    </div>
  )
}

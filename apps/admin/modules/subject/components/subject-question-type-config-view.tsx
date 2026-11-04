"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { PageHeader } from "@/components/shared/page-header"
import { toBengaliDigits } from "@workspace/utils"
import {
  Loader2,
  Save,
  HelpCircle,
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Layers,
  ListChecks,
  Award,
  BookOpen,
  Info,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { useSubjectById, useSaveSubjectStructure } from "../services/use-subject"
import { useQuestionTypesList } from "../../question-type/services/use-question-type"

// Schema matching the unified save structure endpoint
const questionTypeConfigSchema = z.object({
  questionTypeId: z.string().min(1, "প্রশ্ন ফরম্যাট নির্বাচন আবশ্যক"),
  customLabel: z.string().optional().nullable(),
  mark: z.coerce.number().min(0, "নম্বর ০ বা তার বেশি হতে হবে"),
  requiredCount: z.coerce.number().int().min(0, "আবশ্যক সংখ্যা ০ বা তার বেশি হতে হবে"),
  totalQuestions: z.coerce.number().int().min(0, "মোট প্রশ্ন সংখ্যা ০ বা তার বেশি হতে হবে"),
  renderMethod: z.coerce.number().int().default(1).optional(),
  position: z.number().int().optional(),
  markDistributionStr: z.string().optional(),
})

const subjectQuestionStructureSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string().optional(),
      nameEn: z.string().optional().nullable(),
      nameBn: z.string().optional().nullable(),
      position: z.number().int().default(0),
      instructions: z.string().optional().nullable(),
      subSections: z.array(
        z.object({
          id: z.string().optional(),
          nameEn: z.string().optional().nullable(),
          nameBn: z.string().optional().nullable(),
          position: z.number().int().default(0),
          instructions: z.string().optional().nullable(),
          questionTypes: z.array(questionTypeConfigSchema).default([]),
        })
      ).default([]),
      questionTypes: z.array(questionTypeConfigSchema).default([]),
    })
  ).default([]),
})

interface QuestionTypeConfig {
  questionTypeId: string
  customLabel?: string | null
  mark: number
  requiredCount: number
  totalQuestions: number
  renderMethod?: number
  markDistributionStr?: string
}

interface SubSectionConfig {
  id?: string
  nameEn: string
  nameBn: string
  position: number
  instructions?: string | null
  questionTypes: QuestionTypeConfig[]
}

interface SectionConfig {
  id?: string
  nameEn: string
  nameBn: string
  position: number
  instructions?: string | null
  subSections: SubSectionConfig[]
  questionTypes: QuestionTypeConfig[]
}

interface SubjectQuestionTypeConfigViewProps {
  subjectId: string
}

export function SubjectQuestionTypeConfigView({ subjectId }: SubjectQuestionTypeConfigViewProps) {
  const { data: subject, isLoading: isSubjectLoading, isError } = useSubjectById(subjectId)

  if (isSubjectLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-slate-500 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-sm font-medium">বিষয়ের প্রশ্ন কাঠামো সংক্রান্ত তথ্য লোড হচ্ছে...</span>
      </div>
    )
  }

  if (isError || !subject) {
    return (
      <div className="p-8 text-center text-rose-600 max-w-md mx-auto">
        <p className="font-medium text-sm">বিষয়ের তথ্য খুঁজে পাওয়া যায়নি।</p>
        <Link href="/subjects">
          <Button variant="outline" className="mt-4 rounded-xl border-slate-200">
            বিষয় তালিকায় ফিরে যান
          </Button>
        </Link>
      </div>
    )
  }

  return <SubjectQuestionStructureForm subject={subject} />
}

interface SubjectQuestionStructureFormProps {
  subject: any
}

function SubjectQuestionStructureForm({ subject }: SubjectQuestionStructureFormProps) {
  const router = useRouter()
  const saveMutation = useSaveSubjectStructure()
  const { data: qTypesData, isLoading: isQTypesLoading } = useQuestionTypesList({ limit: 100 })
  const questionTypesList = qTypesData?.questionTypes ?? []

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<any>({
    resolver: zodResolver(subjectQuestionStructureSchema),
    defaultValues: {
      sections: [],
    },
  })

  const { fields: sections, append: appendSection, remove: removeSection, move: moveSection } = useFieldArray({
    control,
    name: "sections",
  })

  const watchedSections = watch("sections") || []

  // Dynamic live statistics calculation
  const stats = useMemo(() => {
    let subSectionCount = 0
    let questionTypeCount = 0
    let totalMarks = 0

    watchedSections.forEach((sec: any) => {
      const directQts = sec.questionTypes || []
      questionTypeCount += directQts.length
      directQts.forEach((q: any) => {
        const mark = Number(q.mark) || 0
        const req = Number(q.requiredCount) || 0
        totalMarks += mark * (req > 0 ? req : 1)
      })

      const subs = sec.subSections || []
      subSectionCount += subs.length
      subs.forEach((sub: any) => {
        const subQts = sub.questionTypes || []
        questionTypeCount += subQts.length
        subQts.forEach((q: any) => {
          const mark = Number(q.mark) || 0
          const req = Number(q.requiredCount) || 0
          totalMarks += mark * (req > 0 ? req : 1)
        })
      })
    })

    return {
      sectionCount: watchedSections.length,
      subSectionCount,
      questionTypeCount,
      totalMarks,
    }
  }, [watchedSections])

  // Synchronize system DB structure with form default values
  useEffect(() => {
    if (subject) {
      const initialSections = subject.sections?.map((sec: any) => {
        const directQuestionTypes = (subject.subjectQuestionTypes?.filter(
          (sqt: any) => sqt.sectionId === sec.id && !sqt.subSectionId
        ) || []).sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))

        return {
          id: sec.id,
          nameEn: sec.nameEn || "",
          nameBn: sec.nameBn || "",
          position: sec.position ?? 0,
          instructions: sec.instructions ?? "",
          subSections: sec.subSections?.map((sub: any) => {
            const subQuestionTypes = (subject.subjectQuestionTypes?.filter(
              (sqt: any) => sqt.subSectionId === sub.id
            ) || []).sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))

            return {
              id: sub.id,
              nameEn: sub.nameEn || "",
              nameBn: sub.nameBn || "",
              position: sub.position ?? 0,
              instructions: sub.instructions ?? "",
              questionTypes: subQuestionTypes.map((sqt: any, qtIdx: number) => {
                let markDistributionStr = ""
                if (sqt.markDistribution) {
                  try {
                    const dist = typeof sqt.markDistribution === "string"
                      ? JSON.parse(sqt.markDistribution)
                      : sqt.markDistribution
                    if (dist && typeof dist === "object") {
                      const sortedValues = Object.keys(dist)
                        .sort()
                        .map((k) => dist[k])
                      markDistributionStr = sortedValues.join(", ")
                    }
                  } catch (e) {
                    console.error("Failed to parse markDistribution", e)
                  }
                }
                return {
                  questionTypeId: sqt.questionTypeId,
                  customLabel: sqt.customLabel ?? "",
                  mark: sqt.mark,
                  requiredCount: sqt.requiredCount,
                  totalQuestions: sqt.totalQuestions,
                  renderMethod: sqt.renderMethod ?? 1,
                  position: typeof sqt.position === "number" ? sqt.position : qtIdx,
                  markDistributionStr,
                }
              }),
            }
          }) || [],
          questionTypes: directQuestionTypes.map((sqt: any, qtIdx: number) => {
            let markDistributionStr = ""
            if (sqt.markDistribution) {
              try {
                const dist = typeof sqt.markDistribution === "string"
                  ? JSON.parse(sqt.markDistribution)
                  : sqt.markDistribution
                if (dist && typeof dist === "object") {
                  const sortedValues = Object.keys(dist)
                    .sort()
                    .map((k) => dist[k])
                  markDistributionStr = sortedValues.join(", ")
                }
              } catch (e) {
                console.error("Failed to parse markDistribution", e)
              }
            }
            return {
              questionTypeId: sqt.questionTypeId,
              customLabel: sqt.customLabel ?? "",
              mark: sqt.mark,
              requiredCount: sqt.requiredCount,
              totalQuestions: sqt.totalQuestions,
              renderMethod: sqt.renderMethod ?? 1,
              position: typeof sqt.position === "number" ? sqt.position : qtIdx,
              markDistributionStr,
            }
          }),
        }
      }) || []

      reset({ sections: initialSections })
    }
  }, [subject, reset])

  // Log validation errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.error("Validation Errors Details:", errors)
      toast.error("সবগুলো প্রশ্ন ফরম্যাটের তথ্য সঠিকভাবে পূরণ করুন।")
    }
  }, [errors])

  const onSubmit = async (data: any) => {
    try {
      const processedSections = data.sections.map((sec: SectionConfig, secIdx: number) => {
        const processQtConfigs = (qts: QuestionTypeConfig[], path: string) => {
          return qts.map((c: QuestionTypeConfig, qtIdx: number) => {
            let markDistribution: Record<string, number> | null = null
            if (c.markDistributionStr && c.markDistributionStr.trim()) {
              const parts = c.markDistributionStr
                .split(",")
                .map((p: string) => parseFloat(p.trim()))
                .filter((p: number) => !isNaN(p))

              if (parts.length > 0) {
                const sum = parts.reduce((a: number, b: number) => a + b, 0)
                if (Math.abs(sum - c.mark) > 0.01) {
                  const typeName = questionTypesList.find((t) => t.id === c.questionTypeId)?.nameEn || "Question Type"
                  throw new Error(
                    `${path}-এ "${typeName}"-এর নম্বর বিভাজনের সমষ্টি (${sum}) মোট নম্বর (${c.mark})-এর সমান হতে হবে।`
                  )
                }

                markDistribution = {}
                const keys = ["a", "b", "c", "d", "e", "f", "g"]
                parts.forEach((val: number, idx: number) => {
                  const key = keys[idx]
                  if (key) {
                    markDistribution![key] = val
                  }
                })
              }
            }

            return {
              questionTypeId: c.questionTypeId,
              customLabel: c.customLabel?.trim() || null,
              mark: c.mark,
              requiredCount: c.requiredCount,
              totalQuestions: c.totalQuestions,
              renderMethod: c.renderMethod ?? 1,
              position: qtIdx,
              markDistribution,
            }
          })
        }

        return {
          nameEn: sec.nameEn,
          nameBn: sec.nameBn,
          position: secIdx,
          instructions: sec.instructions || null,
          questionTypes: processQtConfigs(sec.questionTypes || [], `বিভাগ "${sec.nameBn || sec.nameEn}"`),
          subSections: (sec.subSections || []).map((sub: SubSectionConfig, subIdx: number) => ({
            nameEn: sub.nameEn,
            nameBn: sub.nameBn,
            position: subIdx,
            instructions: sub.instructions || null,
            questionTypes: processQtConfigs(
              sub.questionTypes || [],
              `বিভাগ "${sec.nameBn || sec.nameEn}" > উপ-বিভাগ "${sub.nameBn || sub.nameEn}"`
            ),
          })),
        }
      })

      await saveMutation.mutateAsync({
        subjectId: subject.id,
        sections: processedSections,
      })

      toast.success("বিষয়ের প্রশ্ন কাঠামো সফলভাবে সংরক্ষণ করা হয়েছে।")
      router.push("/subjects")
    } catch (err: any) {
      toast.error(err.message || "প্রশ্ন কাঠামো রূপরেখা সংরক্ষণ করতে ব্যর্থ হয়েছে।")
    }
  }

  if (isQTypesLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-slate-500 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-sm font-medium">প্রশ্ন ফরম্যাটের তালিকা লোড হচ্ছে...</span>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-16">
      {/* Shared Page Header matching MCQ standard */}
      <PageHeader
        title={`প্রশ্ন কাঠামো রূপরেখা: ${subject.nameBn || subject.nameEn}`}
        description="পরীক্ষার বিভাগ (Sections), সাব-সেকশন এবং প্রশ্ন প্রকারভেদের নম্বর ও প্রশ্ন সংখ্যার বিন্যাস নির্ধারণ করুন।"
        icon={HelpCircle}
        badge={{ label: "প্রশ্ন কাঠামো", variant: "indigo" }}
        breadcrumbs={[
          { label: "বিষয় তালিকা", href: "/subjects" },
          { label: "প্রশ্ন কাঠামো রূপরেখা" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Link href="/subjects" prefetch={true}>
            <ArrowLeft className="w-4 h-4" />
            <span>তালিকায় ফিরে যান</span>
          </Link>
        </Button>
      </PageHeader>

      {/* Dynamic Live KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/40 shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">মোট বিভাগ</p>
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {toBengaliDigits(stats.sectionCount)} টি
            </h4>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-100/80 dark:border-purple-900/40 shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">উপ-বিভাগ</p>
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {toBengaliDigits(stats.subSectionCount)} টি
            </h4>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-900/40 shrink-0">
            <ListChecks className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">প্রশ্ন ফরম্যাট</p>
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {toBengaliDigits(stats.questionTypeCount)} টি
            </h4>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100/80 dark:border-amber-900/40 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">হিসাবকৃত পূর্ণমান</p>
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {toBengaliDigits(stats.totalMarks)} নম্বর
            </h4>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 p-5 sm:p-6 flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                পরীক্ষার বিভাগ ও প্রশ্ন বিন্যাস বিল্ডার
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                বিভাগের ক্রমানুসার নির্ধারণ করুন এবং প্রশ্ন প্রকারভেদসমূহ সংজ্ঞায়িত করুন।
              </p>
            </div>
            <Button
              type="button"
              onClick={() =>
                appendSection({
                  nameEn: "",
                  nameBn: "",
                  position: sections.length,
                  subSections: [],
                  questionTypes: [],
                  instructions: "",
                })
              }
              className="flex items-center gap-1.5 text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-xs shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>নতুন বিভাগ যোগ করুন</span>
            </Button>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-6 bg-slate-50/20 dark:bg-slate-950/20">
            {sections.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-8 space-y-3">
                <div className="size-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900/40">
                  <Layers className="h-7 w-7" />
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  এখনও কোনো বিভাগ তৈরি করা হয়নি
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  পরীক্ষার প্রশ্ন বিন্যাসের জন্য ক-বিভাগ, খ-বিভাগ ইত্যাদি কাঠামো যুক্ত করুন।
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendSection({
                      nameEn: "",
                      nameBn: "",
                      position: 0,
                      subSections: [],
                      questionTypes: [],
                    })
                  }
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                  প্রথম বিভাগ তৈরি করুন
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {sections.map((sectionField, secIndex) => (
                  <SectionCard
                    key={sectionField.id}
                    control={control}
                    secIndex={secIndex}
                    totalSections={sections.length}
                    moveSection={moveSection}
                    removeSection={removeSection}
                    questionTypesList={questionTypesList}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons matching standard MCQ footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/70 dark:border-slate-800">
          <Button
            asChild
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="h-10 px-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm cursor-pointer shadow-xs"
          >
            <Link href="/subjects">বাতিল</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-indigo-200 dark:shadow-none gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>কাঠামো সংরক্ষণ করুন</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   SECTION CARD COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
interface SectionCardProps {
  control: any
  secIndex: number
  totalSections: number
  moveSection: (from: number, to: number) => void
  removeSection: (index: number) => void
  questionTypesList: any[]
}

function SectionCard({
  control,
  secIndex,
  totalSections,
  moveSection,
  removeSection,
  questionTypesList,
}: SectionCardProps) {
  const {
    fields: subSections,
    append: appendSubSection,
    remove: removeSubSection,
  } = useFieldArray({
    control,
    name: `sections.${secIndex}.subSections`,
  })

  const {
    fields: directQuestionTypes,
    append: appendDirectQt,
    remove: removeDirectQt,
    move: moveDirectQt,
  } = useFieldArray({
    control,
    name: `sections.${secIndex}.questionTypes`,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = directQuestionTypes.findIndex((item) => item.id === active.id)
      const newIndex = directQuestionTypes.findIndex((item) => item.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        moveDirectQt(oldIndex, newIndex)
      }
    }
  }

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/40 p-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Order switch buttons */}
          <div className="flex flex-col gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={secIndex === 0}
              onClick={() => moveSection(secIndex, secIndex - 1)}
              className="h-6 w-6 text-slate-500 hover:text-indigo-600 disabled:opacity-20 rounded-md"
              title="উপরে নিন"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={secIndex === totalSections - 1}
              onClick={() => moveSection(secIndex, secIndex + 1)}
              className="h-6 w-6 text-slate-500 hover:text-indigo-600 disabled:opacity-20 rounded-md"
              title="নিচে নিন"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Badge className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/50 text-xs font-bold rounded-lg px-2.5 py-1 shrink-0">
            বিভাগ #{toBengaliDigits(secIndex + 1)}
          </Badge>

          <div className="grid grid-cols-2 gap-2 flex-1 sm:w-80">
            <div>
              <Label className="text-[10px] text-slate-500 font-semibold uppercase">বিভাগ নাম (EN)</Label>
              <Controller
                control={control}
                name={`sections.${secIndex}.nameEn`}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="e.g. Section A"
                    className="h-8 px-3 text-xs bg-white dark:bg-slate-950 rounded-lg border-slate-200 dark:border-slate-800"
                  />
                )}
              />
            </div>
            <div>
              <Label className="text-[10px] text-slate-500 font-semibold uppercase">বিভাগ নাম (বাংলা)</Label>
              <Controller
                control={control}
                name={`sections.${secIndex}.nameBn`}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="যেমন: ক বিভাগ"
                    className="h-8 px-3 text-xs bg-white dark:bg-slate-950 rounded-lg border-slate-200 dark:border-slate-800"
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              appendSubSection({
                nameEn: "",
                nameBn: "",
                position: subSections.length,
                instructions: "",
                questionTypes: [],
              })
            }
            className="flex items-center gap-1 text-xs h-8 border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>উপ-বিভাগ যোগ</span>
          </Button>

          {subSections.length === 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendDirectQt({
                  questionTypeId: "",
                  customLabel: "",
                  mark: 0,
                  requiredCount: 0,
                  totalQuestions: 0,
                  renderMethod: 1,
                  markDistributionStr: "",
                })
              }
              className="flex items-center gap-1 text-xs h-8 border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg font-medium"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>প্রশ্ন ফরম্যাট যোগ</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeSection(secIndex)}
            className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 rounded-lg"
            title="বিভাগ মুছে ফেলুন"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Section Instructions */}
        <div className="space-y-1">
          <Label className="text-[10px] text-slate-500 font-semibold uppercase">
            বিভাগের সাধারণ নির্দেশনা (ঐচ্ছিক)
          </Label>
          <Controller
            control={control}
            name={`sections.${secIndex}.instructions`}
            render={({ field }) => (
              <Textarea
                {...field}
                value={field.value ?? ""}
                placeholder="যেমন: এই বিভাগ থেকে যেকোনো ৫টি প্রশ্নের উত্তর দাও..."
                className="h-16 px-3.5 py-2.5 text-xs bg-white dark:bg-slate-950 rounded-xl border-slate-200 dark:border-slate-800 min-h-[56px]"
              />
            )}
          />
        </div>

        {/* Render nested Sub-sections if any exist */}
        {subSections.length > 0 && (
          <div className="space-y-4 pl-3 sm:pl-4 border-l-2 border-indigo-200 dark:border-indigo-900/60">
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
              উপ-বিভাগসমূহ (Sub-sections)
            </h4>
            {subSections.map((subField, subIndex) => (
              <SubSectionCard
                key={subField.id}
                control={control}
                secIndex={secIndex}
                subIndex={subIndex}
                removeSubSection={removeSubSection}
                questionTypesList={questionTypesList}
              />
            ))}
          </div>
        )}

        {/* Render Direct Question Types (only when no subsections exist) */}
        {subSections.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                প্রশ্ন ফরম্যাটসমূহ
              </h4>
              {directQuestionTypes.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    appendDirectQt({
                      questionTypeId: "",
                      customLabel: "",
                      mark: 0,
                      requiredCount: 0,
                      totalQuestions: 0,
                      markDistributionStr: "",
                    })
                  }
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 h-7 px-2.5 rounded-lg"
                >
                  + ফরম্যাট যোগ
                </Button>
              )}
            </div>

            {directQuestionTypes.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-950/20">
                <p className="text-xs text-slate-500">
                  এখনও কোনো প্রশ্ন ফরম্যাট যোগ করা হয়নি। উপরের বোতামে ক্লিক করে ফরম্যাট যোগ করুন।
                </p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={directQuestionTypes.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2.5">
                    {directQuestionTypes.map((qtField, qtIndex) => (
                      <QuestionTypeRow
                        key={qtField.id}
                        id={qtField.id}
                        index={qtIndex}
                        control={control}
                        namePrefix={`sections.${secIndex}.questionTypes.${qtIndex}`}
                        removeRow={() => removeDirectQt(qtIndex)}
                        questionTypesList={questionTypesList}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   SUB-SECTION CARD COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
interface SubSectionCardProps {
  control: any
  secIndex: number
  subIndex: number
  removeSubSection: (index: number) => void
  questionTypesList: any[]
}

function SubSectionCard({
  control,
  secIndex,
  subIndex,
  removeSubSection,
  questionTypesList,
}: SubSectionCardProps) {
  const {
    fields: subQtFields,
    append: appendSubQt,
    remove: removeSubQt,
    move: moveSubQt,
  } = useFieldArray({
    control,
    name: `sections.${secIndex}.subSections.${subIndex}.questionTypes`,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = subQtFields.findIndex((item) => item.id === active.id)
      const newIndex = subQtFields.findIndex((item) => item.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        moveSubQt(oldIndex, newIndex)
      }
    }
  }

  return (
    <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/10 p-3.5 sm:p-4 space-y-3">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-100/60 dark:border-indigo-900/30 pb-2.5">
        <div className="grid grid-cols-2 gap-2 flex-1 w-full sm:max-w-md">
          <div>
            <Label className="text-[9px] text-slate-500 font-semibold uppercase">উপ-বিভাগ নাম (EN)</Label>
            <Controller
              control={control}
              name={`sections.${secIndex}.subSections.${subIndex}.nameEn`}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="e.g. Arithmetic"
                  className="h-8 px-3 text-xs bg-white dark:bg-slate-950 rounded-lg border-slate-200 dark:border-slate-800"
                />
              )}
            />
          </div>
          <div>
            <Label className="text-[9px] text-slate-500 font-semibold uppercase">উপ-বিভাগ নাম (বাংলা)</Label>
            <Controller
              control={control}
              name={`sections.${secIndex}.subSections.${subIndex}.nameBn`}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="যেমন: পাটিগণিত"
                  className="h-8 px-3 text-xs bg-white dark:bg-slate-950 rounded-lg border-slate-200 dark:border-slate-800"
                />
              )}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              appendSubQt({
                questionTypeId: "",
                customLabel: "",
                mark: 0,
                requiredCount: 0,
                totalQuestions: 0,
                renderMethod: 1,
                markDistributionStr: "",
              })
            }
            className="flex items-center gap-1 text-xs h-7 border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-900 bg-white/70 dark:bg-slate-950 rounded-lg font-medium"
          >
            <Plus className="h-3 w-3" />
            <span>ফরম্যাট যোগ</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeSubSection(subIndex)}
            className="h-7 w-7 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 rounded-lg"
            title="উপ-বিভাগ মুছে ফেলুন"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Sub-section Instructions */}
      <div className="space-y-1">
        <Label className="text-[9px] text-slate-500 font-semibold uppercase">উপ-বিভাগের নির্দেশনা (ঐচ্ছিক)</Label>
        <Controller
          control={control}
          name={`sections.${secIndex}.subSections.${subIndex}.instructions`}
          render={({ field }) => (
            <Textarea
              {...field}
              value={field.value ?? ""}
              placeholder="যেমন: এই অংশ থেকে যেকোনো ৩টি প্রশ্নের উত্তর দিন..."
              className="h-12 px-3.5 py-2 text-xs bg-white dark:bg-slate-950 rounded-lg border-slate-200 dark:border-slate-800 min-h-[48px]"
            />
          )}
        />
      </div>

      {/* Nested Question Types inside Subsection */}
      {subQtFields.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-indigo-200/60 dark:border-indigo-900/40 rounded-lg bg-white/50 dark:bg-slate-900/50">
          <p className="text-[11px] text-slate-500">এই উপ-বিভাগে কোনো প্রশ্ন ফরম্যাট যুক্ত করা হয়নি।</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={subQtFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {subQtFields.map((qtField, qtIndex) => (
                <QuestionTypeRow
                  key={qtField.id}
                  id={qtField.id}
                  index={qtIndex}
                  control={control}
                  namePrefix={`sections.${secIndex}.subSections.${subIndex}.questionTypes.${qtIndex}`}
                  removeRow={() => removeSubQt(qtIndex)}
                  questionTypesList={questionTypesList}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   QUESTION TYPE SPECIFICATION ROW
   ────────────────────────────────────────────────────────────────────────── */
interface QuestionTypeRowProps {
  id: string
  index: number
  control: any
  namePrefix: string
  removeRow: () => void
  questionTypesList: any[]
}

function QuestionTypeRow({
  id,
  index,
  control,
  namePrefix,
  removeRow,
  questionTypesList,
}: QuestionTypeRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-wrap lg:flex-nowrap items-end gap-2.5 sm:gap-3 bg-white dark:bg-slate-950 p-3 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative transition-all ${
        isDragging
          ? "shadow-lg border-indigo-500 ring-2 ring-indigo-500/20"
          : "hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      {/* Drag handle and Serial */}
      <div className="flex items-center gap-1.5 self-center lg:self-end pb-1.5 shrink-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          title="ড্র্যাগ করে ক্রম পরিবর্তন করুন"
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 touch-none p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="flex size-6 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-100/70 dark:border-indigo-900/40">
          {toBengaliDigits(index + 1)}
        </span>
      </div>

      {/* Question Type Selection */}
      <div className="w-full sm:flex-1 min-w-[140px] space-y-1">
        <Label className="text-[10px] text-slate-500 font-semibold uppercase">প্রশ্ন ফরম্যাট</Label>
        <Controller
          control={control}
          name={`${namePrefix}.questionTypeId`}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <SelectValue placeholder="ফরম্যাট বাছাই করুন" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl">
                {questionTypesList.map((qt) => (
                  <SelectItem key={qt.id} value={qt.id} className="text-xs">
                    {qt.nameBn || qt.nameEn} ({qt.nameEn})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Custom Label Override */}
      <div className="w-full sm:flex-1 min-w-[130px] space-y-1">
        <Label className="text-[10px] text-slate-500 font-semibold uppercase">কাস্টম লেবেল (ঐচ্ছিক)</Label>
        <Controller
          control={control}
          name={`${namePrefix}.customLabel`}
          render={({ field }) => (
            <Input
              type="text"
              placeholder="যেমন: অনুচ্ছেদ / ক-অংশ"
              value={field.value ?? ""}
              onChange={field.onChange}
              className="h-9 px-3 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            />
          )}
        />
      </div>

      {/* Question Mark */}
      <div className="w-[85px] shrink-0 space-y-1">
        <Label className="text-[10px] text-slate-500 font-semibold uppercase">প্রতিটির মান</Label>
        <Controller
          control={control}
          name={`${namePrefix}.mark`}
          render={({ field }) => (
            <Input
              type="number"
              step="any"
              placeholder="0"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
              className="h-9 px-2.5 text-center text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            />
          )}
        />
      </div>

      {/* Mark Distribution */}
      <div className="w-full sm:flex-1 min-w-[110px] space-y-1">
        <Label className="text-[10px] text-slate-500 font-semibold uppercase" title="কমা দিয়ে ভাগ করুন: যেমন ২, ৪, ৪">
          নম্বর বিভাজন (ঐচ্ছিক)
        </Label>
        <Controller
          control={control}
          name={`${namePrefix}.markDistributionStr`}
          render={({ field }) => (
            <Input
              type="text"
              placeholder="যেমন: 2, 4, 4"
              value={field.value ?? ""}
              onChange={field.onChange}
              className="h-9 px-3 text-center text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono"
            />
          )}
        />
      </div>

      {/* Required Count */}
      <div className="w-[80px] shrink-0 space-y-1">
        <Label className="text-[10px] text-slate-500 font-semibold uppercase">উত্তর দিতে হবে</Label>
        <Controller
          control={control}
          name={`${namePrefix}.requiredCount`}
          render={({ field }) => (
            <Input
              type="number"
              placeholder="0"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
              className="h-9 px-2 text-center text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            />
          )}
        />
      </div>

      {/* Total Questions */}
      <div className="w-[80px] shrink-0 space-y-1">
        <Label className="text-[10px] text-slate-500 font-semibold uppercase">মোট প্রশ্ন থাকবে</Label>
        <Controller
          control={control}
          name={`${namePrefix}.totalQuestions`}
          render={({ field }) => (
            <Input
              type="number"
              placeholder="0"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
              className="h-9 px-2 text-center text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            />
          )}
        />
      </div>

      {/* Render Style */}
      <div className="w-[125px] shrink-0 space-y-1">
        <Label className="text-[10px] text-slate-500 font-semibold uppercase">ডিসপ্লে স্টাইল</Label>
        <Controller
          control={control}
          name={`${namePrefix}.renderMethod`}
          render={({ field }) => (
            <Select
              onValueChange={(val) => field.onChange(parseInt(val, 10))}
              value={field.value !== undefined && field.value !== null ? field.value.toString() : "1"}
            >
              <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <SelectValue placeholder="স্টাইল" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl">
                <SelectItem value="1" className="text-xs">
                  ১: সাধারণ শিরোনাম
                </SelectItem>
                <SelectItem value="2" className="text-xs">
                  ২: বিকল্প তালিকা
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Delete Row Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={removeRow}
        className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl shrink-0"
        title="ফরম্যাট মুছে ফেলুন"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

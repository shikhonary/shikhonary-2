"use client"

import { useState, useEffect, Fragment } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useQuestionPaperById,
  useUpdateQuestionPaper,
  useAddQuestion,
  useRemoveQuestion,
  useUpsertSubject,
  useDeleteSubject,
  useUpsertDistribution,
  useDeleteDistribution,
} from "../services/use-question-paper"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Badge } from "@workspace/ui/components/badge"
import { trpc } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import {
  Plus,
  Trash,
  ArrowLeft,
  Loader2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Info,
  Pen,
  Check,
  ArrowRight,
  BookOpen,
  ListTodo,
  Save,
  Sparkles
} from "lucide-react"

import type { WizardData, WizardSubject, WizardDistribution } from "../types/create-wizard"
import { StepBasicInfo } from "./steps/step-basic-info"
import { StepSubjectsDistribution } from "./steps/step-subjects-distribution"
import { StepReview } from "./steps/step-review"

export function formatDurationBn(minutes: number): string {
  if (!minutes) return "০ মিনিট"
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  const toBnNums = (num: number): string => {
    const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
    return String(num)
      .split("")
      .map((digit) => bnDigits[parseInt(digit, 10)] || digit)
      .join("")
  }

  if (hours > 0 && mins > 0) {
    return `${toBnNums(hours)} ঘণ্টা ${toBnNums(mins)} মিনিট`
  } else if (hours > 0) {
    return `${toBnNums(hours)} ঘণ্টা`
  } else {
    return `${toBnNums(mins)} মিনিট`
  }
}

const EDIT_WIZARD_STEPS = [
  { id: "basic", label: "প্রাথমিক তথ্য" },
  { id: "subjects", label: "বিষয় ও নম্বর" },
  { id: "review", label: "পর্যালোচনা" },
] as const

interface EditQuestionPaperViewProps {
  id: string
}

export function EditQuestionPaperView({ id }: EditQuestionPaperViewProps) {
  const router = useRouter()
  // Current Step state
  const [currentStep, setCurrentStep] = useState(0)

  // Queries
  const { data: paper, isLoading: isPaperLoading, isError: isPaperError } = useQuestionPaperById(id)

  // Fetch classes
  const { data: classesData, isLoading: isClassesLoading } = useQuery({
    ...trpc.academicClass.list.queryOptions({ limit: 100 }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const classes = (classesData?.academicClasses ?? []) as Array<{ id: string; nameBn: string; nameEn: string }>
  
  // Fetch global subjects
  const { data: subjectsData, isLoading: isSubjectsLoading } = useQuery({
    ...trpc.academicSubject.list.queryOptions({ limit: 100 }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const subjects = (subjectsData?.academicSubjects ?? []) as Array<{ id: string; nameBn: string; nameEn: string }>

  const { data: typesData, isLoading: isTypesLoading } = useQuery({
    ...trpc.questionType.list.queryOptions({ limit: 100 }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const questionTypes = typesData?.questionTypes ?? []

  // Mutations
  const updatePaperMutation = useUpdateQuestionPaper()
  const upsertSubjectMutation = useUpsertSubject()
  const deleteSubjectMutation = useDeleteSubject()
  const upsertDistMutation = useUpsertDistribution()
  const deleteDistMutation = useDeleteDistribution()

  // State
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Local WizardData state
  const [wizardData, setWizardData] = useState<WizardData>({
    examName: "",
    classId: "",
    className: "",
    timeInMinutes: 0,
    isTemplate: false,
    subjects: [],
  })

  // Initialize fields once when paper loads
  useEffect(() => {
    if (paper) {
      setWizardData({
        examName: paper.examName,
        classId: paper.classId,
        className: paper.className,
        timeInMinutes: paper.timeInMinutes,
        isTemplate: paper.isTemplate,
        subjects: paper.subjects.map((s: any) => ({
          tempId: s.id,
          subjectId: s.subjectId,
          subjectName: s.subjectName,
          distributions: s.distributions.map((d: any) => ({
            tempId: d.id,
            questionTypeId: d.questionTypeId,
            questionTypeName: d.questionTypeName,
            marksPerQuestion: d.marksPerQuestion,
            questionCount: d.questionCount,
            questionsToAttempt: d.questionsToAttempt,
            orderIndex: d.orderIndex,
          })),
        })),
      })
    }
  }, [paper])

  const handleChange = (updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }))
  }



  if (isPaperLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center font-display">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> লোড হচ্ছে...
      </div>
    )
  }

  if (isPaperError || !paper) {
    return (
      <div className="p-8 text-center text-red-500 font-display">
        <p className="font-bold">প্রশ্নপত্র তথ্য লোড করতে ব্যর্থ হয়েছে।</p>
      </div>
    )
  }

  // Validation functions
  const validateStep = (stepIdx: number): Record<string, string> => {
    const e: Record<string, string> = {}
    if (stepIdx === 0) {
      if (!wizardData.examName.trim()) e.examName = "পরীক্ষার নাম আবশ্যক"
      if (!wizardData.classId) e.classId = "শ্রেণী নির্বাচন আবশ্যক"
      if (wizardData.timeInMinutes <= 0) e.timeInMinutes = "পরীক্ষার সময় অবশ্যই ০ থেকে বেশি হতে হবে"
    } else if (stepIdx === 1) {
      if (wizardData.subjects.length === 0) {
        e.subjects = "কমপক্ষে একটি বিষয় যোগ করতে হবে"
      } else {
        // Validate each subject has at least one distribution
        for (const sub of wizardData.subjects) {
          if (sub.distributions.length === 0) {
            e.subjects = `"${sub.subjectName}" বিষয়ে কোনো নম্বর বণ্টন যোগ করা হয়নি`
            break
          }
        }
      }
    }
    return e
  }

  // Save Basic Info
  const handleSaveBasicInfo = async () => {
    const stepErrors = validateStep(0)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      toast.error("কিছু তথ্য সঠিক নয়। অনুগ্রহ করে পরীক্ষা করুন।")
      return false
    }

    try {
      const selectedClass = classes.find((c: any) => c.id === wizardData.classId)
      const className = selectedClass ? (selectedClass.nameBn || selectedClass.nameEn) : ""
      const dynamicTitle = `${className} - ${wizardData.examName} প্রশ্নপত্র`

      await updatePaperMutation.mutateAsync({
        id: paper.id,
        title: dynamicTitle,
        examName: wizardData.examName,
        classId: wizardData.classId,
        className,
        isTemplate: wizardData.isTemplate,
        timeInMinutes: wizardData.timeInMinutes,
      })
      toast.success("প্রাথমিক তথ্য সফলভাবে সংরক্ষণ করা হয়েছে।")
      return true
    } catch (err: any) {
      toast.error(err.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে")
      return false
    }
  }

  // Sync subjects & distributions to the database when leaving step 2
  const handleSaveSubjects = async () => {
    const stepErrors = validateStep(1)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      toast.error(stepErrors.subjects || "নম্বর বণ্টন সঠিকভাবে সম্পন্ন করুন।")
      return false
    }

    try {
      const dbSubjects = paper.subjects ?? []

      // 1. Delete subjects that are no longer in wizardData
      const currentSubjectIds = new Set(wizardData.subjects.map(s => s.subjectId))
      for (const dbSub of dbSubjects) {
        if (!currentSubjectIds.has(dbSub.subjectId)) {
          await deleteSubjectMutation.mutateAsync({ questionPaperId: paper.id, id: dbSub.id })
        }
      }

      // 2. Add or update subjects and their distributions
      for (let i = 0; i < wizardData.subjects.length; i++) {
        const localSub = wizardData.subjects[i]!
        let dbSub = dbSubjects.find((s: any) => s.subjectId === localSub.subjectId)

        const created = await upsertSubjectMutation.mutateAsync({
          id: dbSub?.id,
          questionPaperId: paper.id,
          subjectId: localSub.subjectId,
          subjectName: localSub.subjectName,
          orderIndex: i,
        })
        const paperSubjectId = created.id

        if (!paperSubjectId) continue

        const dbDists = dbSub?.distributions ?? []
        const localDistIds = new Set(localSub.distributions.map((d: any) => d.questionTypeId))

        // Delete distributions no longer in local config
        for (const dbDist of dbDists) {
          if (!localDistIds.has(dbDist.questionTypeId)) {
            await deleteDistMutation.mutateAsync({ questionPaperId: paper.id, id: dbDist.id })
          }
        }

        // Add or update distributions
        for (const localDist of localSub.distributions) {
          const dbDist = dbDists.find((d: any) => d.questionTypeId === localDist.questionTypeId)
          await upsertDistMutation.mutateAsync({
            id: dbDist?.id,
            paperSubjectId,
            questionTypeId: localDist.questionTypeId,
            questionTypeName: localDist.questionTypeName,
            marksPerQuestion: localDist.marksPerQuestion,
            questionCount: localDist.questionCount,
            questionsToAttempt: localDist.questionsToAttempt,
            orderIndex: localDist.orderIndex,
          })
        }
      }

      toast.success("বিষয় ও নম্বর বণ্টন সফলভাবে সংরক্ষণ করা হয়েছে।")
      return true
    } catch (err: any) {
      toast.error(err.message || "নম্বর বণ্টন সংরক্ষণ করতে ব্যর্থ হয়েছে")
      return false
    }
  }

  const handleNext = async () => {
    if (currentStep === 0) {
      const success = await handleSaveBasicInfo()
      if (!success) return
    } else if (currentStep === 1) {
      const success = await handleSaveSubjects()
      if (!success) return
    }
    if (currentStep < EDIT_WIZARD_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleStepClick = async (stepNum: number) => {
    if (stepNum < currentStep) {
      setCurrentStep(stepNum)
      return
    }

    if (currentStep === 0) {
      const success = await handleSaveBasicInfo()
      if (!success) return
    }

    if (stepNum > 1 && currentStep === 1) {
      const success = await handleSaveSubjects()
      if (!success) return
    }

    setCurrentStep(stepNum)
  }

  // Publish / Save Toggle
  const handlePublishToggle = async () => {
    const nextStatus = paper.status === "Published" ? "Draft" : "Published"
    try {
      await updatePaperMutation.mutateAsync({
        id: paper.id,
        status: nextStatus,
      })
      toast.success(nextStatus === "Published" ? "প্রশ্নপত্র সফলভাবে প্রকাশিত হয়েছে।" : "প্রশ্নপত্র ড্রাফট মুডে ফিরিয়ে নেওয়া হয়েছে।")
    } catch (err: any) {
      toast.error(err.message || "স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে")
    }
  }

  const handleFinalSave = async () => {
    const success = await handleSaveSubjects()
    if (success) {
      toast.success("প্রশ্নপত্র সফলভাবে সংরক্ষণ করা হয়েছে।")
      router.push("/question-papers")
    }
  }



  return (
    <div className="w-full max-w-4xl mx-auto font-display">
      {/* Header Section */}
      <div className="mb-6 sm:mb-10 flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant font-body">
            <Link
              href="/question-papers"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              প্রশ্নপত্র
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">সম্পাদনা</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            প্রশ্নপত্র সম্পাদনা
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed font-body">
            ধাপগুলো অনুসরণ করে পরীক্ষার প্রাথমিক তথ্য, বিষয়ভিত্তিক নম্বর বণ্টন এবং প্রশ্ন সংযোগ সম্পন্ন করুন।
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            asChild
            className="gap-2 rounded-lg bg-primary font-bold text-white shadow-sm hover:bg-primary/95 text-xs sm:text-sm h-10 px-4 cursor-pointer"
          >
            <Link href={`/question-papers/${id}/builder`}>
              <Sparkles className="h-4 w-4" />
              <span>বিল্ডার ওপেন করুন</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center">
        {EDIT_WIZARD_STEPS.map((step, index) => {
          const isCompleted = index < currentStep
          const isActive = index === currentStep

          return (
            <Fragment key={step.id}>
              {index > 0 && (
                <div
                  className={`h-0.5 w-6 sm:w-12 transition-colors ${
                    isCompleted ? "bg-primary" : "bg-outline-variant/40"
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => handleStepClick(index)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div
                  className={`flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCompleted
                      ? "size-8 sm:size-10 bg-primary text-white"
                      : isActive
                        ? "size-8 sm:size-10 bg-primary text-white ring-4 ring-primary/20"
                        : "size-8 sm:size-10 border-2 border-outline-variant text-outline"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={`text-[9px] sm:text-[11px] font-medium hidden sm:block transition-colors ${
                    isCompleted || isActive ? "text-primary" : "text-outline"
                  }`}
                >
                  {step.label}
                </span>
              </button>
            </Fragment>
          )
        })}
      </div>

      {/* Step Content */}
      <div>
        {currentStep === 0 && (
          <StepBasicInfo
            data={wizardData}
            onChange={handleChange}
            errors={errors}
            classes={classes}
            isClassesLoading={isClassesLoading}
          />
        )}
        {currentStep === 1 && (
          <StepSubjectsDistribution
            data={wizardData}
            onChange={handleChange}
            errors={errors}
            subjects={subjects}
            questionTypes={questionTypes}
            isLoading={isSubjectsLoading || isTypesLoading}
          />
        )}
        {currentStep === 2 && (
          <StepReview data={wizardData} onGoToStep={handleStepClick} />
        )}
      </div>

      {/* Stepper Footer Controls */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 font-display">
        <div>
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-outline px-6 py-2.5 font-bold text-primary transition-all active:scale-95 hover:bg-surface-container-low cursor-pointer h-auto normal-case tracking-normal text-sm bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>পূর্ববর্তী ধাপ</span>
            </Button>
          )}
        </div>
        <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
          {currentStep === EDIT_WIZARD_STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={handleFinalSave}
              disabled={updatePaperMutation.isPending || upsertSubjectMutation.isPending || upsertDistMutation.isPending}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-2.5 font-bold text-white shadow-md transition-all active:scale-95 hover:bg-primary/95 cursor-pointer h-auto normal-case tracking-normal text-sm"
            >
              {updatePaperMutation.isPending || upsertSubjectMutation.isPending || upsertDistMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> সংরক্ষণ হচ্ছে...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> সংরক্ষণ করুন
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary-container px-8 py-2.5 font-bold text-on-primary-container shadow-md transition-all active:scale-95 hover:bg-primary hover:text-white cursor-pointer h-auto normal-case tracking-normal text-sm"
            >
              <span>পরবর্তী ধাপ</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
)
}

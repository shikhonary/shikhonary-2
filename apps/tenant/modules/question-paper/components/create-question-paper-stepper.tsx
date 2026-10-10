"use client"

import { useState, Fragment } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Loader2, Check, ArrowLeft, ArrowRight, SkipForward, FileText } from "lucide-react"
import {
  useCreateQuestionPaperFull,
} from "../services/use-question-paper"
import { INITIAL_WIZARD_DATA, WIZARD_STEPS } from "../types/create-wizard"
import type { WizardData } from "../types/create-wizard"
import { StepBasicInfo } from "./steps/step-basic-info"
import { StepSubjectsDistribution } from "./steps/step-subjects-distribution"
import { StepReview } from "./steps/step-review"

export function CreateQuestionPaperStepper() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardData, setWizardData] = useState<WizardData>({ ...INITIAL_WIZARD_DATA })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mutations
  const createFullMutation = useCreateQuestionPaperFull()

  // Reference data queries
  const { data: classesData, isLoading: isClassesLoading } = useQuery({
    ...trpc.academicClass.list.queryOptions({ limit: 100 }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const classes = (classesData?.academicClasses ?? []) as Array<{ id: string; nameBn: string; nameEn: string }>

  const { data: subjectsData, isLoading: isSubjectsLoading } = useQuery({
    ...trpc.academicSubject.list.queryOptions({ limit: 100, classId: wizardData.classId || undefined }),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!wizardData.classId,
  })
  const subjects = (subjectsData?.academicSubjects ?? []) as Array<{ id: string; nameBn: string; nameEn: string }>

  const { data: typesData, isLoading: isTypesLoading } = useQuery({
    ...trpc.questionType.list.queryOptions({ limit: 100 }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const questionTypes = (typesData?.questionTypes ?? []) as Array<{ id: string; nameBn: string; nameEn: string; mark: number }>

  // ── Handlers ───────────────────────────────────────────────────

  const handleChange = (updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }))
    // Clear related errors on change
    const keysToRemove = Object.keys(updates)
    setErrors((prev) => {
      const next = { ...prev }
      keysToRemove.forEach((k) => delete next[k])
      return next
    })
  }

  const validateStep = (step: number): Record<string, string> => {
    const e: Record<string, string> = {}

    if (step === 0) {
      if (!wizardData.examName.trim()) e.examName = "পরীক্ষার নাম আবশ্যক"
      if (!wizardData.classId) e.classId = "শ্রেণী নির্বাচন আবশ্যক"
      if (wizardData.timeInMinutes <= 0) e.timeInMinutes = "পরীক্ষার সময় অবশ্যই ০ থেকে বেশি হতে হবে"
    }

    if (step === 1) {
      if (wizardData.subjects.length === 0) {
        e.subjects = "অন্তত একটি বিষয় যোগ করুন"
      }
      wizardData.subjects.forEach((s, i) => {
        if (s.distributions.length === 0) {
          e[`subject_${i}_distributions`] = `"${s.subjectName}" বিষয়ে অন্তত একটি নম্বর বণ্টন যোগ করুন`
        }
      })
    }

    return e
  }

  const goToStep = (step: number) => {
    // Can only go back freely. Going forward requires validation.
    if (step < currentStep) {
      setCurrentStep(step)
      setErrors({})
      return
    }

    // Validate all steps from current up to target
    for (let s = currentStep; s < step; s++) {
      const stepErrors = validateStep(s)
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        setCurrentStep(s)
        return
      }
    }
    setErrors({})
    setCurrentStep(step)
  }

  const handleNext = () => {
    const stepErrors = validateStep(currentStep)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1))
  }

  const handlePrev = () => {
    setErrors({})
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSkip = () => {
    setErrors({})
    setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1))
  }

  // ── Final Submit ───────────────────────────────────────────────

  const handleSubmit = async () => {
    // Validate all steps
    for (let s = 0; s < WIZARD_STEPS.length - 1; s++) {
      const stepErrors = validateStep(s)
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        setCurrentStep(s)
        toast.error("কিছু তথ্য সঠিক নয়। অনুগ্রহ করে পরীক্ষা করুন।")
        return
      }
    }

    setIsSubmitting(true)

    try {
      const dynamicTitle = `${wizardData.className} - ${wizardData.examName} প্রশ্নপত্র`

      // Single batch request — paper + subjects + distributions all at once
      const paper = await createFullMutation.mutateAsync({
        title: dynamicTitle,
        examName: wizardData.examName,
        description: "",
        classId: wizardData.classId,
        className: wizardData.className,
        isTemplate: wizardData.isTemplate,
        timeInMinutes: wizardData.timeInMinutes,
        settings: {},
        instructions: [],
        subjects: wizardData.subjects.map((subject, i) => ({
          subjectId: subject.subjectId,
          subjectName: subject.subjectName,
          orderIndex: i,
          questionTypeIds: subject.distributions.map((d) => d.questionTypeId),
          distributions: subject.distributions.map((dist) => ({
            questionTypeId: dist.questionTypeId,
            questionTypeName: dist.questionTypeName,
            questionTypeNameBn: dist.questionTypeNameBn ?? null,
            questionTypeLabel: dist.questionTypeLabel,
            marksPerQuestion: dist.marksPerQuestion,
            markDistribution: dist.markDistribution ?? { a: dist.marksPerQuestion },
            questionCount: dist.questionCount,
            questionsToAttempt: dist.questionsToAttempt ?? null,
            orderIndex: dist.orderIndex,
          })),
        })),
      })

      toast.success("প্রশ্নপত্র সফলভাবে তৈরি হয়েছে!")
      setTimeout(() => {
        router.push(`/question-papers/${paper.id}/builder`)
      }, 800)
    } catch (err: any) {
      const msg = err.message || "প্রশ্নপত্র তৈরি করতে ব্যর্থ হয়েছে"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Step skippable flags ───────────────────────────────────────

  const isSkippable = false
  const isLastStep = currentStep === WIZARD_STEPS.length - 1

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center p-4 sm:p-5 rounded-2xl bg-card border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = index < currentStep
          const isActive = index === currentStep

          return (
            <Fragment key={step.id}>
              {index > 0 && (
                <div
                  className={`h-0.5 w-8 sm:w-16 mx-2 transition-colors ${
                    isCompleted ? "bg-indigo-600" : "bg-slate-200 dark:bg-white/10"
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => goToStep(index)}
                className="flex items-center gap-2 cursor-pointer group select-none"
              >
                <div
                  className={`flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                    isCompleted
                      ? "size-8 sm:size-9 bg-emerald-600 text-white shadow-xs"
                      : isActive
                        ? "size-8 sm:size-9 bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-xs"
                        : "size-8 sm:size-9 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-muted-foreground group-hover:border-slate-300"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span
                    className={`text-xs font-bold font-headline transition-colors ${
                      isActive ? "text-indigo-600 dark:text-indigo-400" : isCompleted ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ধাপ {index + 1}
                  </span>
                </div>
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
          <StepReview data={wizardData} onGoToStep={goToStep} />
        )}
      </div>

      {/* Navigation Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-2 font-headline">
        <div>
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 px-5 rounded-xl border border-slate-200 dark:border-white/[0.08] font-bold text-foreground hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer text-xs sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              <span>পূর্ববর্তী ধাপ</span>
            </Button>
          )}
        </div>
        <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
          {isLastStep ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs active:scale-95 transition-all cursor-pointer text-xs sm:text-sm"
            >
              {isSubmitting ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin mr-2" />
              ) : (
                <FileText className="h-4.5 w-4.5 mr-2" />
              )}
              <span>{isSubmitting ? "তৈরি করা হচ্ছে..." : "প্রশ্নপত্র তৈরি সম্পন্ন করুন"}</span>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs active:scale-95 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <span>পরবর্তী ধাপ</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

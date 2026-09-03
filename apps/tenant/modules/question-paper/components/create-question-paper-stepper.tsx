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
            marksPerQuestion: dist.marksPerQuestion,
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
      <div className="flex items-center justify-center">
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = index < currentStep
          const isActive = index === currentStep
          const isPending = index > currentStep

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
                onClick={() => goToStep(index)}
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
          <StepReview data={wizardData} onGoToStep={goToStep} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 font-display">
        <div>
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-outline px-6 py-2.5 font-bold text-primary transition-all active:scale-95 hover:bg-surface-container-low cursor-pointer h-auto normal-case tracking-normal disabled:opacity-50 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>পূর্ববর্তী ধাপ</span>
            </Button>
          )}
        </div>
        <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3 sm:gap-3">
          {isLastStep ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary-container px-8 py-2.5 font-bold text-on-primary-container shadow-md transition-all active:scale-95 hover:bg-primary hover:text-white disabled:opacity-50 cursor-pointer h-auto normal-case tracking-normal text-sm"
            >
              {isSubmitting ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <FileText className="h-4.5 w-4.5" />
              )}
              <span>{isSubmitting ? "তৈরি করা হচ্ছে..." : "প্রশ্নপত্র তৈরি করুন"}</span>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary-container px-8 py-2.5 font-bold text-on-primary-container shadow-md transition-all active:scale-95 hover:bg-primary hover:text-white disabled:opacity-50 cursor-pointer h-auto normal-case tracking-normal text-sm"
            >
              <span>পরবর্তী ধাপ</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

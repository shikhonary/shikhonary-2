// Shared types for the Create Question Paper multi-step wizard

export interface WizardDistribution {
  tempId: string
  questionTypeId: string
  questionTypeName: string
  questionTypeLabel?: string | null
  marksPerQuestion: number
  markDistribution?: any
  questionCount: number
  questionsToAttempt: number | null
  orderIndex: number
}

export interface WizardSubject {
  tempId: string
  subjectId: string
  subjectName: string
  distributions: WizardDistribution[]
}

export interface WizardData {
  examName: string
  classId: string
  className: string
  timeInMinutes: number
  isTemplate: boolean
  subjects: WizardSubject[]
}

export const INITIAL_WIZARD_DATA: WizardData = {
  examName: "",
  classId: "",
  className: "",
  timeInMinutes: 0,
  isTemplate: false,
  subjects: [],
}

export interface StepProps {
  data: WizardData
  onChange: (updates: Partial<WizardData>) => void
  errors: Record<string, string>
}

export interface AcademicClassRef {
  id: string
  nameBn: string
  nameEn: string
}

export interface AcademicSubjectRef {
  id: string
  nameBn: string
  nameEn: string
}

export interface QuestionTypeRef {
  id: string
  nameBn: string
  nameEn: string
  mark: number
}

// Step definitions for the indicator
export const WIZARD_STEPS = [
  { id: "basic", label: "প্রাথমিক তথ্য" },
  { id: "subjects", label: "বিষয় ও নম্বর" },
  { id: "review", label: "পর্যালোচনা" },
] as const

export type StepId = (typeof WIZARD_STEPS)[number]["id"]

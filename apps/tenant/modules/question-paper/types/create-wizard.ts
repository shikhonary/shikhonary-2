// Shared types for the Create Question Paper multi-step wizard

export interface WizardSection {
  tempId: string
  title: string
  titleBn: string
  instructions: string
  orderIndex: number
}

export interface WizardDistribution {
  tempId: string
  questionTypeId: string
  questionTypeName: string
  marksPerQuestion: number
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
  title: string
  examName: string
  description: string
  classId: string
  className: string
  isTemplate: boolean
  sections: WizardSection[]
  subjects: WizardSubject[]
  instructions: string[]
}

export const INITIAL_WIZARD_DATA: WizardData = {
  title: "",
  examName: "",
  description: "",
  classId: "",
  className: "",
  isTemplate: false,
  sections: [],
  subjects: [],
  instructions: [],
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
  { id: "sections", label: "বিভাগ সমূহ" },
  { id: "subjects", label: "বিষয় ও নম্বর" },
  { id: "instructions", label: "নির্দেশাবলী" },
  { id: "review", label: "পর্যালোচনা" },
] as const

export type StepId = (typeof WIZARD_STEPS)[number]["id"]

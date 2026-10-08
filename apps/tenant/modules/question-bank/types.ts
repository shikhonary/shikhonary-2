import type { QUESTION_TYPE_CODES } from "@workspace/utils"

export type QuestionCategory = string

export interface QuestionBankItem {
  id: string
  category: string
  categoryLabelEn: string
  categoryLabelBn: string
  subjectId: string
  subjectNameEn: string
  subjectNameBn: string
  chapterId?: string | null
  chapterNameEn?: string | null
  chapterNameBn?: string | null
  questionText: string
  context?: string | null
  options?: string[]
  answer?: string | null
  explanation?: string | null
  difficulty: "EASY" | "MEDIUM" | "HARD" | string
  reference: string[]
  source?: string | null
  session?: string | null
  isMath: boolean
  attachments?: Array<{
    id?: string
    url: string
    title?: string | null
    type?: string
  }>
  subQuestions?: Array<{
    label: string
    question: string
    mark?: number
  }>
  columnA?: string[]
  columnB?: string[]
  columnC?: string[]
  createdAt: Date | string
}

export interface QuestionBankStats {
  totalQuestions: number
  totalMcqs: number
  totalCqs: number
  totalShortAnswers: number
  totalPbqs: number
  totalSubjects: number
  totalClasses: number
}

export interface AcademicSubjectBrief {
  id: string
  nameEn: string
  nameBn: string
  code?: string | null
  group?: string | null
}

export interface AcademicClassItem {
  id: string
  nameEn: string
  nameBn: string
  position: number
  subjectCount: number
  subjects: AcademicSubjectBrief[]
}

export interface AcademicChapterBrief {
  id: string
  nameEn: string
  nameBn: string
  position: number
}

export interface AcademicSubjectWithChapters {
  id: string
  nameEn: string
  nameBn: string
  code?: string | null
  group?: string | null
  position: number
  chaptersCount: number
  questionCount: number
  questionTypesCount?: number
  chapters: AcademicChapterBrief[]
}

export interface ClassDetailsData {
  class: {
    id: string
    nameEn: string
    nameBn: string
    position: number
  }
  subjects: AcademicSubjectWithChapters[]
  totalSubjects: number
  totalChapters: number
  totalQuestions: number
}

export interface QuestionTypeSummary {
  id: string
  code: string
  nameEn: string
  nameBn: string
  count: number
}

export interface SubjectDetailsData {
  class: {
    id: string
    nameEn: string
    nameBn: string
    position: number
  } | null
  subject: {
    id: string
    nameEn: string
    nameBn: string
    code?: string | null
    group?: string | null
  }
  chapters: AcademicChapterBrief[]
  questionTypes: QuestionTypeSummary[]
  totalQuestions: number
  totalChapters: number
  totalQuestionTypes: number
}




import { create } from "zustand"

export interface QuestionReportTarget {
  entityType: string
  entityId: string
  questionSnippet?: string | null
  chapterName?: string | null
  subjectName?: string | null
  categoryLabel?: string | null
}

interface QuestionReportState {
  isOpen: boolean
  target: QuestionReportTarget | null
  openReport: (target: QuestionReportTarget) => void
  closeReport: () => void
}

export const useQuestionReportStore = create<QuestionReportState>((set) => ({
  isOpen: false,
  target: null,
  openReport: (target) => set({ isOpen: true, target }),
  closeReport: () => set({ isOpen: false, target: null }),
}))

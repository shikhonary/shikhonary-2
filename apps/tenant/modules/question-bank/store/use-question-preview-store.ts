import { create } from "zustand"
import type { QuestionBankItem } from "../types"

interface QuestionPreviewState {
  isOpen: boolean
  question: QuestionBankItem | null
  openPreview: (question: QuestionBankItem) => void
  closePreview: () => void
}

export const useQuestionPreviewStore = create<QuestionPreviewState>((set) => ({
  isOpen: false,
  question: null,
  openPreview: (question) => set({ isOpen: true, question }),
  closePreview: () => set({ isOpen: false, question: null }),
}))

import { create } from "zustand"

interface DeleteGrammarQuestionModalState {
  isOpen: boolean
  grammarQuestionId: string | null
  questionText: string | null
  selectedIds: string[]
  openModal: (grammarQuestionId: string, questionText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteGrammarQuestionModalStore = create<DeleteGrammarQuestionModalState>((set) => ({
  isOpen: false,
  grammarQuestionId: null,
  questionText: null,
  selectedIds: [],
  openModal: (grammarQuestionId: string, questionText: string) =>
    set({ isOpen: true, grammarQuestionId, questionText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, grammarQuestionId: null, questionText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, grammarQuestionId: null, questionText: null, selectedIds: [] }),
}))

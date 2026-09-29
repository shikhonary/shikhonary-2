import { create } from "zustand"

interface DeleteMakeQuestionModalState {
  isOpen: boolean
  questionId: string | null
  statementSnippet: string | null
  selectedIds: string[]
  openModal: (questionId: string, statementSnippet: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteMakeQuestionModalStore = create<DeleteMakeQuestionModalState>((set) => ({
  isOpen: false,
  questionId: null,
  statementSnippet: null,
  selectedIds: [],
  openModal: (questionId: string, statementSnippet: string) =>
    set({ isOpen: true, questionId, statementSnippet, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, questionId: null, statementSnippet: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, questionId: null, statementSnippet: null, selectedIds: [] }),
}))

import { create } from "zustand"

interface DeleteShortQuestionModalState {
  isOpen: boolean
  shortQuestionId: string | null
  questionText: string | null
  selectedIds: string[]
  openModal: (shortQuestionId: string, questionText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteShortQuestionModalStore = create<DeleteShortQuestionModalState>((set) => ({
  isOpen: false,
  shortQuestionId: null,
  questionText: null,
  selectedIds: [],
  openModal: (shortQuestionId: string, questionText: string) =>
    set({ isOpen: true, shortQuestionId, questionText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, shortQuestionId: null, questionText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, shortQuestionId: null, questionText: null, selectedIds: [] }),
}))

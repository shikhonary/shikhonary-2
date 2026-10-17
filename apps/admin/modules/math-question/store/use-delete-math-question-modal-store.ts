import { create } from "zustand"

interface DeleteMathQuestionModalState {
  isOpen: boolean
  mathQuestionId: string | null
  questionText: string | null
  selectedIds: string[]
  openModal: (mathQuestionId: string, questionText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteMathQuestionModalStore = create<DeleteMathQuestionModalState>((set) => ({
  isOpen: false,
  mathQuestionId: null,
  questionText: null,
  selectedIds: [],
  openModal: (mathQuestionId: string, questionText: string) =>
    set({ isOpen: true, mathQuestionId, questionText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, mathQuestionId: null, questionText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, mathQuestionId: null, questionText: null, selectedIds: [] }),
}))

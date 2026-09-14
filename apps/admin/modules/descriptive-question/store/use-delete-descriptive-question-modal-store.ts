import { create } from "zustand"

interface DeleteDescriptiveQuestionModalState {
  isOpen: boolean
  descriptiveQuestionId: string | null
  questionText: string | null
  selectedIds: string[]
  openModal: (descriptiveQuestionId: string, questionText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteDescriptiveQuestionModalStore = create<DeleteDescriptiveQuestionModalState>((set) => ({
  isOpen: false,
  descriptiveQuestionId: null,
  questionText: null,
  selectedIds: [],
  openModal: (descriptiveQuestionId: string, questionText: string) =>
    set({ isOpen: true, descriptiveQuestionId, questionText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, descriptiveQuestionId: null, questionText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, descriptiveQuestionId: null, questionText: null, selectedIds: [] }),
}))

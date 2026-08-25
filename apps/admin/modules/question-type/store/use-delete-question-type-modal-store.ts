import { create } from "zustand"

interface DeleteQuestionTypeModalState {
  isOpen: boolean
  questionTypeId: string | null
  questionTypeName: string | null
  openModal: (questionTypeId: string, questionTypeName: string) => void
  closeModal: () => void
}

export const useDeleteQuestionTypeModalStore = create<DeleteQuestionTypeModalState>((set) => ({
  isOpen: false,
  questionTypeId: null,
  questionTypeName: null,
  openModal: (questionTypeId: string, questionTypeName: string) =>
    set({ isOpen: true, questionTypeId, questionTypeName }),
  closeModal: () => set({ isOpen: false, questionTypeId: null, questionTypeName: null }),
}))

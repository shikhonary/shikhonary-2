import { create } from "zustand"

interface DeleteExamModalState {
  isOpen: boolean
  examId: string | null
  examTitle: string | null
  openModal: (id: string, title: string) => void
  closeModal: () => void
}

export const useDeleteExamModalStore = create<DeleteExamModalState>((set) => ({
  isOpen: false,
  examId: null,
  examTitle: null,
  openModal: (id: string, title: string) =>
    set({ isOpen: true, examId: id, examTitle: title }),
  closeModal: () => set({ isOpen: false, examId: null, examTitle: null }),
}))

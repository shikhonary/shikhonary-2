import { create } from "zustand"

interface DeleteQuestionPaperModalState {
  isOpen: boolean
  paperId: string | null
  paperTitle: string | null
  openModal: (paperId: string, paperTitle: string) => void
  closeModal: () => void
}

export const useDeleteQuestionPaperModalStore = create<DeleteQuestionPaperModalState>((set) => ({
  isOpen: false,
  paperId: null,
  paperTitle: null,
  openModal: (paperId, paperTitle) =>
    set({ isOpen: true, paperId, paperTitle }),
  closeModal: () => set({ isOpen: false, paperId: null, paperTitle: null }),
}))

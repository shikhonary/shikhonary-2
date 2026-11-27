import { create } from "zustand"

interface PublishQuestionPaperModalState {
  isOpen: boolean
  paperId: string | null
  paperTitle: string | null
  openModal: (paperId: string, paperTitle: string) => void
  closeModal: () => void
}

export const usePublishQuestionPaperModalStore = create<PublishQuestionPaperModalState>((set) => ({
  isOpen: false,
  paperId: null,
  paperTitle: null,
  openModal: (paperId, paperTitle) =>
    set({ isOpen: true, paperId, paperTitle }),
  closeModal: () => set({ isOpen: false, paperId: null, paperTitle: null }),
}))

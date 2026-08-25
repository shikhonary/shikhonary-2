import { create } from "zustand"

interface DeleteChapterModalState {
  isOpen: boolean
  chapterId: string | null
  chapterName: string | null
  openModal: (chapterId: string, chapterName: string) => void
  closeModal: () => void
}

export const useDeleteChapterModalStore = create<DeleteChapterModalState>((set) => ({
  isOpen: false,
  chapterId: null,
  chapterName: null,
  openModal: (chapterId: string, chapterName: string) =>
    set({ isOpen: true, chapterId, chapterName }),
  closeModal: () => set({ isOpen: false, chapterId: null, chapterName: null }),
}))

import { create } from "zustand"

export interface ChapterItemData {
  id: string
  name: string
  position: number
  subjectId: string
}

interface ChapterModalState {
  isOpen: boolean
  chapter: ChapterItemData | null
  defaultSubjectId?: string
  openCreateModal: (defaultSubjectId?: string) => void
  openEditModal: (chapter: ChapterItemData) => void
  closeModal: () => void
}

export const useChapterModalStore = create<ChapterModalState>((set) => ({
  isOpen: false,
  chapter: null,
  defaultSubjectId: undefined,
  openCreateModal: (defaultSubjectId?: string) =>
    set({ isOpen: true, chapter: null, defaultSubjectId }),
  openEditModal: (chapter: ChapterItemData) =>
    set({ isOpen: true, chapter, defaultSubjectId: chapter.subjectId }),
  closeModal: () => set({ isOpen: false, chapter: null, defaultSubjectId: undefined }),
}))

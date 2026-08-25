import { create } from "zustand"

interface DeleteSubjectModalState {
  isOpen: boolean
  subjectId: string | null
  subjectName: string | null
  openModal: (subjectId: string, subjectName: string) => void
  closeModal: () => void
}

export const useDeleteSubjectModalStore = create<DeleteSubjectModalState>((set) => ({
  isOpen: false,
  subjectId: null,
  subjectName: null,
  openModal: (subjectId: string, subjectName: string) =>
    set({ isOpen: true, subjectId, subjectName }),
  closeModal: () => set({ isOpen: false, subjectId: null, subjectName: null }),
}))

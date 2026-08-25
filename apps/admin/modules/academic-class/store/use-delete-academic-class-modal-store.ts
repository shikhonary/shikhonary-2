import { create } from "zustand"

interface DeleteAcademicClassModalState {
  isOpen: boolean
  classId: string | null
  className: string | null
  openModal: (classId: string, className: string) => void
  closeModal: () => void
}

export const useDeleteAcademicClassModalStore = create<DeleteAcademicClassModalState>((set) => ({
  isOpen: false,
  classId: null,
  className: null,
  openModal: (classId: string, className: string) =>
    set({ isOpen: true, classId, className }),
  closeModal: () => set({ isOpen: false, classId: null, className: null }),
}))

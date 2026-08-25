import { create } from "zustand"

interface EditAcademicClassModalState {
  isOpen: boolean
  classId: string | null
  openModal: (classId: string) => void
  closeModal: () => void
}

export const useEditAcademicClassModalStore = create<EditAcademicClassModalState>((set) => ({
  isOpen: false,
  classId: null,
  openModal: (classId: string) => set({ isOpen: true, classId }),
  closeModal: () => set({ isOpen: false, classId: null }),
}))

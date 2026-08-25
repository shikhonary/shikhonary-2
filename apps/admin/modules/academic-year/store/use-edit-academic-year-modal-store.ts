import { create } from "zustand"

interface EditAcademicYearModalState {
  isOpen: boolean
  yearId: string | null
  openModal: (yearId: string) => void
  closeModal: () => void
}

export const useEditAcademicYearModalStore = create<EditAcademicYearModalState>((set) => ({
  isOpen: false,
  yearId: null,
  openModal: (yearId: string) => set({ isOpen: true, yearId }),
  closeModal: () => set({ isOpen: false, yearId: null }),
}))

import { create } from "zustand"

interface CreateAcademicYearModalState {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const useCreateAcademicYearModalStore = create<CreateAcademicYearModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}))

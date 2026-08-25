import { create } from "zustand"

interface CreateAcademicClassModalState {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const useCreateAcademicClassModalStore = create<CreateAcademicClassModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}))

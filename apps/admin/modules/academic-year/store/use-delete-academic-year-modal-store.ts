import { create } from "zustand"

interface DeleteAcademicYearModalState {
  isOpen: boolean
  yearId: string | null
  yearName: string | null
  openModal: (yearId: string, yearName: string) => void
  closeModal: () => void
}

export const useDeleteAcademicYearModalStore = create<DeleteAcademicYearModalState>((set) => ({
  isOpen: false,
  yearId: null,
  yearName: null,
  openModal: (yearId: string, yearName: string) =>
    set({ isOpen: true, yearId, yearName }),
  closeModal: () => set({ isOpen: false, yearId: null, yearName: null }),
}))

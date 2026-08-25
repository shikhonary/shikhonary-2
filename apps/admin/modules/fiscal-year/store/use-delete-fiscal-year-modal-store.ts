import { create } from "zustand"

interface DeleteFiscalYearModalState {
  isOpen: boolean
  yearId: string | null
  yearName: string | null
  openModal: (yearId: string, yearName: string) => void
  closeModal: () => void
}

export const useDeleteFiscalYearModalStore = create<DeleteFiscalYearModalState>((set) => ({
  isOpen: false,
  yearId: null,
  yearName: null,
  openModal: (yearId: string, yearName: string) =>
    set({ isOpen: true, yearId, yearName }),
  closeModal: () => set({ isOpen: false, yearId: null, yearName: null }),
}))

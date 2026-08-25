import { create } from "zustand"

interface EditFiscalYearModalState {
  isOpen: boolean
  yearId: string | null
  openModal: (yearId: string) => void
  closeModal: () => void
}

export const useEditFiscalYearModalStore = create<EditFiscalYearModalState>((set) => ({
  isOpen: false,
  yearId: null,
  openModal: (yearId: string) => set({ isOpen: true, yearId }),
  closeModal: () => set({ isOpen: false, yearId: null }),
}))

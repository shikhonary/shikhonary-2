import { create } from "zustand"

export interface FiscalYear {
  id: string
  year: string
  startDate: Date | string | any
  endDate: Date | string | any
  isCurrent: boolean
}

interface FiscalYearModalState {
  isOpen: boolean
  fiscalYear: FiscalYear | null
  openModal: (fiscalYear?: FiscalYear | null) => void
  closeModal: () => void
}

export const useFiscalYearModalStore = create<FiscalYearModalState>((set) => ({
  isOpen: false,
  fiscalYear: null,
  openModal: (fiscalYear = null) => set({ isOpen: true, fiscalYear }),
  closeModal: () => set({ isOpen: false, fiscalYear: null }),
}))

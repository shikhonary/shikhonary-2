import { create } from "zustand"

interface TaxPayerDetailSheetState {
  isOpen: boolean
  taxPayerId: string | null
  openModal: (taxPayerId: string) => void
  closeModal: () => void
}

export const useTaxPayerDetailSheetStore = create<TaxPayerDetailSheetState>((set) => ({
  isOpen: false,
  taxPayerId: null,
  openModal: (taxPayerId) => set({ isOpen: true, taxPayerId }),
  closeModal: () => set({ isOpen: false, taxPayerId: null }),
}))

import { create } from "zustand"

interface TaxPayerCardModalState {
  isOpen: boolean
  taxPayer: any | null
  openModal: (taxPayer: any) => void
  closeModal: () => void
}

export const useTaxPayerCardModalStore = create<TaxPayerCardModalState>((set) => ({
  isOpen: false,
  taxPayer: null,
  openModal: (taxPayer) => set({ isOpen: true, taxPayer }),
  closeModal: () => set({ isOpen: false, taxPayer: null }),
}))

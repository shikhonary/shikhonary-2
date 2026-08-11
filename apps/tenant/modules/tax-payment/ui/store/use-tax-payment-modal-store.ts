import { create } from "zustand"

interface TaxPaymentModalState {
  isOpen: boolean
  preselectedTaxPayer: any | null
  openModal: (taxPayer?: any) => void
  closeModal: () => void
}

export const useTaxPaymentModalStore = create<TaxPaymentModalState>((set) => ({
  isOpen: false,
  preselectedTaxPayer: null,
  openModal: (taxPayer = null) => set({ isOpen: true, preselectedTaxPayer: taxPayer }),
  closeModal: () => set({ isOpen: false, preselectedTaxPayer: null }),
}))

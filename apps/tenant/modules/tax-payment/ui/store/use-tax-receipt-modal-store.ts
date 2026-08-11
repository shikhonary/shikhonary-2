import { create } from "zustand"

interface TaxReceiptModalState {
  isOpen: boolean
  payment: any | null
  openModal: (payment: any) => void
  closeModal: () => void
}

export const useTaxReceiptModalStore = create<TaxReceiptModalState>((set) => ({
  isOpen: false,
  payment: null,
  openModal: (payment) => set({ isOpen: true, payment }),
  closeModal: () => set({ isOpen: false, payment: null }),
}))

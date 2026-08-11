import { create } from "zustand"

interface DeleteTaxPaymentModalState {
  isOpen: boolean
  payment: any | null
  openModal: (payment: any) => void
  closeModal: () => void
}

export const useDeleteTaxPaymentModalStore = create<DeleteTaxPaymentModalState>((set) => ({
  isOpen: false,
  payment: null,
  openModal: (payment) => set({ isOpen: true, payment }),
  closeModal: () => set({ isOpen: false, payment: null }),
}))

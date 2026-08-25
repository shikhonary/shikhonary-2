import { create } from "zustand"

interface CreateFiscalYearModalState {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const useCreateFiscalYearModalStore = create<CreateFiscalYearModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}))

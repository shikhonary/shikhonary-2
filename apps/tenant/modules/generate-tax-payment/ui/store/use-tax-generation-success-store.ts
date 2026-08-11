import { create } from "zustand"

interface TaxGenerationSuccessState {
  isOpen: boolean
  executionResult: {
    generatedCount: number
    skippedCount: number
    totalAmount: number
  } | null
  openModal: (result: {
    generatedCount: number
    skippedCount: number
    totalAmount: number
  }) => void
  closeModal: () => void
}

export const useTaxGenerationSuccessStore = create<TaxGenerationSuccessState>((set) => ({
  isOpen: false,
  executionResult: null,
  openModal: (result) => set({ isOpen: true, executionResult: result }),
  closeModal: () => set({ isOpen: false, executionResult: null }),
}))

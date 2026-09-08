import { create } from "zustand"

interface DeletePunctuationModalState {
  isOpen: boolean
  punctuationId: string | null
  punctuationContent: string | null
  selectedIds: string[]
  openModal: (punctuationId: string, punctuationContent: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeletePunctuationModalStore = create<DeletePunctuationModalState>((set) => ({
  isOpen: false,
  punctuationId: null,
  punctuationContent: null,
  selectedIds: [],
  openModal: (punctuationId: string, punctuationContent: string) =>
    set({ isOpen: true, punctuationId, punctuationContent, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, punctuationId: null, punctuationContent: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, punctuationId: null, punctuationContent: null, selectedIds: [] }),
}))

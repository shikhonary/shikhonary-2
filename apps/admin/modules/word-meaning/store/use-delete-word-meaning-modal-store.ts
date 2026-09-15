import { create } from "zustand"

interface DeleteWordMeaningModalState {
  isOpen: boolean
  wordMeaningId: string | null
  wordText: string | null
  selectedIds: string[]
  openModal: (wordMeaningId: string, wordText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteWordMeaningModalStore = create<DeleteWordMeaningModalState>((set) => ({
  isOpen: false,
  wordMeaningId: null,
  wordText: null,
  selectedIds: [],
  openModal: (wordMeaningId: string, wordText: string) =>
    set({ isOpen: true, wordMeaningId, wordText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, wordMeaningId: null, wordText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, wordMeaningId: null, wordText: null, selectedIds: [] }),
}))

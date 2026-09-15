import { create } from "zustand"

interface DeleteMakeSentencesModalState {
  isOpen: boolean
  makeSentencesId: string | null
  wordText: string | null
  selectedIds: string[]
  openModal: (makeSentencesId: string, wordText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteMakeSentencesModalStore = create<DeleteMakeSentencesModalState>((set) => ({
  isOpen: false,
  makeSentencesId: null,
  wordText: null,
  selectedIds: [],
  openModal: (makeSentencesId: string, wordText: string) =>
    set({ isOpen: true, makeSentencesId, wordText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, makeSentencesId: null, wordText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, makeSentencesId: null, wordText: null, selectedIds: [] }),
}))

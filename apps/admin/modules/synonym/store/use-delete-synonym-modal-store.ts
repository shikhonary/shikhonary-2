import { create } from "zustand"

interface DeleteSynonymModalState {
  isOpen: boolean
  synonymId: string | null
  wordText: string | null
  selectedIds: string[]
  openModal: (synonymId: string, wordText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteSynonymModalStore = create<DeleteSynonymModalState>((set) => ({
  isOpen: false,
  synonymId: null,
  wordText: null,
  selectedIds: [],
  openModal: (synonymId: string, wordText: string) =>
    set({ isOpen: true, synonymId, wordText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, synonymId: null, wordText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, synonymId: null, wordText: null, selectedIds: [] }),
}))

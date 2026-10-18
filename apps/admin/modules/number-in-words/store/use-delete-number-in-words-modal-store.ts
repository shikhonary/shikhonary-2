import { create } from "zustand"

interface DeleteNumberInWordsModalState {
  isOpen: boolean
  numberInWordsId: string | null
  itemText: string | null
  selectedIds: string[]
  openModal: (numberInWordsId: string, itemText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteNumberInWordsModalStore = create<DeleteNumberInWordsModalState>((set) => ({
  isOpen: false,
  numberInWordsId: null,
  itemText: null,
  selectedIds: [],
  openModal: (numberInWordsId: string, itemText: string) =>
    set({ isOpen: true, numberInWordsId, itemText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, numberInWordsId: null, itemText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, numberInWordsId: null, itemText: null, selectedIds: [] }),
}))

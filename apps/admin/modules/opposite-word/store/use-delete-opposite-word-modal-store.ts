import { create } from "zustand"

interface DeleteOppositeWordModalState {
  isOpen: boolean
  oppositeWordId: string | null
  wordText: string | null
  selectedIds: string[]
  openModal: (oppositeWordId: string, wordText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteOppositeWordModalStore = create<DeleteOppositeWordModalState>((set) => ({
  isOpen: false,
  oppositeWordId: null,
  wordText: null,
  selectedIds: [],
  openModal: (oppositeWordId: string, wordText: string) =>
    set({ isOpen: true, oppositeWordId, wordText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, oppositeWordId: null, wordText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, oppositeWordId: null, wordText: null, selectedIds: [] }),
}))

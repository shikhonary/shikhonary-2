import { create } from "zustand"

interface DeleteLetterModalState {
  isOpen: boolean
  letterId: string | null
  letterTitle: string | null
  selectedIds: string[]
  openModal: (letterId: string, letterTitle: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteLetterModalStore = create<DeleteLetterModalState>((set) => ({
  isOpen: false,
  letterId: null,
  letterTitle: null,
  selectedIds: [],
  openModal: (letterId: string, letterTitle: string) =>
    set({ isOpen: true, letterId, letterTitle, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, letterId: null, letterTitle: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, letterId: null, letterTitle: null, selectedIds: [] }),
}))

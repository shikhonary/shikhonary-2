import { create } from "zustand"

interface DeletePoemModalState {
  isOpen: boolean
  poemId: string | null
  poemTitle: string | null
  selectedIds: string[]
  openModal: (poemId: string, poemTitle: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeletePoemModalStore = create<DeletePoemModalState>((set) => ({
  isOpen: false,
  poemId: null,
  poemTitle: null,
  selectedIds: [],
  openModal: (poemId: string, poemTitle: string) =>
    set({ isOpen: true, poemId, poemTitle, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, poemId: null, poemTitle: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, poemId: null, poemTitle: null, selectedIds: [] }),
}))

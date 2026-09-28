import { create } from "zustand"

interface DeletePoemEssenceModalState {
  isOpen: boolean
  poemEssenceId: string | null
  poemEssenceTitle: string | null
  selectedIds: string[]
  openModal: (poemEssenceId: string, poemEssenceTitle: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeletePoemEssenceModalStore = create<DeletePoemEssenceModalState>((set) => ({
  isOpen: false,
  poemEssenceId: null,
  poemEssenceTitle: null,
  selectedIds: [],
  openModal: (poemEssenceId: string, poemEssenceTitle: string) =>
    set({ isOpen: true, poemEssenceId, poemEssenceTitle, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, poemEssenceId: null, poemEssenceTitle: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, poemEssenceId: null, poemEssenceTitle: null, selectedIds: [] }),
}))

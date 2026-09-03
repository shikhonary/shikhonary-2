import { create } from "zustand"

interface DeleteEssenceModalState {
  isOpen: boolean
  essenceId: string | null
  essenceTitle: string | null
  selectedIds: string[]
  openModal: (essenceId: string, essenceTitle: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteEssenceModalStore = create<DeleteEssenceModalState>((set) => ({
  isOpen: false,
  essenceId: null,
  essenceTitle: null,
  selectedIds: [],
  openModal: (essenceId: string, essenceTitle: string) =>
    set({ isOpen: true, essenceId, essenceTitle, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, essenceId: null, essenceTitle: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, essenceId: null, essenceTitle: null, selectedIds: [] }),
}))

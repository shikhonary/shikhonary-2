import { create } from "zustand"

interface DeleteThoughtExpansionModalState {
  isOpen: boolean
  thoughtExpansionId: string | null
  thoughtExpansionTitle: string | null
  selectedIds: string[]
  openModal: (thoughtExpansionId: string, thoughtExpansionTitle: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteThoughtExpansionModalStore = create<DeleteThoughtExpansionModalState>((set) => ({
  isOpen: false,
  thoughtExpansionId: null,
  thoughtExpansionTitle: null,
  selectedIds: [],
  openModal: (thoughtExpansionId: string, thoughtExpansionTitle: string) =>
    set({ isOpen: true, thoughtExpansionId, thoughtExpansionTitle, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, thoughtExpansionId: null, thoughtExpansionTitle: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, thoughtExpansionId: null, thoughtExpansionTitle: null, selectedIds: [] }),
}))

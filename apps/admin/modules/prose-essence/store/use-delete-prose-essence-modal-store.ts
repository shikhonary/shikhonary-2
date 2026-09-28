import { create } from "zustand"

interface DeleteProseEssenceModalState {
  isOpen: boolean
  proseEssenceId: string | null
  proseEssenceTitle: string | null
  selectedIds: string[]
  openModal: (proseEssenceId: string, proseEssenceTitle: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteProseEssenceModalStore = create<DeleteProseEssenceModalState>((set) => ({
  isOpen: false,
  proseEssenceId: null,
  proseEssenceTitle: null,
  selectedIds: [],
  openModal: (proseEssenceId: string, proseEssenceTitle: string) =>
    set({ isOpen: true, proseEssenceId, proseEssenceTitle, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, proseEssenceId: null, proseEssenceTitle: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, proseEssenceId: null, proseEssenceTitle: null, selectedIds: [] }),
}))

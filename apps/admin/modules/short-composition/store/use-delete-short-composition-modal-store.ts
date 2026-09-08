import { create } from "zustand"

interface DeleteShortCompositionModalState {
  isOpen: boolean
  shortCompositionId: string | null
  shortCompositionTitle: string | null
  selectedIds: string[]
  openModal: (shortCompositionId: string, shortCompositionTitle: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteShortCompositionModalStore = create<DeleteShortCompositionModalState>((set) => ({
  isOpen: false,
  shortCompositionId: null,
  shortCompositionTitle: null,
  selectedIds: [],
  openModal: (shortCompositionId: string, shortCompositionTitle: string) =>
    set({ isOpen: true, shortCompositionId, shortCompositionTitle, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, shortCompositionId: null, shortCompositionTitle: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, shortCompositionId: null, shortCompositionTitle: null, selectedIds: [] }),
}))

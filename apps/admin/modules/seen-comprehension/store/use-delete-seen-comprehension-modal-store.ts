import { create } from "zustand"

interface DeleteSeenComprehensionModalState {
  isOpen: boolean
  comprehensionId: string | null
  comprehensionTitle: string | null
  selectedIds: string[]
  openModal: (comprehensionId: string, comprehensionTitle: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteSeenComprehensionModalStore = create<DeleteSeenComprehensionModalState>((set) => ({
  isOpen: false,
  comprehensionId: null,
  comprehensionTitle: null,
  selectedIds: [],
  openModal: (comprehensionId: string, comprehensionTitle: string) =>
    set({ isOpen: true, comprehensionId, comprehensionTitle, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, comprehensionId: null, comprehensionTitle: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, comprehensionId: null, comprehensionTitle: null, selectedIds: [] }),
}))

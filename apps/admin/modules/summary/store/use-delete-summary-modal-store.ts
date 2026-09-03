import { create } from "zustand"

interface DeleteSummaryModalState {
  isOpen: boolean
  summaryId: string | null
  summaryTitle: string | null
  selectedIds: string[]
  openModal: (summaryId: string, summaryTitle: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteSummaryModalStore = create<DeleteSummaryModalState>((set) => ({
  isOpen: false,
  summaryId: null,
  summaryTitle: null,
  selectedIds: [],
  openModal: (summaryId: string, summaryTitle: string) =>
    set({ isOpen: true, summaryId, summaryTitle, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, summaryId: null, summaryTitle: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, summaryId: null, summaryTitle: null, selectedIds: [] }),
}))

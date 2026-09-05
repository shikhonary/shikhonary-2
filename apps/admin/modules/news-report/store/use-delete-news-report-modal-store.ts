import { create } from "zustand"

interface DeleteNewsReportModalState {
  isOpen: boolean
  newsReportId: string | null
  newsReportTitle: string | null
  selectedIds: string[]
  openModal: (newsReportId: string, newsReportTitle: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteNewsReportModalStore = create<DeleteNewsReportModalState>((set) => ({
  isOpen: false,
  newsReportId: null,
  newsReportTitle: null,
  selectedIds: [],
  openModal: (newsReportId: string, newsReportTitle: string) =>
    set({ isOpen: true, newsReportId, newsReportTitle, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, newsReportId: null, newsReportTitle: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, newsReportId: null, newsReportTitle: null, selectedIds: [] }),
}))

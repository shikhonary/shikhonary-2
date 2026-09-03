import { create } from "zustand"

interface DeleteApplicationModalState {
  isOpen: boolean
  applicationId: string | null
  applicationTitle: string | null
  selectedIds: string[]
  openModal: (applicationId: string, applicationTitle: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteApplicationModalStore = create<DeleteApplicationModalState>((set) => ({
  isOpen: false,
  applicationId: null,
  applicationTitle: null,
  selectedIds: [],
  openModal: (applicationId: string, applicationTitle: string) =>
    set({ isOpen: true, applicationId, applicationTitle, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, applicationId: null, applicationTitle: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, applicationId: null, applicationTitle: null, selectedIds: [] }),
}))

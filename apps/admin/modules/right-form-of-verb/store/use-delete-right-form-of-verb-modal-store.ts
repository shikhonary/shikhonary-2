import { create } from "zustand"

interface DeleteRightFormOfVerbModalState {
  isOpen: boolean
  rightFormOfVerbId: string | null
  rightFormOfVerbContent: string | null
  selectedIds: string[]
  openModal: (rightFormOfVerbId: string, rightFormOfVerbContent: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteRightFormOfVerbModalStore = create<DeleteRightFormOfVerbModalState>((set) => ({
  isOpen: false,
  rightFormOfVerbId: null,
  rightFormOfVerbContent: null,
  selectedIds: [],
  openModal: (rightFormOfVerbId: string, rightFormOfVerbContent: string) =>
    set({ isOpen: true, rightFormOfVerbId, rightFormOfVerbContent, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, rightFormOfVerbId: null, rightFormOfVerbContent: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, rightFormOfVerbId: null, rightFormOfVerbContent: null, selectedIds: [] }),
}))

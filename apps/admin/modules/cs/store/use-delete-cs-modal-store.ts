import { create } from "zustand"

interface DeleteCsModalState {
  isOpen: boolean
  csId: string | null
  csSnippet: string | null
  selectedIds: string[]
  openModal: (csId: string, csSnippet: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteCsModalStore = create<DeleteCsModalState>((set) => ({
  isOpen: false,
  csId: null,
  csSnippet: null,
  selectedIds: [],
  openModal: (csId: string, csSnippet: string) =>
    set({ isOpen: true, csId, csSnippet, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, csId: null, csSnippet: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, csId: null, csSnippet: null, selectedIds: [] }),
}))

import { create } from "zustand"

interface DeleteParagraphModalState {
  isOpen: boolean
  paragraphId: string | null
  paragraphName: string | null
  selectedIds: string[]
  openModal: (paragraphId: string, paragraphName: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteParagraphModalStore = create<DeleteParagraphModalState>((set) => ({
  isOpen: false,
  paragraphId: null,
  paragraphName: null,
  selectedIds: [],
  openModal: (paragraphId: string, paragraphName: string) =>
    set({ isOpen: true, paragraphId, paragraphName, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, paragraphId: null, paragraphName: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, paragraphId: null, paragraphName: null, selectedIds: [] }),
}))

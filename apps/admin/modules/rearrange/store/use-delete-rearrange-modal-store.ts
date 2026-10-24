import { create } from "zustand"

interface DeleteRearrangeModalState {
  isOpen: boolean
  isBulkOpen: boolean
  rearrangeId: string | null
  snippet: string | null
  selectedIds: string[]
  openModal: (id: string, snippet: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteRearrangeModalStore = create<DeleteRearrangeModalState>((set) => ({
  isOpen: false,
  isBulkOpen: false,
  rearrangeId: null,
  snippet: null,
  selectedIds: [],
  openModal: (id, snippet) => set({ isOpen: true, rearrangeId: id, snippet }),
  openBulkModal: (ids) => set({ isBulkOpen: true, selectedIds: ids }),
  closeModal: () => set({ isOpen: false, isBulkOpen: false, rearrangeId: null, snippet: null, selectedIds: [] }),
}))

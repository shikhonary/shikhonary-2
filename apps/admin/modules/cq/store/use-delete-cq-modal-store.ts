import { create } from "zustand"

interface DeleteCqModalState {
  isOpen: boolean
  cqId: string | null
  cqQuestion: string | null
  selectedIds: string[]
  openModal: (cqId: string, cqQuestion: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteCqModalStore = create<DeleteCqModalState>((set) => ({
  isOpen: false,
  cqId: null,
  cqQuestion: null,
  selectedIds: [],
  openModal: (cqId: string, cqQuestion: string) =>
    set({ isOpen: true, cqId, cqQuestion, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, cqId: null, cqQuestion: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, cqId: null, cqQuestion: null, selectedIds: [] }),
}))

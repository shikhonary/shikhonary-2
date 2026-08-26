import { create } from "zustand"

interface DeleteCqModalState {
  isOpen: boolean
  cqId: string | null
  cqContext: string | null
  selectedIds: string[]
  openModal: (cqId: string, cqContext: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteCqModalStore = create<DeleteCqModalState>((set) => ({
  isOpen: false,
  cqId: null,
  cqContext: null,
  selectedIds: [],
  openModal: (cqId: string, cqContext: string) =>
    set({ isOpen: true, cqId, cqContext, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, cqId: null, cqContext: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, cqId: null, cqContext: null, selectedIds: [] }),
}))

import { create } from "zustand"

interface DeletePbqModalState {
  isOpen: boolean
  pbqId: string | null
  pbqContext: string | null
  selectedIds: string[]
  openModal: (pbqId: string, pbqContext: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeletePbqModalStore = create<DeletePbqModalState>((set) => ({
  isOpen: false,
  pbqId: null,
  pbqContext: null,
  selectedIds: [],
  openModal: (pbqId: string, pbqContext: string) =>
    set({ isOpen: true, pbqId, pbqContext, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, pbqId: null, pbqContext: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, pbqId: null, pbqContext: null, selectedIds: [] }),
}))

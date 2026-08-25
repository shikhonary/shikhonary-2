import { create } from "zustand"

interface DeleteMcqModalState {
  isOpen: boolean
  mcqId: string | null
  mcqQuestion: string | null
  selectedIds: string[]
  openModal: (mcqId: string, mcqQuestion: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteMcqModalStore = create<DeleteMcqModalState>((set) => ({
  isOpen: false,
  mcqId: null,
  mcqQuestion: null,
  selectedIds: [],
  openModal: (mcqId: string, mcqQuestion: string) =>
    set({ isOpen: true, mcqId, mcqQuestion, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, mcqId: null, mcqQuestion: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, mcqId: null, mcqQuestion: null, selectedIds: [] }),
}))

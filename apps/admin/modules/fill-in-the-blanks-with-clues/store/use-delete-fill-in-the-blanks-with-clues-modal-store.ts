import { create } from "zustand"

interface DeleteFillInTheBlanksWithCluesModalState {
  isOpen: boolean
  fillInTheBlanksId: string | null
  fillInTheBlanksContent: string | null
  selectedIds: string[]
  openModal: (fillInTheBlanksId: string, fillInTheBlanksContent: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteFillInTheBlanksWithCluesModalStore = create<DeleteFillInTheBlanksWithCluesModalState>((set) => ({
  isOpen: false,
  fillInTheBlanksId: null,
  fillInTheBlanksContent: null,
  selectedIds: [],
  openModal: (fillInTheBlanksId: string, fillInTheBlanksContent: string) =>
    set({ isOpen: true, fillInTheBlanksId, fillInTheBlanksContent, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, fillInTheBlanksId: null, fillInTheBlanksContent: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, fillInTheBlanksId: null, fillInTheBlanksContent: null, selectedIds: [] }),
}))

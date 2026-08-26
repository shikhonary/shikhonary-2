import { create } from "zustand"

interface DeleteShortAnswerModalState {
  isOpen: boolean
  isBulkOpen: boolean
  saId: string | null
  questionSnippet: string | null
  selectedIds: string[]
  openModal: (id: string, questionSnippet: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteShortAnswerModalStore = create<DeleteShortAnswerModalState>((set) => ({
  isOpen: false,
  isBulkOpen: false,
  saId: null,
  questionSnippet: null,
  selectedIds: [],
  openModal: (id, questionSnippet) => set({ isOpen: true, saId: id, questionSnippet }),
  openBulkModal: (ids) => set({ isBulkOpen: true, selectedIds: ids }),
  closeModal: () => set({ isOpen: false, isBulkOpen: false, saId: null, questionSnippet: null, selectedIds: [] }),
}))

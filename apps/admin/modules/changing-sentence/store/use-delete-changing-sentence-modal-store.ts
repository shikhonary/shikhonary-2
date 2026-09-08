import { create } from "zustand"

interface DeleteChangingSentenceModalState {
  isOpen: boolean
  targetId: string | null
  targetSnippet: string | null
  selectedIds: string[]
  openModal: (id: string, snippet: string) => void
  openSingleModal: (id: string, snippet: string) => void
  openBulkModal: (selectedIds: string[]) => void
  closeModal: () => void
}

export const useDeleteChangingSentenceModalStore = create<DeleteChangingSentenceModalState>((set) => ({
  isOpen: false,
  targetId: null,
  targetSnippet: null,
  selectedIds: [],
  openModal: (targetId: string, targetSnippet: string) =>
    set({
      isOpen: true,
      targetId,
      targetSnippet,
      selectedIds: [],
    }),
  openSingleModal: (targetId: string, targetSnippet: string) =>
    set({
      isOpen: true,
      targetId,
      targetSnippet,
      selectedIds: [],
    }),
  openBulkModal: (selectedIds: string[]) =>
    set({
      isOpen: true,
      targetId: null,
      targetSnippet: null,
      selectedIds,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      targetId: null,
      targetSnippet: null,
      selectedIds: [],
    }),
}))


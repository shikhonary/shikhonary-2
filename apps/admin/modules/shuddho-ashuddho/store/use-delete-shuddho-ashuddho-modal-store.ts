import { create } from "zustand"

interface DeleteShuddhoAshuddhoModalState {
  isOpen: boolean
  shuddhoAshuddhoId: string | null
  sentenceText: string | null
  selectedIds: string[]
  openModal: (shuddhoAshuddhoId: string, sentenceText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteShuddhoAshuddhoModalStore = create<DeleteShuddhoAshuddhoModalState>((set) => ({
  isOpen: false,
  shuddhoAshuddhoId: null,
  sentenceText: null,
  selectedIds: [],
  openModal: (shuddhoAshuddhoId: string, sentenceText: string) =>
    set({ isOpen: true, shuddhoAshuddhoId, sentenceText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, shuddhoAshuddhoId: null, sentenceText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, shuddhoAshuddhoId: null, sentenceText: null, selectedIds: [] }),
}))

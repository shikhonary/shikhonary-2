import { create } from "zustand"

interface DeleteGenderChangeModalState {
  isOpen: boolean
  genderChangeId: string | null
  wordText: string | null
  selectedIds: string[]
  openModal: (genderChangeId: string, wordText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteGenderChangeModalStore = create<DeleteGenderChangeModalState>((set) => ({
  isOpen: false,
  genderChangeId: null,
  wordText: null,
  selectedIds: [],
  openModal: (genderChangeId: string, wordText: string) =>
    set({ isOpen: true, genderChangeId, wordText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, genderChangeId: null, wordText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, genderChangeId: null, wordText: null, selectedIds: [] }),
}))

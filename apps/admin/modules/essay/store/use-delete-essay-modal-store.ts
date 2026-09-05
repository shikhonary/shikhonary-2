import { create } from "zustand"

interface DeleteEssayModalState {
  isOpen: boolean
  essayId: string | null
  essayTitle: string | null
  selectedIds: string[]
  openModal: (essayId: string, essayTitle: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteEssayModalStore = create<DeleteEssayModalState>((set) => ({
  isOpen: false,
  essayId: null,
  essayTitle: null,
  selectedIds: [],
  openModal: (essayId: string, essayTitle: string) =>
    set({ isOpen: true, essayId, essayTitle, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, essayId: null, essayTitle: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, essayId: null, essayTitle: null, selectedIds: [] }),
}))

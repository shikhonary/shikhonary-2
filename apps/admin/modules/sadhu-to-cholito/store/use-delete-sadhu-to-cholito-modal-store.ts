import { create } from "zustand"

interface DeleteSadhuToCholitoModalState {
  isOpen: boolean
  sadhuToCholitoId: string | null
  sadhuText: string | null
  selectedIds: string[]
  openModal: (sadhuToCholitoId: string, sadhuText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteSadhuToCholitoModalStore = create<DeleteSadhuToCholitoModalState>((set) => ({
  isOpen: false,
  sadhuToCholitoId: null,
  sadhuText: null,
  selectedIds: [],
  openModal: (sadhuToCholitoId: string, sadhuText: string) =>
    set({ isOpen: true, sadhuToCholitoId, sadhuText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, sadhuToCholitoId: null, sadhuText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, sadhuToCholitoId: null, sadhuText: null, selectedIds: [] }),
}))

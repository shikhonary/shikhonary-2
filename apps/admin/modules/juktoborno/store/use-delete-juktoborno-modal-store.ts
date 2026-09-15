import { create } from "zustand"

interface DeleteJuktobornoModalState {
  isOpen: boolean
  juktobornoId: string | null
  juktobornoText: string | null
  selectedIds: string[]
  openModal: (juktobornoId: string, juktobornoText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteJuktobornoModalStore = create<DeleteJuktobornoModalState>((set) => ({
  isOpen: false,
  juktobornoId: null,
  juktobornoText: null,
  selectedIds: [],
  openModal: (juktobornoId: string, juktobornoText: string) =>
    set({ isOpen: true, juktobornoId, juktobornoText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, juktobornoId: null, juktobornoText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, juktobornoId: null, juktobornoText: null, selectedIds: [] }),
}))

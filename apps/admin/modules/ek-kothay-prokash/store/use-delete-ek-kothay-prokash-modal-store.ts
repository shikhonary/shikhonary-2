import { create } from "zustand"

interface DeleteEkKothayProkashModalState {
  isOpen: boolean
  ekKothayProkashId: string | null
  phraseText: string | null
  selectedIds: string[]
  openModal: (ekKothayProkashId: string, phraseText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteEkKothayProkashModalStore = create<DeleteEkKothayProkashModalState>((set) => ({
  isOpen: false,
  ekKothayProkashId: null,
  phraseText: null,
  selectedIds: [],
  openModal: (ekKothayProkashId: string, phraseText: string) =>
    set({ isOpen: true, ekKothayProkashId, phraseText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, ekKothayProkashId: null, phraseText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, ekKothayProkashId: null, phraseText: null, selectedIds: [] }),
}))

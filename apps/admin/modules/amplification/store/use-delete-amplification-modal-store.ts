import { create } from "zustand"

interface DeleteAmplificationModalState {
  isOpen: boolean
  amplificationId: string | null
  amplificationName: string | null
  selectedIds: string[]
  openModal: (amplificationId: string, amplificationName: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteAmplificationModalStore = create<DeleteAmplificationModalState>((set) => ({
  isOpen: false,
  amplificationId: null,
  amplificationName: null,
  selectedIds: [],
  openModal: (amplificationId: string, amplificationName: string) =>
    set({ isOpen: true, amplificationId, amplificationName, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, amplificationId: null, amplificationName: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, amplificationId: null, amplificationName: null, selectedIds: [] }),
}))

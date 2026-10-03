import { create } from "zustand"

interface DeleteDanBamMilkoronModalState {
  isOpen: boolean
  danBamMilkoronId: string | null
  itemText: string | null
  selectedIds: string[]
  openModal: (danBamMilkoronId: string, itemText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteDanBamMilkoronModalStore = create<DeleteDanBamMilkoronModalState>((set) => ({
  isOpen: false,
  danBamMilkoronId: null,
  itemText: null,
  selectedIds: [],
  openModal: (danBamMilkoronId: string, itemText: string) =>
    set({ isOpen: true, danBamMilkoronId, itemText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, danBamMilkoronId: null, itemText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, danBamMilkoronId: null, itemText: null, selectedIds: [] }),
}))

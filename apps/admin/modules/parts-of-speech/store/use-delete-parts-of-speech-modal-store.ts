import { create } from "zustand"

interface DeletePartsOfSpeechModalState {
  isOpen: boolean
  partsOfSpeechId: string | null
  partsOfSpeechContent: string | null
  selectedIds: string[]
  openModal: (partsOfSpeechId: string, partsOfSpeechContent: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeletePartsOfSpeechModalStore = create<DeletePartsOfSpeechModalState>((set) => ({
  isOpen: false,
  partsOfSpeechId: null,
  partsOfSpeechContent: null,
  selectedIds: [],
  openModal: (partsOfSpeechId: string, partsOfSpeechContent: string) =>
    set({ isOpen: true, partsOfSpeechId, partsOfSpeechContent, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, partsOfSpeechId: null, partsOfSpeechContent: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, partsOfSpeechId: null, partsOfSpeechContent: null, selectedIds: [] }),
}))

import { create } from "zustand"

interface DeleteSubstitutionTableModalState {
  isOpen: boolean
  substitutionTableId: string | null
  substitutionTableContent: string | null
  selectedIds: string[]
  openModal: (substitutionTableId: string, substitutionTableContent: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteSubstitutionTableModalStore = create<DeleteSubstitutionTableModalState>((set) => ({
  isOpen: false,
  substitutionTableId: null,
  substitutionTableContent: null,
  selectedIds: [],
  openModal: (substitutionTableId: string, substitutionTableContent: string) =>
    set({ isOpen: true, substitutionTableId, substitutionTableContent, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, substitutionTableId: null, substitutionTableContent: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, substitutionTableId: null, substitutionTableContent: null, selectedIds: [] }),
}))

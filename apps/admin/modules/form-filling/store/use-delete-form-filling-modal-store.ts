import { create } from "zustand"

interface DeleteFormFillingModalState {
  isOpen: boolean
  formFillingId: string | null
  scenarioText: string | null
  selectedIds: string[]
  openModal: (formFillingId: string, scenarioText: string) => void
  openBulkModal: (ids: string[]) => void
  closeModal: () => void
}

export const useDeleteFormFillingModalStore = create<DeleteFormFillingModalState>((set) => ({
  isOpen: false,
  formFillingId: null,
  scenarioText: null,
  selectedIds: [],
  openModal: (formFillingId: string, scenarioText: string) =>
    set({ isOpen: true, formFillingId, scenarioText, selectedIds: [] }),
  openBulkModal: (selectedIds: string[]) =>
    set({ isOpen: true, formFillingId: null, scenarioText: null, selectedIds }),
  closeModal: () =>
    set({ isOpen: false, formFillingId: null, scenarioText: null, selectedIds: [] }),
}))

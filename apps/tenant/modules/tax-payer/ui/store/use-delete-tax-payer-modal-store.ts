import { create } from "zustand"

interface DeleteTaxPayerModalState {
  isOpen: boolean
  id: string | null
  name: string | null
  openModal: (id: string, name: string) => void
  closeModal: () => void
}

export const useDeleteTaxPayerModalStore = create<DeleteTaxPayerModalState>((set) => ({
  isOpen: false,
  id: null,
  name: null,
  openModal: (id, name) => set({ isOpen: true, id, name }),
  closeModal: () => set({ isOpen: false, id: null, name: null }),
}))

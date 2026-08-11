import { create } from "zustand"

interface DeleteWardModalState {
  isOpen: boolean
  id: string | null
  name: string | null
  openModal: (id: string, name: string) => void
  closeModal: () => void
}

export const useDeleteWardModalStore = create<DeleteWardModalState>((set) => ({
  isOpen: false,
  id: null,
  name: null,
  openModal: (id, name) => set({ isOpen: true, id, name }),
  closeModal: () => set({ isOpen: false, id: null, name: null }),
}))

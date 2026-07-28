import { create } from "zustand"

interface CreateRoleModalState {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const useCreateRoleModalStore = create<CreateRoleModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}))

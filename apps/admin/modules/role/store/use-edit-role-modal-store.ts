import { create } from "zustand"

interface EditRoleModalState {
  isOpen: boolean
  roleId: string | null
  openModal: (roleId: string) => void
  closeModal: () => void
}

export const useEditRoleModalStore = create<EditRoleModalState>((set) => ({
  isOpen: false,
  roleId: null,
  openModal: (roleId: string) => set({ isOpen: true, roleId }),
  closeModal: () => set({ isOpen: false, roleId: null }),
}))

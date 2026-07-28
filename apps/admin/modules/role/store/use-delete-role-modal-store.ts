import { create } from "zustand"

interface DeleteRoleModalState {
  isOpen: boolean
  roleId: string | null
  roleName: string | null
  openModal: (roleId: string, roleName: string) => void
  closeModal: () => void
}

export const useDeleteRoleModalStore = create<DeleteRoleModalState>((set) => ({
  isOpen: false,
  roleId: null,
  roleName: null,
  openModal: (roleId: string, roleName: string) =>
    set({ isOpen: true, roleId, roleName }),
  closeModal: () => set({ isOpen: false, roleId: null, roleName: null }),
}))

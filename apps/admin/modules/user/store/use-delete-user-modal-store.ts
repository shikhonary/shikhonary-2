import { create } from "zustand"

interface DeleteUserModalState {
  isOpen: boolean
  userId: string | null
  userName: string | null
  openModal: (userId: string, userName: string) => void
  closeModal: () => void
}

export const useDeleteUserModalStore = create<DeleteUserModalState>((set) => ({
  isOpen: false,
  userId: null,
  userName: null,
  openModal: (userId: string, userName: string) =>
    set({ isOpen: true, userId, userName }),
  closeModal: () => set({ isOpen: false, userId: null, userName: null }),
}))

import { create } from "zustand"

interface ChangeRoleModalState {
  isOpen: boolean
  userId: string | null
  userName: string | null
  currentRoleIds: string[]
  openModal: (userId: string, userName: string, currentRoleIds: string[]) => void
  closeModal: () => void
}

export const useChangeRoleModalStore = create<ChangeRoleModalState>((set) => ({
  isOpen: false,
  userId: null,
  userName: null,
  currentRoleIds: [],
  openModal: (userId: string, userName: string, currentRoleIds: string[]) =>
    set({ isOpen: true, userId, userName, currentRoleIds }),
  closeModal: () => set({ isOpen: false, userId: null, userName: null, currentRoleIds: [] }),
}))

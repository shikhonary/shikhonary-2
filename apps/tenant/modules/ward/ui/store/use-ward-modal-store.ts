import { create } from "zustand"

export interface Ward {
  id: string
  name: string
  nameBn: string
  createdAt?: string | Date
}

interface WardModalState {
  isOpen: boolean
  ward: Ward | null
  openModal: (ward?: Ward | null) => void
  closeModal: () => void
}

export const useWardModalStore = create<WardModalState>((set) => ({
  isOpen: false,
  ward: null,
  openModal: (ward = null) => set({ isOpen: true, ward }),
  closeModal: () => set({ isOpen: false, ward: null }),
}))

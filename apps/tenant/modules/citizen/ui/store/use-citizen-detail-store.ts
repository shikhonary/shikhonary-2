import { create } from "zustand"

interface CitizenDetailState {
  isOpen: boolean
  citizenId: string | null
  openSheet: (id: string) => void
  closeSheet: () => void
}

export const useCitizenDetailStore = create<CitizenDetailState>((set) => ({
  isOpen: false,
  citizenId: null,
  openSheet: (id) => set({ isOpen: true, citizenId: id }),
  closeSheet: () => set({ isOpen: false, citizenId: null }),
}))

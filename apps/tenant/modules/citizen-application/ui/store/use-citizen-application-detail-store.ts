import { create } from "zustand"

interface CitizenApplicationDetailState {
  isOpen: boolean
  applicationId: string | null
  openSheet: (id: string) => void
  closeSheet: () => void
}

export const useCitizenApplicationDetailStore = create<CitizenApplicationDetailState>((set) => ({
  isOpen: false,
  applicationId: null,
  openSheet: (id) => set({ isOpen: true, applicationId: id }),
  closeSheet: () => set({ isOpen: false, applicationId: null }),
}))

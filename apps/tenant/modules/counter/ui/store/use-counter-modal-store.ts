import { create } from "zustand"

export interface Counter {
  id: string
  key: string
  value: number
  createdAt: Date | string | any
  updatedAt: Date | string | any
}

interface CounterModalState {
  isOpen: boolean
  mode: "create" | "edit" | "adjust" | null
  counter: Counter | null
  openModal: (mode: "create" | "edit" | "adjust", counter?: Counter | null) => void
  closeModal: () => void
}

export const useCounterModalStore = create<CounterModalState>((set) => ({
  isOpen: false,
  mode: null,
  counter: null,
  openModal: (mode, counter = null) => set({ isOpen: true, mode, counter }),
  closeModal: () => set({ isOpen: false, mode: null, counter: null }),
}))

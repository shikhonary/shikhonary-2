import { create } from "zustand"

interface DeleteSubscriptionPlanModalState {
  isOpen: boolean
  planId: string | null
  planName: string | null
  openModal: (planId: string, planName: string) => void
  closeModal: () => void
}

export const useDeleteSubscriptionPlanModalStore = create<DeleteSubscriptionPlanModalState>((set) => ({
  isOpen: false,
  planId: null,
  planName: null,
  openModal: (planId: string, planName: string) =>
    set({ isOpen: true, planId, planName }),
  closeModal: () => set({ isOpen: false, planId: null, planName: null }),
}))

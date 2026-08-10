import { create } from "zustand"

interface InvitationModalState {
  isOpen: boolean
  tenantId: string | null
  tenantName: string | null
  openModal: (tenantId: string, tenantName: string) => void
  closeModal: () => void
}

export const useInvitationModalStore = create<InvitationModalState>((set) => ({
  isOpen: false,
  tenantId: null,
  tenantName: null,
  openModal: (tenantId: string, tenantName: string) =>
    set({ isOpen: true, tenantId, tenantName }),
  closeModal: () => set({ isOpen: false, tenantId: null, tenantName: null }),
}))

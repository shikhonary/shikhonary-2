import { create } from "zustand";

interface AssistantState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  activePaperId: string | null;
  setActivePaperId: (id: string | null) => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  activePaperId: null,
  setActivePaperId: (activePaperId) => set({ activePaperId }),
}));

import { create } from "zustand"

interface TemplatePickerModalState {
  isOpen: boolean
  onSelectTemplate?: (template: any) => void
  openModal: (onSelectTemplate?: (template: any) => void) => void
  closeModal: () => void
}

export const useTemplatePickerModalStore = create<TemplatePickerModalState>((set) => ({
  isOpen: false,
  onSelectTemplate: undefined,
  openModal: (onSelectTemplate) => set({ isOpen: true, onSelectTemplate }),
  closeModal: () => set({ isOpen: false, onSelectTemplate: undefined }),
}))

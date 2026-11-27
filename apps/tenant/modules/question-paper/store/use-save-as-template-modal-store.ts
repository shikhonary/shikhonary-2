import { create } from "zustand"

export interface OpenSaveAsTemplateModalOptions {
  paperId: string
  paperTitle?: string | null
  initialTitle?: string | null
  subjectName?: string | null
  defaultGeneric?: boolean
}

interface SaveAsTemplateModalState {
  isOpen: boolean
  paperId: string | null
  paperTitle: string | null
  subjectName?: string | null
  defaultGeneric?: boolean
  openModal: (
    paperIdOrOptions: string | OpenSaveAsTemplateModalOptions,
    paperTitle?: string | null,
    subjectName?: string | null
  ) => void
  closeModal: () => void
}

export const useSaveAsTemplateModalStore = create<SaveAsTemplateModalState>((set) => ({
  isOpen: false,
  paperId: null,
  paperTitle: null,
  subjectName: null,
  defaultGeneric: true,
  openModal: (paperIdOrOptions, paperTitle, subjectName) => {
    if (typeof paperIdOrOptions === "object") {
      set({
        isOpen: true,
        paperId: paperIdOrOptions.paperId,
        paperTitle: paperIdOrOptions.initialTitle || paperIdOrOptions.paperTitle || null,
        subjectName: paperIdOrOptions.subjectName || null,
        defaultGeneric: paperIdOrOptions.defaultGeneric ?? true,
      })
    } else {
      set({
        isOpen: true,
        paperId: paperIdOrOptions,
        paperTitle: paperTitle || null,
        subjectName: subjectName || null,
        defaultGeneric: true,
      })
    }
  },
  closeModal: () => set({ isOpen: false, paperId: null, paperTitle: null, subjectName: null }),
}))

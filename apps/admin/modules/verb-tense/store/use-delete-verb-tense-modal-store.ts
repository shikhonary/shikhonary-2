import { create } from "zustand"

interface DeleteVerbTenseModalState {
  isOpen: boolean
  isBulkOpen: boolean
  deleteId: string | null
  titleSnippet: string | null
  bulkIds: string[]
  openModal: (id: string, titleSnippet: string) => void
  closeModal: () => void
  openBulkModal: (ids: string[]) => void
  closeBulkModal: () => void
}

export const useDeleteVerbTenseModalStore = create<DeleteVerbTenseModalState>(
  (set) => ({
    isOpen: false,
    isBulkOpen: false,
    deleteId: null,
    titleSnippet: null,
    bulkIds: [],

    openModal: (id, titleSnippet) =>
      set({
        isOpen: true,
        deleteId: id,
        titleSnippet,
      }),

    closeModal: () =>
      set({
        isOpen: false,
        deleteId: null,
        titleSnippet: null,
      }),

    openBulkModal: (ids) =>
      set({
        isBulkOpen: true,
        bulkIds: ids,
      }),

    closeBulkModal: () =>
      set({
        isBulkOpen: false,
        bulkIds: [],
      }),
  })
)

import { create } from "zustand"

interface DeleteStudentModalState {
  isOpen: boolean
  studentId: string | null
  studentName: string | null
  openModal: (studentId: string, studentName: string) => void
  closeModal: () => void
}

export const useDeleteStudentModalStore = create<DeleteStudentModalState>((set) => ({
  isOpen: false,
  studentId: null,
  studentName: null,
  openModal: (studentId: string, studentName: string) =>
    set({ isOpen: true, studentId, studentName }),
  closeModal: () => set({ isOpen: false, studentId: null, studentName: null }),
}))

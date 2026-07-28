"use client"

import { DeleteAcademicClassModal } from "@/modules/academic-class/components/delete-academic-class-modal"
import { DeleteSubjectModal } from "@/modules/subject/components/delete-subject-modal"
import { DeleteUserModal, ChangeRoleModal } from "@/modules/user/components"
import { DeleteStudentModal } from "@/modules/student/components/delete-student-modal"

export function ModalProvider() {
  return (
    <>
      <DeleteAcademicClassModal />
      <DeleteSubjectModal />
      <DeleteUserModal />
      <ChangeRoleModal />
      <DeleteStudentModal />
    </>
  )
}

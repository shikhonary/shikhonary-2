"use client"

import { DeleteUserModal, ChangeRoleModal } from "@/modules/user/components"

export function ModalProvider() {
  return (
    <>
      <DeleteUserModal />
      <ChangeRoleModal />
    </>
  )
}

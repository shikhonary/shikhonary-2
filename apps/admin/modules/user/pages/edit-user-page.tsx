"use client"

import { EditUserView } from "../components/edit-user-view"

interface EditUserPageProps {
  userId: string
}

export function EditUserPage({ userId }: EditUserPageProps) {
  return <EditUserView userId={userId} />
}

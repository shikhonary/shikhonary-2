"use client"

import { EditGenderChangeView } from "../components/edit-gender-change-view"

interface EditGenderChangePageProps {
  id: string
}

export function EditGenderChangePage({ id }: EditGenderChangePageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EditGenderChangeView id={id} />
    </div>
  )
}

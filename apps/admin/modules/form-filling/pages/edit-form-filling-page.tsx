"use client"

import { EditFormFillingView } from "../components/edit-form-filling-view"

interface EditFormFillingPageProps {
  id: string
}

export function EditFormFillingPage({ id }: EditFormFillingPageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EditFormFillingView id={id} />
    </div>
  )
}

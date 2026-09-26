"use client"

import { EditOppositeWordView } from "../components/edit-opposite-word-view"

interface EditOppositeWordPageProps {
  id: string
}

export function EditOppositeWordPage({ id }: EditOppositeWordPageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EditOppositeWordView id={id} />
    </div>
  )
}

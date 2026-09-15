"use client"

import { EditMakeSentencesView } from "../components/edit-make-sentences-view"

interface EditMakeSentencesPageProps {
  id: string
}

export function EditMakeSentencesPage({ id }: EditMakeSentencesPageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EditMakeSentencesView id={id} />
    </div>
  )
}

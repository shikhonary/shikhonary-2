"use client"

import { EditMakeSentencesView } from "../components/edit-make-sentences-view"

interface EditMakeSentencesPageProps {
  id: string
}

export function EditMakeSentencesPage({ id }: EditMakeSentencesPageProps) {
  return <EditMakeSentencesView id={id} />
}

"use client"

import { EditSynonymView } from "../components/edit-synonym-view"

interface EditSynonymPageProps {
  id: string
}

export function EditSynonymPage({ id }: EditSynonymPageProps) {
  return <EditSynonymView id={id} />
}

"use client"

import { EditPoemEssenceView } from "../components/edit-poem-essence-view"

interface EditPoemEssencePageProps {
  id: string
}

export function EditPoemEssencePage({ id }: EditPoemEssencePageProps) {
  return <EditPoemEssenceView id={id} />
}

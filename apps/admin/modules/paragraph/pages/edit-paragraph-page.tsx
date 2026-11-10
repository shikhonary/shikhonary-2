"use client"

import { EditParagraphView } from "../components/edit-paragraph-view"

interface EditParagraphPageProps {
  id: string
}

export function EditParagraphPage({ id }: EditParagraphPageProps) {
  return <EditParagraphView id={id} />
}

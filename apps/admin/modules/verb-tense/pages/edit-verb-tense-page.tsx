"use client"

import { EditVerbTenseView } from "../components/edit-verb-tense-view"

interface EditVerbTensePageProps {
  id: string
}

export function EditVerbTensePage({ id }: EditVerbTensePageProps) {
  return <EditVerbTenseView id={id} />
}

"use client"

import { EditPunctuationView } from "../components/edit-punctuation-view"

export function EditPunctuationPage({ id }: { id?: string } = {}) {
  return <EditPunctuationView id={id} />
}

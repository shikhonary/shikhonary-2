"use client"

import { EditShortAnswerView } from "../components/edit-short-answer-view"

interface EditShortAnswerPageProps {
  id: string
}

export function EditShortAnswerPage({ id }: EditShortAnswerPageProps) {
  return <EditShortAnswerView id={id} />
}

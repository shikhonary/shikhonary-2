"use client"

import { Suspense } from "react"
import { EditShortAnswerView } from "../components/edit-short-answer-view"

interface EditShortAnswerPageProps {
  id: string
}

export function EditShortAnswerPage({ id }: EditShortAnswerPageProps) {
  return (
    <Suspense>
      <EditShortAnswerView id={id} />
    </Suspense>
  )
}

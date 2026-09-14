"use client"

import { EditShortQuestionView } from "../components/edit-short-question-view"

export function EditShortQuestionPage({ shortQuestionId }: { shortQuestionId: string }) {
  return <EditShortQuestionView shortQuestionId={shortQuestionId} />
}

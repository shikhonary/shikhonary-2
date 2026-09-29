"use client"

import { EditMakeQuestionView } from "../components/edit-make-question-view"

interface EditMakeQuestionPageProps {
  id: string
}

export function EditMakeQuestionPage({ id }: EditMakeQuestionPageProps) {
  return <EditMakeQuestionView id={id} />
}

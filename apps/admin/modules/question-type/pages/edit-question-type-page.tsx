"use client"

import { EditQuestionTypeView } from "../components/edit-question-type-view"

interface EditQuestionTypePageProps {
  questionTypeId: string
}

export function EditQuestionTypePage({ questionTypeId }: EditQuestionTypePageProps) {
  return <EditQuestionTypeView questionTypeId={questionTypeId} />
}

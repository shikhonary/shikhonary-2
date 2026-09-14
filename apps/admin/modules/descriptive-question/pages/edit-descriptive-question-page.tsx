"use client"

import { EditDescriptiveQuestionView } from "../components/edit-descriptive-question-view"

export function EditDescriptiveQuestionPage({ descriptiveQuestionId }: { descriptiveQuestionId: string }) {
  return <EditDescriptiveQuestionView descriptiveQuestionId={descriptiveQuestionId} />
}

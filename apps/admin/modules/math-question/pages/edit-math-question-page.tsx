"use client"

import { EditMathQuestionView } from "../components/edit-math-question-view"

interface EditMathQuestionPageProps {
  mathQuestionId: string
}

export function EditMathQuestionPage({ mathQuestionId }: EditMathQuestionPageProps) {
  return <EditMathQuestionView mathQuestionId={mathQuestionId} />
}

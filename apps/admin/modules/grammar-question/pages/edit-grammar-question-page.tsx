"use client"

import { EditGrammarQuestionView } from "../components/edit-grammar-question-view"

interface EditGrammarQuestionPageProps {
  grammarQuestionId: string
}

export function EditGrammarQuestionPage({ grammarQuestionId }: EditGrammarQuestionPageProps) {
  return <EditGrammarQuestionView grammarQuestionId={grammarQuestionId} />
}

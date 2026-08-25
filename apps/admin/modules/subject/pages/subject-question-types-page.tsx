"use client"

import { SubjectQuestionTypeConfigView } from "../components/subject-question-type-config-view"

interface SubjectQuestionTypesPageProps {
  subjectId: string
}

export function SubjectQuestionTypesPage({ subjectId }: SubjectQuestionTypesPageProps) {
  return <SubjectQuestionTypeConfigView subjectId={subjectId} />
}

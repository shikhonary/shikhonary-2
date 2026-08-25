"use client"

import { EditSubjectView } from "../components/edit-subject-view"

interface EditSubjectPageProps {
  subjectId: string
}

export function EditSubjectPage({ subjectId }: EditSubjectPageProps) {
  return <EditSubjectView subjectId={subjectId} />
}

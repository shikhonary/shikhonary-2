"use client"

import { EditExamView } from "../components/edit-exam-view"

interface EditExamPageProps {
  examId: string
}

export function EditExamPage({ examId }: EditExamPageProps) {
  return <EditExamView examId={examId} />
}

"use client"

import { ExamDetailView } from "../components/exam-detail-view"

interface ExamDetailPageProps {
  examId: string
}

export function ExamDetailPage({ examId }: ExamDetailPageProps) {
  return <ExamDetailView examId={examId} />
}

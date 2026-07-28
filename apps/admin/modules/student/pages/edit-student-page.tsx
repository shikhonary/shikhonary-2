"use client"

import { EditStudentView } from "../components/edit-student-view"

interface EditStudentPageProps {
  studentId: string
}

export function EditStudentPage({ studentId }: EditStudentPageProps) {
  return <EditStudentView studentId={studentId} />
}

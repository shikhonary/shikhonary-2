"use client"

import { EditMcqView } from "../components/edit-mcq-view"

interface EditMcqPageProps {
  id: string
}

export function EditMcqPage({ id }: EditMcqPageProps) {
  return <EditMcqView id={id} />
}

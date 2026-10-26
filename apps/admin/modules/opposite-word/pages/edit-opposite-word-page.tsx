"use client"

import { EditOppositeWordView } from "../components/edit-opposite-word-view"

interface EditOppositeWordPageProps {
  id: string
}

export function EditOppositeWordPage({ id }: EditOppositeWordPageProps) {
  return <EditOppositeWordView id={id} />
}

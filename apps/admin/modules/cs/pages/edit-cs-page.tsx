"use client"

import { EditCsView } from "../components/edit-cs-view"

interface EditCsPageProps {
  id: string
}

export function EditCsPage({ id }: EditCsPageProps) {
  return <EditCsView id={id} />
}

"use client"

import { EditPodNirnoyView } from "../components/edit-pod-nirnoy-view"

interface EditPodNirnoyPageProps {
  id: string
}

export function EditPodNirnoyPage({ id }: EditPodNirnoyPageProps) {
  return <EditPodNirnoyView id={id} />
}

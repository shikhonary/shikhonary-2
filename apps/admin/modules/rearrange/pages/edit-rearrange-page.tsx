"use client"

import { EditRearrangeView } from "../components/edit-rearrange-view"

interface EditRearrangePageProps {
  id: string
}

export function EditRearrangePage({ id }: EditRearrangePageProps) {
  return <EditRearrangeView id={id} />
}

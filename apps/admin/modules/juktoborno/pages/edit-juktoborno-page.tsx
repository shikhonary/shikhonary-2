"use client"

import { EditJuktobornoView } from "../components/edit-juktoborno-view"

interface EditJuktobornoPageProps {
  id: string
}

export function EditJuktobornoPage({ id }: EditJuktobornoPageProps) {
  return <EditJuktobornoView id={id} />
}

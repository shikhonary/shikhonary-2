"use client"

import { EditShortCompositionView } from "../components/edit-short-composition-view"

export function EditShortCompositionPage({ id }: { id?: string } = {}) {
  return <EditShortCompositionView id={id} />
}

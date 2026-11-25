"use client"

import { Suspense } from "react"
import { EditEkKothayProkashView } from "../components/edit-ek-kothay-prokash-view"

interface EditEkKothayProkashPageProps {
  id: string
}

export function EditEkKothayProkashPage({ id }: EditEkKothayProkashPageProps) {
  return (
    <Suspense>
      <EditEkKothayProkashView id={id} />
    </Suspense>
  )
}

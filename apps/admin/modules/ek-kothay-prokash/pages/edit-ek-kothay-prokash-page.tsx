"use client"

import { EditEkKothayProkashView } from "../components/edit-ek-kothay-prokash-view"

interface EditEkKothayProkashPageProps {
  id: string
}

export function EditEkKothayProkashPage({ id }: EditEkKothayProkashPageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EditEkKothayProkashView id={id} />
    </div>
  )
}

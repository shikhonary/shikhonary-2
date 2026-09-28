"use client"

import { EditSadhuToCholitoView } from "../components/edit-sadhu-to-cholito-view"

interface EditSadhuToCholitoPageProps {
  id: string
}

export function EditSadhuToCholitoPage({ id }: EditSadhuToCholitoPageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EditSadhuToCholitoView id={id} />
    </div>
  )
}

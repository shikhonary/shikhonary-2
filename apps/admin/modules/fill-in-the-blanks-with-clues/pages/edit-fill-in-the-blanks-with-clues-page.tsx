"use client"

import { EditFillInTheBlanksWithCluesView } from "../components/edit-fill-in-the-blanks-with-clues-view"

export function EditFillInTheBlanksWithCluesPage({ id }: { id?: string }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EditFillInTheBlanksWithCluesView id={id} />
    </div>
  )
}

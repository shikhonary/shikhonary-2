"use client"

import { Suspense } from "react"
import { EditFillInTheBlanksWithCluesView } from "../components/edit-fill-in-the-blanks-with-clues-view"

export function EditFillInTheBlanksWithCluesPage({ id }: { id?: string }) {
  return (
    <Suspense>
      <EditFillInTheBlanksWithCluesView id={id} />
    </Suspense>
  )
}

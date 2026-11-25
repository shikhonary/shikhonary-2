"use client"

import { Suspense } from "react"
import { EditFillInTheBlanksWithoutCluesView } from "../components/edit-fill-in-the-blanks-without-clues-view"

export function EditFillInTheBlanksWithoutCluesPage({ id }: { id?: string }) {
  return (
    <Suspense>
      <EditFillInTheBlanksWithoutCluesView id={id} />
    </Suspense>
  )
}

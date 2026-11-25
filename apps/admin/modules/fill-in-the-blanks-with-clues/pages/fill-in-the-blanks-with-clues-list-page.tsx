"use client"

import { Suspense } from "react"
import { FillInTheBlanksWithCluesListView } from "../components/fill-in-the-blanks-with-clues-list-view"

export function FillInTheBlanksWithCluesListPage() {
  return (
    <Suspense>
      <FillInTheBlanksWithCluesListView />
    </Suspense>
  )
}

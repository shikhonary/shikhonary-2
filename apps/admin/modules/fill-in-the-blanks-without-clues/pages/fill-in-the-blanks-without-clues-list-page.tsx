"use client"

import { Suspense } from "react"
import { FillInTheBlanksWithoutCluesListView } from "../components/fill-in-the-blanks-without-clues-list-view"

export function FillInTheBlanksWithoutCluesListPage() {
  return (
    <Suspense>
      <FillInTheBlanksWithoutCluesListView />
    </Suspense>
  )
}
